import { useMemo } from "react";
import { useTasks } from "@/hooks/useTasks";
import { useCategories } from "@/hooks/useCategories";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";

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
        completedCount: 0
      });
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

    let totalCompleted = 0;
    let totalActualMinutes = 0;
    let totalPlannedMinutes = 0;

    tasks.forEach(task => {
      const createdStr = getLocalDateStr(task.created_at);
      const completedStr = getLocalDateStr(task.completed_at);
      const catId = task.category_id || 'uncategorized';

      if (createdStr && trendMap.has(createdStr)) {
        trendMap.get(createdStr).planned += task.estimated_minutes || 0;
        if (catMap.has(catId)) catMap.get(catId).planned += task.estimated_minutes || 0;
        totalPlannedMinutes += task.estimated_minutes || 0;
      }

      if (task.status === "completed" && completedStr && trendMap.has(completedStr)) {
        trendMap.get(completedStr).completedCount += 1;
        totalCompleted += 1;
        
        const hasLinkedEvent = events.some(e => e.task_id === task.id);
        if (!hasLinkedEvent && task.actual_minutes) {
          trendMap.get(completedStr).actual += task.actual_minutes;
          if (catMap.has(catId)) catMap.get(catId).actual += task.actual_minutes;
          totalActualMinutes += task.actual_minutes;
        }
      }
    });

    events.forEach(event => {
      const startStr = getLocalDateStr(event.start_time);
      const completedStr = getLocalDateStr(event.completed_at);
      const catId = event.category_id || (event.task?.category_id) || 'uncategorized';
      
      const duration = Math.round((new Date(event.end_time).getTime() - new Date(event.start_time).getTime()) / 60000);

      if (startStr && trendMap.has(startStr)) {
        if (!event.task_id) {
          trendMap.get(startStr).planned += duration;
          if (catMap.has(catId)) catMap.get(catId).planned += duration;
          totalPlannedMinutes += duration;
        }
      }

      if (event.completed && completedStr && trendMap.has(completedStr)) {
        if (!event.task_id) {
          trendMap.get(completedStr).completedCount += 1;
          totalCompleted += 1;
        }

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
