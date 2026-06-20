import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { Category } from "./useCategories";
import { usePageLoader } from "@/providers/PageLoaderProvider";

export type TaskStatus = "not_started" | "in_progress" | "completed" | "partial" | "skipped";
export type TaskPriority = "low" | "medium" | "high";

export type Task = {
  id: string;
  user_id: string;
  category_id: string | null;
  title: string;
  description: string | null;
  estimated_minutes: number;
  priority: TaskPriority;
  status: TaskStatus;
  created_at: string;
  completed_at: string | null;
  actual_minutes: number | null;
  category?: Category; // Joined data
};

export function useTasks(filters?: { category_id?: string; status?: string; search?: string }) {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { startLoading, stopLoading } = usePageLoader();

  const query = useQuery({
    queryKey: ["tasks", filters],
    queryFn: async () => {
      let query = supabase
        .from("tasks")
        .select(`
          *,
          category:categories(*)
        `)
        .order("created_at", { ascending: false });

      if (filters?.category_id) {
        query = query.eq("category_id", filters.category_id);
      }
      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      if (filters?.search) {
        query = query.ilike("title", `%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Task[];
    },
  });

  const createMutation = useMutation({
    onMutate: () => {
      startLoading();
    },
    onSettled: () => {
      stopLoading();
    },
    mutationFn: async (newTask: Omit<Task, "id" | "user_id" | "created_at" | "category">) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("tasks")
        .insert([{ ...newTask, user_id: userData.user.id }])
        .select(`
          *,
          category:categories(*)
        `)
        .single();

      if (error) throw error;
      return data as Task;
    },
    onSuccess: () => {
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
    mutationFn: async ({ id, ...updates }: Partial<Task> & { id: string }) => {
      // Don't send joined 'category' back in updates
      const { category, ...cleanUpdates } = updates;
      
      const { data, error } = await supabase
        .from("tasks")
        .update(cleanUpdates)
        .eq("id", id)
        .select(`
          *,
          category:categories(*)
        `)
        .single();

      if (error) throw error;

      // Cross-sync: If category is being updated, update all linked calendar events
      if (updates.category_id !== undefined) {
        await supabase
          .from("calendar_events")
          .update({ category_id: updates.category_id })
          .eq("task_id", id);
      }

      if (updates.status !== undefined) {
        const isFinished = updates.status === "completed" || updates.status === "partial" || updates.status === "skipped";
        
        // Find linked events
        const { data: linkedEvents } = await supabase
          .from("calendar_events")
          .select("*")
          .eq("task_id", id);
           
        const recurringEvent = linkedEvents?.find(e => e.is_recurring);

        if (recurringEvent && isFinished) {
          // It's a recurring event, so don't complete the task permanently!
          // We revert the task's status to 'not_started' but keep 'completed_at' to hide it for today
          await supabase
            .from("tasks")
            .update({
              status: "not_started",
              completed_at: updates.completed_at || new Date().toISOString(),
              actual_minutes: updates.actual_minutes || null
            })
            .eq("id", id);
            
          // Get today's occurrence start/end times based on original event hours/minutes
          const today = new Date();
          const start = new Date(recurringEvent.start_time);
          start.setFullYear(today.getFullYear(), today.getMonth(), today.getDate());
          const end = new Date(recurringEvent.end_time);
          end.setFullYear(today.getFullYear(), today.getMonth(), today.getDate());

          // Now create the exception in the calendar for today's occurrence start time
          const exdateStr = start.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
          const newRRule = recurringEvent.recurrence_rule 
            ? `${recurringEvent.recurrence_rule}\nEXDATE:${exdateStr}` 
            : `EXDATE:${exdateStr}`;
            
          await supabase
            .from("calendar_events")
            .update({ recurrence_rule: newRRule })
            .eq("id", recurringEvent.id);

          // Create the completed clone
          const { id: _, created_at: __, ...eventData } = recurringEvent;
          
          await supabase
            .from("calendar_events")
            .insert([{
              ...eventData,
              start_time: start.toISOString(),
              end_time: end.toISOString(),
              is_recurring: false,
              recurrence_rule: null,
              status: updates.status,
              completed_at: updates.completed_at || new Date().toISOString(),
              actual_minutes: updates.actual_minutes || recurringEvent.actual_minutes
            }]);
            
        } else if (recurringEvent && !isFinished) {
          // Reverting recurring completion (marking incomplete)
          const todayStrStr = new Date().toDateString();
          const completedCloneToday = linkedEvents?.find(e => 
            !e.is_recurring && 
            e.status !== "not_started" && 
            e.completed_at && 
            new Date(e.completed_at).toDateString() === todayStrStr
          );

          if (completedCloneToday) {
            await supabase
              .from("calendar_events")
              .delete()
              .eq("id", completedCloneToday.id);
          }

          if (recurringEvent.recurrence_rule) {
            const today = new Date();
            const start = new Date(recurringEvent.start_time);
            start.setFullYear(today.getFullYear(), today.getMonth(), today.getDate());
            const exdateStr = start.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
            
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

        } else if (!recurringEvent) {
          const nonRecurringEvent = linkedEvents?.find(e => !e.is_recurring);
          if (nonRecurringEvent) {
            await supabase
              .from("calendar_events")
              .update({ 
                status: updates.status,
                completed_at: isFinished ? (updates.completed_at || new Date().toISOString()) : null,
                actual_minutes: isFinished ? updates.actual_minutes : null
              })
              .eq("id", nonRecurringEvent.id);
          }
        }
      }

      return data as Task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
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
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  return {
    tasks: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    createTask: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateTask: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteTask: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
