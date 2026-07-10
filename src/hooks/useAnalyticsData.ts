import { useMemo } from "react";
import { useTasks } from "@/hooks/useTasks";
import { useCategories } from "@/hooks/useCategories";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import { rrulestr } from "rrule";

export function useAnalyticsData(dateRangeStr: string) {
  const { tasks } = useTasks();
  const { categories } = useCategories();
  const { events } = useCalendarEvents();
  
  return useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let rangeStartDate = new Date(today);
    let rangeEndDate = new Date(today);
    rangeEndDate.setHours(23, 59, 59, 999);

    let prevStartDate = new Date(today);
    let prevEndDate = new Date(today);

    if (dateRangeStr === "today") {
      rangeStartDate.setHours(0, 0, 0, 0);
      prevStartDate = new Date(rangeStartDate);
      prevStartDate.setDate(prevStartDate.getDate() - 1);
      prevEndDate = new Date(rangeStartDate);
      prevEndDate.setHours(-1, 59, 59, 999);
    } else if (dateRangeStr === "week") {
      const day = today.getDay() || 7;
      rangeStartDate.setDate(today.getDate() - day + 1);
      rangeStartDate.setHours(0, 0, 0, 0);
      rangeEndDate = new Date(rangeStartDate);
      rangeEndDate.setDate(rangeStartDate.getDate() + 6);
      rangeEndDate.setHours(23, 59, 59, 999);
      
      prevStartDate = new Date(rangeStartDate);
      prevStartDate.setDate(prevStartDate.getDate() - 7);
      prevEndDate = new Date(rangeStartDate);
      prevEndDate.setHours(-1, 59, 59, 999);
    } else if (dateRangeStr.startsWith("month-")) {
      const [_, year, month] = dateRangeStr.split("-");
      rangeStartDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      rangeEndDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59, 999);
      
      prevStartDate = new Date(rangeStartDate);
      prevStartDate.setMonth(prevStartDate.getMonth() - 1);
      prevEndDate = new Date(rangeStartDate);
      prevEndDate.setHours(-1, 59, 59, 999);
    } else if (dateRangeStr === "all") {
      let earliest = today.getTime();
      tasks.forEach(t => {
        const d = new Date(t.created_at).getTime();
        if (d < earliest) earliest = d;
      });
      events.forEach(e => {
        const d = new Date(e.start_time).getTime();
        if (d < earliest) earliest = d;
      });
      rangeStartDate = new Date(earliest);
      rangeStartDate.setHours(0, 0, 0, 0);
      prevStartDate = new Date(earliest);
      prevEndDate = new Date(earliest);
    } else {
      const days = parseInt(dateRangeStr) || 7;
      rangeStartDate.setDate(rangeStartDate.getDate() - (days - 1));
      rangeStartDate.setHours(0, 0, 0, 0);
      
      prevStartDate = new Date(rangeStartDate);
      prevStartDate.setDate(prevStartDate.getDate() - days);
      prevEndDate = new Date(rangeStartDate);
      prevEndDate.setHours(-1, 59, 59, 999);
    }

    const isAllTime = dateRangeStr === "all";
    
    const getLocalDateStr = (dateParam: Date | string | null) => {
      if (!dateParam) return null;
      const d = new Date(dateParam);
      if (isNaN(d.getTime())) return null;
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    const isToday = dateRangeStr === "today";
    
    const getGroupKey = (d: Date) => {
      if (isAllTime) {
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      } else if (isToday) {
        return String(d.getHours()).padStart(2, '0');
      } else {
        return getLocalDateStr(d)!;
      }
    };

    const trendMap = new Map();
    const initTrendEntry = (key: string, label: string) => {
      trendMap.set(key, {
        dateStr: key,
        label,
        planned: 0,
        actual: 0,
        completedCount: 0,
        added: 0,
        statusCompleted: 0,
        statusPartial: 0,
        statusSkipped: 0
      });
    };

    if (isAllTime) {
      let currentMonth = new Date(rangeStartDate);
      currentMonth.setDate(1);
      while (currentMonth <= rangeEndDate) {
        const key = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;
        const shortYear = String(currentMonth.getFullYear()).slice(2);
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        initTrendEntry(key, `${monthNames[currentMonth.getMonth()]} '${shortYear}`);
        currentMonth.setMonth(currentMonth.getMonth() + 1);
      }
    } else if (isToday) {
      for (let i = 0; i <= 23; i++) {
        const key = String(i).padStart(2, '0');
        initTrendEntry(key, `${key}:00`);
      }
    } else {
      let currentDay = new Date(rangeStartDate);
      while (currentDay <= rangeEndDate) {
        const key = getLocalDateStr(currentDay)!;
        initTrendEntry(key, `${currentDay.getMonth() + 1}/${currentDay.getDate()}`);
        currentDay.setDate(currentDay.getDate() + 1);
      }
    }

    const catMap = new Map();
    categories.forEach(cat => {
      catMap.set(cat.id, {
        name: cat.name,
        color: cat.color,
        actual: 0,
        planned: 0
      });
    });
    catMap.set('uncategorized', {
      name: 'Uncategorized',
      color: '#7a7a9e',
      actual: 0,
      planned: 0
    });

    let totalTasks = 0;
    let estimatedTimeRemaining = 0;
    let totalCompleted = 0;
    let totalActualMinutes = 0;
    let totalPlannedMinutes = 0;
    let completedPlannedMinutes = 0;

    let prevTotalActualMinutes = 0;
    let prevCompletedPlannedMinutes = 0;

    const completedEventTaskIds = new Set(
      events.filter(e => e.status && e.status !== "not_started" && e.status !== "in_progress").map(e => e.task_id).filter(Boolean)
    );
    const taskIdsWithEvents = new Set(
      events.map(e => e.task_id).filter(Boolean)
    );

    tasks.forEach(task => {
      const createdDate = new Date(task.created_at);
      const catId = task.category_id || 'uncategorized';
      const hasEvent = taskIdsWithEvents.has(task.id);

      // Planned Time & Added Tasks
      if (createdDate >= rangeStartDate && createdDate <= rangeEndDate) {
        const groupKey = getGroupKey(createdDate);
        if (!hasEvent && groupKey && trendMap.has(groupKey)) {
          trendMap.get(groupKey).planned += task.estimated_minutes || 0;
          if (catMap.has(catId)) catMap.get(catId).planned += task.estimated_minutes || 0;
          totalPlannedMinutes += task.estimated_minutes || 0;
          trendMap.get(groupKey).added += 1;
          
          totalTasks += 1;
          if (task.status !== "completed" && task.status !== "partial" && task.status !== "skipped") {
            estimatedTimeRemaining += task.estimated_minutes || 0;
          }
        }
      }

      // Actuals & Completion
      if (task.status && task.status !== "not_started" && task.status !== "in_progress" && task.completed_at) {
        const completedDate = new Date(task.created_at);
        if (completedDate >= rangeStartDate && completedDate <= rangeEndDate) {
          const groupKey = getGroupKey(completedDate);
          const isEventCompleted = completedEventTaskIds.has(task.id);
          if (!isEventCompleted && groupKey && trendMap.has(groupKey)) {
            // Update status counters
            if (task.status === "completed") trendMap.get(groupKey).statusCompleted += 1;
            if (task.status === "partial") trendMap.get(groupKey).statusPartial += 1;
            if (task.status === "skipped") trendMap.get(groupKey).statusSkipped += 1;

            if (task.status === "completed") {
              trendMap.get(groupKey).completedCount += 1;
              totalCompleted += 1;
              
              const actual = task.actual_minutes || task.estimated_minutes || 0;
              trendMap.get(groupKey).actual += actual;
              if (catMap.has(catId)) catMap.get(catId).actual += actual;
              totalActualMinutes += actual;
              completedPlannedMinutes += task.estimated_minutes || 0;
            }
          }
        } else if (!isAllTime && completedDate >= prevStartDate && completedDate <= prevEndDate) {
          const isEventCompleted = completedEventTaskIds.has(task.id);
          if (!isEventCompleted && task.status === "completed") {
            const actual = task.actual_minutes || task.estimated_minutes || 0;
            prevTotalActualMinutes += actual;
            prevCompletedPlannedMinutes += task.estimated_minutes || 0;
          }
        }
      }
    });

    events.forEach(event => {
      const catId = (event.task?.category_id) || event.category_id || 'uncategorized';
      const duration = Math.round((new Date(event.end_time).getTime() - new Date(event.start_time).getTime()) / 60000);

      if (event.is_recurring && event.recurrence_rule) {
        try {
          const dtstart = new Date(event.start_time).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
          const ruleStr = `DTSTART:${dtstart}\nRRULE:${event.recurrence_rule}`;
          const rule = rrulestr(ruleStr);
          const occurrences = rule.between(rangeStartDate, rangeEndDate, true);
          
          occurrences.forEach(occ => {
            const groupKey = getGroupKey(occ);
            if (groupKey && trendMap.has(groupKey)) {
              trendMap.get(groupKey).planned += duration;
              if (catMap.has(catId)) catMap.get(catId).planned += duration;
              totalPlannedMinutes += duration;
              trendMap.get(groupKey).added += 1;
              
              totalTasks += 1;
              estimatedTimeRemaining += duration;
            }
          });
        } catch (err) {
          console.error("Failed to parse RRULE", err);
        }
      } else {
        const startDate = new Date(event.start_time);
        if (startDate >= rangeStartDate && startDate <= rangeEndDate) {
          const groupKey = getGroupKey(startDate);
          if (groupKey && trendMap.has(groupKey)) {
            trendMap.get(groupKey).planned += duration;
            if (catMap.has(catId)) catMap.get(catId).planned += duration;
            totalPlannedMinutes += duration;
            trendMap.get(groupKey).added += 1;
            
            totalTasks += 1;
            if (event.status !== "completed" && event.status !== "partial" && event.status !== "skipped") {
              estimatedTimeRemaining += duration;
            }
          }
        }
      }

      if (event.status && event.status !== "not_started" && event.status !== "in_progress" && event.completed_at) {
        const completedDate = new Date(event.start_time);
        if (completedDate >= rangeStartDate && completedDate <= rangeEndDate) {
          const groupKey = getGroupKey(completedDate);
          if (groupKey && trendMap.has(groupKey)) {
            // Update status counters
            if (event.status === "completed") trendMap.get(groupKey).statusCompleted += 1;
            if (event.status === "partial") trendMap.get(groupKey).statusPartial += 1;
            if (event.status === "skipped") trendMap.get(groupKey).statusSkipped += 1;

            if (event.status === "completed") {
              trendMap.get(groupKey).completedCount += 1;
              totalCompleted += 1;

              const actual = event.actual_minutes || duration;
              trendMap.get(groupKey).actual += actual;
              if (catMap.has(catId)) catMap.get(catId).actual += actual;
              totalActualMinutes += actual;
              completedPlannedMinutes += duration;
            }
          }
        } else if (!isAllTime && completedDate >= prevStartDate && completedDate <= prevEndDate) {
          if (event.status === "completed") {
            const actual = event.actual_minutes || duration;
            prevTotalActualMinutes += actual;
            prevCompletedPlannedMinutes += duration;
          }
        }
      }
    });

    let currentStreak = 0;
    const trendArray = Array.from(trendMap.values());
    for (let i = trendArray.length - 1; i >= 0; i--) {
      if (trendArray[i].completedCount > 0) {
        currentStreak++;
      } else if (i !== trendArray.length - 1) {
        break;
      }
    }

    return {
      trendData: trendArray,
      categoryData: Array.from(catMap.values()).filter(c => c.actual > 0 || c.planned > 0).sort((a, b) => b.actual - a.actual),
      kpiData: {
        totalTasks,
        totalCompleted,
        estimatedTimeRemaining,
        totalHours: (totalActualMinutes / 60).toFixed(1),
        efficiency: totalActualMinutes ? Math.round((completedPlannedMinutes / totalActualMinutes) * 100) : 0,
        currentStreak,
        previousTotalHours: (prevTotalActualMinutes / 60).toFixed(1),
        previousEfficiency: prevTotalActualMinutes ? Math.round((prevCompletedPlannedMinutes / prevTotalActualMinutes) * 100) : 0,
      }
    };
  }, [tasks, events, categories, dateRangeStr]);
}

