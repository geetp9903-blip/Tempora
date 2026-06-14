"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { CategoryAutocomplete } from "@/components/ui/CategoryAutocomplete";
import { useCalendarEvents, CalendarEvent } from "@/hooks/useCalendarEvents";
import { useTasks } from "@/hooks/useTasks";
import { useCategories } from "@/hooks/useCategories";
import { toast } from "sonner";

interface EventFormProps {
  initialData?: Partial<CalendarEvent>;
  onSuccess?: () => void;
  onCancel?: () => void;
  selectedDateStr?: string;
}

export function EventForm({ initialData, onSuccess, onCancel, selectedDateStr }: EventFormProps) {
  // Format date strings for datetime-local input (YYYY-MM-DDThh:mm)
  const formatForInput = (dateString?: string, defaultHour?: number) => {
    if (dateString) {
      try {
        const d = new Date(dateString);
        // Ensure local time format for input
        return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      } catch (e) {
        // ignore
      }
    }
    
    // Default to today/selected date
    const d = selectedDateStr ? new Date(selectedDateStr) : new Date();
    if (defaultHour !== undefined) {
      d.setHours(defaultHour, 0, 0, 0);
    }
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  };

  const [title, setTitle] = useState(initialData?.title || "");
  const [categoryId, setCategoryId] = useState(initialData?.category_id || "");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [taskId, setTaskId] = useState(initialData?.task_id || "");
  const [startTime, setStartTime] = useState(formatForInput(initialData?.start_time, 9));
  const [endTime, setEndTime] = useState(formatForInput(initialData?.end_time, 10));
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [recurrenceRule, setRecurrenceRule] = useState(initialData?.recurrence_rule || "");
  
  const { categories, createCategory } = useCategories();
  const { tasks } = useTasks(); // Note: for a real app, this should only fetch incomplete tasks
  const { createEvent, updateEvent, isCreating, isUpdating } = useCalendarEvents();
  
  const isEditing = !!initialData?.id;
  const isLoading = isCreating || isUpdating;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error("Event title is required");
      return;
    }

    if (new Date(startTime) >= new Date(endTime)) {
      toast.error("End time must be after start time");
      return;
    }

    // Convert local time strings back to ISO strings for the DB
    const startIso = new Date(startTime).toISOString();
    const endIso = new Date(endTime).toISOString();

    try {
      let finalCategoryId = categoryId || null;

      if (newCategoryName) {
        const PRESET_COLORS = ["#7c3aed", "#2dd4bf", "#f43f5e", "#eab308", "#3b82f6", "#10b981", "#ec4899", "#f97316"];
        const randomColor = PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)];
        const newCat = await createCategory({ name: newCategoryName, color: randomColor });
        finalCategoryId = newCat.id;
      }

      const eventData = {
        title: title.trim(),
        category_id: finalCategoryId,
        task_id: taskId || null,
        start_time: startIso,
        end_time: endIso,
        notes: notes.trim() || null,
        completed: initialData?.completed || false,
        completed_at: initialData?.completed_at || null,
        actual_minutes: initialData?.actual_minutes || null,
        is_recurring: !!recurrenceRule,
        recurrence_rule: recurrenceRule || null,
      };

      if (isEditing && initialData.id) {
        await updateEvent({ id: initialData.id, ...eventData });
        toast.success("Event updated");
      } else {
        await createEvent(eventData);
        toast.success("Event created");
      }
      onSuccess?.();
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    }
  };

  // Auto-fill title and category when a task is selected
  const handleTaskChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedTaskId = e.target.value;
    setTaskId(selectedTaskId);
    
    if (selectedTaskId) {
      const task = tasks.find(t => t.id === selectedTaskId);
      if (task) {
        if (!title) setTitle(task.title);
        if (task.category_id) setCategoryId(task.category_id);
      }
    }
  };

  const handleCategoryChange = (id: string, newName: string) => {
    setCategoryId(id);
    setNewCategoryName(newName);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Event Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="E.g. Team Standup"
        autoFocus
        required
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Start Time"
          type="datetime-local"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          required
        />
        <Input
          label="End Time"
          type="datetime-local"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Link to Task"
          value={taskId}
          onChange={handleTaskChange}
          options={[
            { value: "", label: "None" },
            ...tasks.map(t => ({ value: t.id, label: t.title }))
          ]}
        />
        
        <CategoryAutocomplete
          categories={categories}
          selectedCategoryId={categoryId}
          newCategoryName={newCategoryName}
          onChange={handleCategoryChange}
        />
      </div>

      <Select
        label="Repeat"
        value={recurrenceRule}
        onChange={(e) => setRecurrenceRule(e.target.value)}
        options={[
          { value: "", label: "Does not repeat" },
          { value: "FREQ=DAILY", label: "Daily" },
          { value: "FREQ=WEEKLY", label: "Weekly" },
          { value: "FREQ=MONTHLY", label: "Monthly" },
          { value: "FREQ=YEARLY", label: "Yearly" }
        ]}
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-white/80 ml-1">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Meeting links, agenda, etc..."
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-tempora-purple/50 focus:border-tempora-purple transition-all duration-200 resize-none h-20"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-white/10">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" isLoading={isLoading}>
          {isEditing ? "Save Changes" : "Create Event"}
        </Button>
      </div>
    </form>
  );
}
