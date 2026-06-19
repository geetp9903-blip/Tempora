import { useMemo } from "react";
import { useTasks } from "@/hooks/useTasks";
import { useCategories } from "@/hooks/useCategories";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import { rrulestr } from "rrule";

export function useAnalyticsData(dateRangeDays: string) {
  const { tasks } = useTasks();
  const { categories } = useCategories();
  const { events } = useCalendarEvents();
  
  return useMemo(() => {
    const days = parseInt(dateRangeDays);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const getLocalDateStr = (dateParam: Date | string | null) => {
      if (!dateParam) return null;
      const d = new Date(dateParam);
      if (isNaN(d.getTime())) return null;
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    const trendMap = new Map();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = getLocalDateStr(d)!;
      trendMap.set(dateStr, {
        dateStr,
        label: `${d.getMonth() + 1}/${d.getDate()}`,
        planned: 0,
        actual: 0,
        completedCount: 0,
        added: 0 // Track for WeeklyCompletionChart parity if needed
      });
    }

    const rangeStartDate = new Date(today);
    rangeStartDate.setDate(rangeStartDate.getDate() - (days - 1));
    const rangeEndDate = new Date(today);
    rangeEndDate.setHours(23, 59, 59, 999);

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

    let totalCompleted = 0;
    let totalActualMinutes = 0;
    let totalPlannedMinutes = 0;

    // Track completed tasks and task ids that have calendar events
    const completedEventTaskIds = new Set(
      events.filter(e => e.completed).map(e => e.task_id).filter(Boolean)
    );
    const taskIdsWithEvents = new Set(
      events.map(e => e.task_id).filter(Boolean)
    );

    tasks.forEach(task => {
      const createdStr = getLocalDateStr(task.created_at);
      const completedStr = getLocalDateStr(task.completed_at);
      const catId = task.category_id || 'uncategorized';

      // 1. Planned Time: Only count if task is standalone (no linked calendar events).
      // If there is a linked calendar event, the event duration counts as planned time on its occurrence day(s).
      const hasEvent = taskIdsWithEvents.has(task.id);
      if (!hasEvent && createdStr && trendMap.has(createdStr)) {
        trendMap.get(createdStr).planned += task.estimated_minutes || 0;
        if (catMap.has(catId)) catMap.get(catId).planned += task.estimated_minutes || 0;
        totalPlannedMinutes += task.estimated_minutes || 0;
      }

      // 2. Actuals & Completion: Only count if status is completed AND the linked event is not completed (or there's no linked event).
      // This prevents double-counting when both are completed, while ensuring standalone tasks are accounted for.
      if (task.status === "completed" && completedStr && trendMap.has(completedStr)) {
        const isEventCompleted = completedEventTaskIds.has(task.id);
        if (!isEventCompleted) {
          trendMap.get(completedStr).completedCount += 1;
          totalCompleted += 1;
          
          const actual = task.actual_minutes || task.estimated_minutes || 0;
          trendMap.get(completedStr).actual += actual;
          if (catMap.has(catId)) catMap.get(catId).actual += actual;
          totalActualMinutes += actual;
        }
      }
    });

    events.forEach(event => {
      const catId = event.category_id || (event.task?.category_id) || 'uncategorized';
      const duration = Math.round((new Date(event.end_time).getTime() - new Date(event.start_time).getTime()) / 60000);

      // 1. Planned Time: Event duration always counts as planned time on its occurrence days, whether linked to a task or not.
      if (event.is_recurring && event.recurrence_rule) {
        // Expand occurrences
        try {
          const dtstart = new Date(event.start_time).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
          const ruleStr = `DTSTART:${dtstart}\nRRULE:${event.recurrence_rule}`;
          const rule = rrulestr(ruleStr);
          const occurrences = rule.between(rangeStartDate, rangeEndDate, true);
          
          occurrences.forEach(occ => {
            const occStr = getLocalDateStr(occ);
            if (occStr && trendMap.has(occStr)) {
              trendMap.get(occStr).planned += duration;
              if (catMap.has(catId)) catMap.get(catId).planned += duration;
              totalPlannedMinutes += duration;
              trendMap.get(occStr).added += 1;
            }
          });
        } catch (err) {
          console.error("Failed to parse RRULE", err);
        }
      } else {
        const startStr = getLocalDateStr(event.start_time);
        if (startStr && trendMap.has(startStr)) {
          trendMap.get(startStr).planned += duration;
          if (catMap.has(catId)) catMap.get(catId).planned += duration;
          totalPlannedMinutes += duration;
          trendMap.get(startStr).added += 1;
        }
      }

      // 2. Actuals & Completion: Count every completed event.
      // (If linked to a task, the task loop will have skipped counting it because isEventCompleted was true).
      const completedStr = getLocalDateStr(event.completed_at);
      if (event.completed && completedStr && trendMap.has(completedStr)) {
        trendMap.get(completedStr).completedCount += 1;
        totalCompleted += 1;

        const actual = event.actual_minutes || duration;
        trendMap.get(completedStr).actual += actual;
        if (catMap.has(catId)) catMap.get(catId).actual += actual;
        totalActualMinutes += actual;
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
        totalCompleted,
        totalHours: (totalActualMinutes / 60).toFixed(1),
        efficiency: totalPlannedMinutes ? Math.round((totalPlannedMinutes / totalActualMinutes) * 100) : 0,
        currentStreak
      }
    };
  }, [tasks, events, categories, dateRangeDays]);
}
