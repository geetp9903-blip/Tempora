"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { CategoryAutocomplete } from "@/components/ui/CategoryAutocomplete";
import { useTasks, Task, TaskPriority, TaskStatus } from "@/hooks/useTasks";
import { useCategories } from "@/hooks/useCategories";
import { COLOR_PRESETS } from "@/lib/colorPresets";
import { toast } from "sonner";

interface TaskFormProps {
  initialData?: Task;
  onSuccess?: () => void;
  onCancel?: () => void;
  defaultCategoryId?: string;
}

export function TaskForm({ initialData, onSuccess, onCancel, defaultCategoryId }: TaskFormProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [categoryId, setCategoryId] = useState(initialData?.category_id || defaultCategoryId || "");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [estimatedMinutes, setEstimatedMinutes] = useState(initialData?.estimated_minutes?.toString() || "30");
  const [priority, setPriority] = useState<TaskPriority>(initialData?.priority || "medium");
  const [status, setStatus] = useState<TaskStatus>(initialData?.status || "not_started");
  
  const { categories, createCategory, activePreset } = useCategories();
  const { createTask, updateTask, isCreating, isUpdating } = useTasks();
  
  const isEditing = !!initialData;
  const isLoading = isCreating || isUpdating;
  const isSubmittingRef = useRef(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmittingRef.current) return;

    if (!title.trim()) {
      toast.error("Task title is required");
      return;
    }

    isSubmittingRef.current = true;

    try {
      let finalCategoryId = categoryId || null;

      if (newCategoryName) {
        const presetColors = COLOR_PRESETS[activePreset]?.colors || ["#7c3aed", "#2dd4bf", "#f43f5e", "#eab308", "#3b82f6", "#10b981", "#ec4899", "#f97316"];
        const autoColor = presetColors[categories.length % presetColors.length] || presetColors[0];
        const newCat = await createCategory({ name: newCategoryName, color: autoColor });
        finalCategoryId = newCat.id;
      }

      const isFinished = status === "completed" || status === "partial" || status === "skipped";
      const taskData = {
        title: title.trim(),
        description: description.trim() || null,
        category_id: finalCategoryId,
        estimated_minutes: parseInt(estimatedMinutes) || 30,
        priority,
        status,
        completed_at: isFinished ? (initialData?.completed_at || new Date().toISOString()) : null,
        actual_minutes: status === "skipped" ? null : (initialData?.actual_minutes || null),
      };
      if (isEditing && initialData) {
        await updateTask({ id: initialData.id, ...taskData });
        toast.success("Task updated");
      } else {
        await createTask(taskData);
        toast.success("Task created");
      }
      onSuccess?.();
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      isSubmittingRef.current = false;
    }
  };

  const handleCategoryChange = (id: string, newName: string) => {
    setCategoryId(id);
    setNewCategoryName(newName);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Task Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="What needs to be done?"
        autoFocus
        required
      />
      
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-white/80 ml-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add details, links, or notes..."
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-tempora-purple/50 focus:border-tempora-purple transition-all duration-200 resize-none h-24"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <CategoryAutocomplete
          categories={categories}
          selectedCategoryId={categoryId}
          newCategoryName={newCategoryName}
          onChange={handleCategoryChange}
        />
        
        <Input
          label="Estimated Time (min)"
          type="number"
          min="5"
          step="5"
          value={estimatedMinutes}
          onChange={(e) => setEstimatedMinutes(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value as TaskPriority)}
          options={[
            { value: "low", label: "Low" },
            { value: "medium", label: "Medium" },
            { value: "high", label: "High" },
          ]}
        />
        
        <Select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value as TaskStatus)}
          options={[
            { value: "not_started", label: "Not Started" },
            { value: "in_progress", label: "In Progress" },
            { value: "completed", label: "Completed" },
            { value: "partial", label: "Partially Completed" },
            { value: "skipped", label: "Skipped" },
          ]}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-white/10">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" isLoading={isLoading}>
          {isEditing ? "Save Changes" : "Create Task"}
        </Button>
      </div>
    </form>
  );
}
