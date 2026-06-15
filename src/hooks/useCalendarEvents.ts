import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { Category } from "./useCategories";
import { Task } from "./useTasks";

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
};

export function useCalendarEvents(dateRange?: { start: string; end: string }) {
  const supabase = createClient();
  const queryClient = useQueryClient();

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
    mutationFn: async (newEvent: Omit<CalendarEvent, "id" | "user_id" | "created_at" | "category" | "task">) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("calendar_events")
        .insert([{ ...newEvent, user_id: userData.user.id }])
        .select(`*, category:categories(*), task:tasks(*)`)
        .single();

      if (error) throw error;
      return data as CalendarEvent;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CalendarEvent> & { id: string }) => {
      const { category, task, ...cleanUpdates } = updates;
      
      const { data, error } = await supabase
        .from("calendar_events")
        .update(cleanUpdates)
        .eq("id", id)
        .select(`*, category:categories(*), task:tasks(*)`)
        .single();

      if (error) throw error;
      return data as CalendarEvent;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });

  const deleteMutation = useMutation({
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
