import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { Category } from "./useCategories";

export type TaskStatus = "not_started" | "in_progress" | "completed";
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

      // Cross-sync: If status is being updated, update any linked calendar events
      if (updates.status !== undefined) {
        const isCompleted = updates.status === "completed";
        await supabase
          .from("calendar_events")
          .update({ 
            completed: isCompleted,
            completed_at: isCompleted ? (updates.completed_at || new Date().toISOString()) : null,
            actual_minutes: isCompleted ? updates.actual_minutes : null
          })
          .eq("task_id", id);
      }

      return data as Task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });

  const deleteMutation = useMutation({
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
