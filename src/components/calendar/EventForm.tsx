"use client";

import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { CategoryAutocomplete } from "@/components/ui/CategoryAutocomplete";
import { RecurrenceBuilder } from "./RecurrenceBuilder";
import { useCalendarEvents, CalendarEvent } from "@/hooks/useCalendarEvents";
import { useTasks } from "@/hooks/useTasks";
import { useCategories } from "@/hooks/useCategories";
import { COLOR_PRESETS } from "@/lib/colorPresets";
import { toast } from "sonner";

type TaskMode = "none" | "link" | "create";

interface EventFormProps {
  initialData?: Partial<CalendarEvent>;
  onSuccess?: () => void;
  onCancel?: () => void;
  selectedDateStr?: string;
}

export function EventForm({ initialData, onSuccess, onCancel, selectedDateStr }: EventFormProps) {
  // Format date strings for datetime-local input (YYYY-MM-DDThh:mm)
  const toLocalInputStr = (d: Date) =>
    new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

  const getInitialTimes = () => {
    // If editing, use the existing start/end times
    if (initialData?.start_time && initialData?.end_time) {
      return {
        start: toLocalInputStr(new Date(initialData.start_time)),
        end: toLocalInputStr(new Date(initialData.end_time)),
      };
    }

    // For new events, use the clicked date/time
    const base = selectedDateStr ? new Date(selectedDateStr) : new Date();
    
    // If the selected date has a non-midnight time (from clicking a time slot in week/day view), use it
    // Otherwise default to 9 AM
    const hasClickedTime = selectedDateStr && (base.getHours() !== 0 || base.getMinutes() !== 0);
    if (!hasClickedTime) {
      base.setHours(9, 0, 0, 0);
    }

    const end = new Date(base.getTime() + 60 * 60 * 1000); // +1 hour

    return {
      start: toLocalInputStr(base),
      end: toLocalInputStr(end),
    };
  };

  const initialTimes = getInitialTimes();

  const [title, setTitle] = useState(initialData?.title || "");
  const [categoryId, setCategoryId] = useState(initialData?.category_id || "");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [startTime, setStartTime] = useState(initialTimes.start);
  const [endTime, setEndTime] = useState(initialTimes.end);
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [recurrenceRule, setRecurrenceRule] = useState(initialData?.recurrence_rule || "");
  
  // Task linking mode
  const initialTaskMode: TaskMode = initialData?.task_id ? "link" : "create";
  const [taskMode, setTaskMode] = useState<TaskMode>(initialTaskMode);
  const [taskId, setTaskId] = useState(initialData?.task_id || "");

  const { categories, createCategory, activePreset } = useCategories();
  const { tasks, createTask } = useTasks();
  const { createEvent, updateEvent, isCreating, isUpdating } = useCalendarEvents();
  
  const isEditing = !!initialData?.id;
  const isLoading = isCreating || isUpdating;
  const isSubmittingRef = useRef(false);

  const handleRecurrenceChange = useCallback((rule: string) => {
    setRecurrenceRule(rule);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmittingRef.current) return;

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

    isSubmittingRef.current = true;

    try {
      let finalCategoryId = categoryId || null;

      if (newCategoryName) {
        const presetColors = COLOR_PRESETS[activePreset]?.colors || ["#7c3aed", "#2dd4bf", "#f43f5e", "#eab308", "#3b82f6", "#10b981", "#ec4899", "#f97316"];
        const autoColor = presetColors[categories.length % presetColors.length] || presetColors[0];
        const newCat = await createCategory({ name: newCategoryName, color: autoColor });
        finalCategoryId = newCat.id;
      }

      // Handle task creation/linking
      let finalTaskId: string | null = null;

      if (taskMode === "link" && taskId) {
        finalTaskId = taskId;
      } else if (taskMode === "create" && !isEditing) {
        // Auto-create a backing task with sensible defaults
        const durationMinutes = Math.max(1, Math.round(
          (new Date(endIso).getTime() - new Date(startIso).getTime()) / 60000
        ));
        const newTask = await createTask({
          title: title.trim(),
          description: notes.trim() || null,
          category_id: finalCategoryId,
          estimated_minutes: durationMinutes,
          priority: "medium",
          status: "not_started",
          completed_at: null,
          actual_minutes: null,
        });
        finalTaskId = newTask.id;
      } else if (taskMode === "none") {
        finalTaskId = null;
      } else {
        // Editing — keep existing task_id if mode is still "create" (meaning it was auto-created)
        finalTaskId = initialData?.task_id || null;
      }

      const eventData = {
        title: title.trim(),
        category_id: finalCategoryId,
        task_id: finalTaskId,
        start_time: startIso,
        end_time: endIso,
        notes: notes.trim() || null,
        status: initialData?.status || "not_started",
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
        const taskMsg = taskMode === "create" ? " Task also created." : "";
        toast.success(`Event created!${taskMsg}`);
      }
      onSuccess?.();
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      isSubmittingRef.current = false;
    }
  };

  // Auto-fill title and category when a task is selected
  const handleTaskSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
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

      {/* Task linking section */}
      <div className="flex flex-col gap-3">
        <label className="text-sm font-medium text-white/80 ml-1">Task</label>
        <div className="flex gap-1.5 p-1 bg-white/5 rounded-xl border border-white/10">
          {(
            [
              { value: "create", label: "Auto-create task" },
              { value: "link", label: "Link existing" },
              { value: "none", label: "No task" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTaskMode(opt.value)}
              className={`
                flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200
                ${
                  taskMode === opt.value
                    ? "bg-tempora-purple/20 text-tempora-purple border border-tempora-purple/30"
                    : "text-white/50 hover:text-white/80 hover:bg-white/5 border border-transparent"
                }
              `}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {taskMode === "link" && (
          <Select
            value={taskId}
            onChange={handleTaskSelect}
            options={[
              { value: "", label: "Select a task..." },
              ...tasks.map(t => ({ value: t.id, label: t.title }))
            ]}
          />
        )}

        {taskMode === "create" && !isEditing && (
          <p className="text-xs text-white/40 ml-1">
            A task will be auto-created with this event&apos;s title, category, and duration.
          </p>
        )}
      </div>

      {/* Category */}
      <CategoryAutocomplete
        categories={categories}
        selectedCategoryId={categoryId}
        newCategoryName={newCategoryName}
        onChange={handleCategoryChange}
      />

      {/* Recurrence builder */}
      <RecurrenceBuilder
        value={recurrenceRule}
        onChange={handleRecurrenceChange}
        eventStartDate={new Date(startTime).toISOString()}
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
