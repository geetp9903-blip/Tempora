import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { Category } from "./useCategories";
import { Task } from "./useTasks";
import { usePageLoader } from "@/providers/PageLoaderProvider";

export type CalendarEvent = {
  id: string;
  user_id: string;
  task_id: string | null;
  category_id: string | null;
  title: string;
  start_time: string;
  end_time: string;
  completed: boolean;
  completed_at: string | null;
  actual_minutes: number | null;
  notes: string | null;
  is_recurring: boolean;
  recurrence_rule: string | null;
  created_at: string;
  category?: Category;
  task?: Task;
  occurrence_start?: string;
  occurrence_end?: string;
};

export function useCalendarEvents(dateRange?: { start: string; end: string }) {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { startLoading, stopLoading } = usePageLoader();

  const query = useQuery({
    queryKey: ["events", dateRange],
    queryFn: async () => {
      let query = supabase
        .from("calendar_events")
        .select(`
          *,
          category:categories(*),
          task:tasks(*)
        `)
        .order("start_time", { ascending: true });

      if (dateRange?.start) {
        query = query.gte("start_time", dateRange.start);
      }
      if (dateRange?.end) {
        query = query.lte("end_time", dateRange.end);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as CalendarEvent[];
    },
  });

  const createMutation = useMutation({
    onMutate: () => {
      startLoading();
    },
    onSettled: () => {
      stopLoading();
    },
    mutationFn: async (newEvent: Omit<CalendarEvent, "id" | "user_id" | "created_at" | "category" | "task">) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("calendar_events")
        .insert([{ ...newEvent, user_id: userData.user.id }])
        .select(`*, category:categories(*), task:tasks(*)`)
        .single();

      if (error) throw error;

      // Sync with task if completed
      if (newEvent.completed && newEvent.task_id) {
        await supabase
          .from("tasks")
          .update({
            completed_at: newEvent.completed_at || new Date().toISOString(),
            actual_minutes: newEvent.actual_minutes
          })
          .eq("id", newEvent.task_id);
      }

      return data as CalendarEvent;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const updateMutation = useMutation({
    onMutate: () => {
      startLoading();
    },
    onSettled: () => {
      stopLoading();
    },
    mutationFn: async ({ id, ...updates }: Partial<CalendarEvent> & { id: string }) => {
      const { category, task, ...cleanUpdates } = updates;
      
      const { data, error } = await supabase
        .from("calendar_events")
        .update(cleanUpdates)
        .eq("id", id)
        .select(`*, category:categories(*), task:tasks(*)`)
        .single();

      if (error) throw error;

      // Cross-sync: If completed status is being updated and there is a linked task
      if (updates.completed !== undefined && data.task_id) {
        if (updates.completed === false) {
          // Check if this clone was for a recurring event
          const { data: recurringEvents } = await supabase
            .from("calendar_events")
            .select("*")
            .eq("task_id", data.task_id)
            .eq("is_recurring", true);
            
          const recurringEvent = recurringEvents?.[0];
          
          if (recurringEvent) {
            // It's a recurring event clone being marked incomplete!
            // 1. Restore the recurrence rule on the original event (remove the EXDATE for this occurrence)
            const start = new Date(data.start_time);
            const exdateStr = start.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
            
            if (recurringEvent.recurrence_rule) {
              const rules = recurringEvent.recurrence_rule.split('\n');
              const updatedRules = rules.map((rule: string) => {
                if (rule.startsWith('EXDATE:')) {
                  const dates = rule.substring(7).split(',');
                  const filteredDates = dates.filter((d: string) => !d.startsWith(exdateStr.slice(0, 8)));
                  return filteredDates.length > 0 ? `EXDATE:${filteredDates.join(',')}` : null;
                }
                return rule;
              }).filter(Boolean);
              
              await supabase
                .from("calendar_events")
                .update({ recurrence_rule: updatedRules.join('\n') })
                .eq("id", recurringEvent.id);
            }
            
            // 2. Delete this clone event
            await supabase
              .from("calendar_events")
              .delete()
              .eq("id", id);
              
            // 3. Update the linked task to clear completed_at and actual_minutes
            await supabase
              .from("tasks")
              .update({
                status: "not_started",
                completed_at: null,
                actual_minutes: null
              })
              .eq("id", data.task_id);
              
            return { ...data, id, completed: false } as CalendarEvent;
          }
        }

        // Standard non-recurring update behavior
        await supabase
          .from("tasks")
          .update({
            status: updates.completed ? "completed" : "not_started",
            completed_at: updates.completed ? (updates.completed_at || new Date().toISOString()) : null,
            actual_minutes: updates.completed ? updates.actual_minutes : null
          })
          .eq("id", data.task_id);
      }

      return data as CalendarEvent;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const deleteMutation = useMutation({
    onMutate: () => {
      startLoading();
    },
    onSettled: () => {
      stopLoading();
    },
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("calendar_events").delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });

  return {
    events: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    createEvent: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateEvent: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteEvent: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
