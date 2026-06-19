import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { COLOR_PRESETS, PresetKey } from "@/lib/colorPresets";
import { usePageLoader } from "@/providers/PageLoaderProvider";

export type Category = {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
};

export function useCategories() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { startLoading, stopLoading } = usePageLoader();

  const query = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as Category[];
    },
  });

  const presetQuery = useQuery({
    queryKey: ["user-preset"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const dbPreset = user?.user_metadata?.color_preset;
      
      const localPreset = typeof window !== 'undefined' ? localStorage.getItem("tempora_color_preset") : null;
      
      const finalPreset = dbPreset || localPreset || "sunset";
      
      if (typeof window !== 'undefined' && !localPreset) {
        localStorage.setItem("tempora_color_preset", finalPreset);
      }
      return finalPreset as PresetKey;
    }
  });

  const createMutation = useMutation({
    onMutate: () => {
      startLoading();
    },
    onSettled: () => {
      stopLoading();
    },
    mutationFn: async (newCategory: Omit<Category, "id" | "user_id" | "created_at">) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("categories")
        .insert([{ ...newCategory, user_id: userData.user.id }])
        .select()
        .single();

      if (error) throw error;
      return data as Category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  const updateMutation = useMutation({
    onMutate: () => {
      startLoading();
    },
    onSettled: () => {
      stopLoading();
    },
    mutationFn: async ({ id, ...updates }: Partial<Category> & { id: string }) => {
      const { data, error } = await supabase
        .from("categories")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
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
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  const changePresetMutation = useMutation({
    onMutate: () => {
      startLoading();
    },
    onSettled: () => {
      stopLoading();
    },
    mutationFn: async ({ newPreset, oldPreset }: { newPreset: PresetKey; oldPreset: PresetKey }) => {
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        await supabase.auth.updateUser({
          data: { color_preset: newPreset }
        });
      }
      
      if (typeof window !== 'undefined') {
        localStorage.setItem("tempora_color_preset", newPreset);
      }

      // Map existing categories' colors if they are in the old preset
      const oldColors = COLOR_PRESETS[oldPreset]?.colors || [];
      const newColors = COLOR_PRESETS[newPreset]?.colors || [];

      if (oldColors.length > 0 && newColors.length > 0) {
        const { data: currentCategories, error: fetchError } = await supabase
          .from("categories")
          .select("*");

        if (fetchError) throw fetchError;

        const updates = currentCategories
          .map((cat) => {
            const index = oldColors.findIndex(c => c.toLowerCase() === cat.color.toLowerCase());
            if (index !== -1 && index < newColors.length) {
              return { id: cat.id, color: newColors[index] };
            }
            return null;
          })
          .filter(Boolean) as { id: string; color: string }[];

        if (updates.length > 0) {
          await Promise.all(
            updates.map(({ id, color }) =>
              supabase.from("categories").update({ color }).eq("id", id)
            )
          );
        }
      }

      return newPreset;
    },
    onSuccess: (newPreset) => {
      queryClient.setQueryData(["user-preset"], newPreset);
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    }
  });

  return {
    categories: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    createCategory: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateCategory: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteCategory: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    activePreset: presetQuery.data ?? "sunset",
    changePreset: changePresetMutation.mutateAsync,
    isChangingPreset: changePresetMutation.isPending,
    presetLoading: presetQuery.isLoading
  };
}
