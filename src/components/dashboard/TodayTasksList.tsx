"use client";
import { useState } from "react";
import { useTasks, Task } from "@/hooks/useTasks";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { CompletionModal, CompletionStatus } from "@/components/ui/CompletionModal";
import { rrulestr } from "rrule";
import { HoverTooltip } from "@/components/ui/HoverTooltip";

export function TodayTasksList() {
  const { tasks, isLoading: tasksLoading, updateTask } = useTasks();
  const { events, isLoading: eventsLoading } = useCalendarEvents();
  const [completionTask, setCompletionTask] = useState<Task | null>(null);

  const isLoading = tasksLoading || eventsLoading;

  const getLocalDateStr = (dateParam: Date | string | null) => {
    if (!dateParam) return null;
    const d = new Date(dateParam);
    if (isNaN(d.getTime())) return null;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  const todayStr = getLocalDateStr(new Date())!;

  // Find task IDs scheduled for today in calendar_events
  const todayTaskIds = new Set<string>();
  events.forEach(event => {
    if (!event.task_id) return;
    
    if (event.is_recurring && event.recurrence_rule) {
      try {
        const dtstart = new Date(event.start_time).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        const ruleStr = `DTSTART:${dtstart}\nRRULE:${event.recurrence_rule}`;
        const rule = rrulestr(ruleStr);
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);
        const occurrences = rule.between(todayStart, todayEnd, true);
        if (occurrences.length > 0) {
          todayTaskIds.add(event.task_id);
        }
      } catch (err) {
        console.error("Error parsing rrule in TodayTasksList", err);
      }
    } else {
      if (getLocalDateStr(event.start_time) === todayStr) {
        todayTaskIds.add(event.task_id);
      }
    }
  });

  const isTaskCompletedToday = (task: Task) => {
    const isFinished = task.status === "completed" || task.status === "partial" || task.status === "skipped";
    if (isFinished) return true;
    if (task.completed_at) {
      const completedDate = getLocalDateStr(task.completed_at);
      return completedDate === todayStr;
    }
    return false;
  };

  const handleToggleStatus = async (task: Task) => {
    if (!isTaskCompletedToday(task)) {
      setCompletionTask(task);
    } else {
      await updateTask({ 
        id: task.id, 
        status: "not_started",
        completed_at: null,
        actual_minutes: null 
      });
    }
  };

  const handleCompleteTask = async ({ actualMinutes, status, completedAt }: { actualMinutes: number; status: CompletionStatus; completedAt: string }) => {
    if (completionTask) {
      await updateTask({
        id: completionTask.id,
        status: status,
        completed_at: completedAt,
        actual_minutes: status === "skipped" ? null : actualMinutes,
      });
      setCompletionTask(null);
    }
  };

  const todayTasks = tasks.filter(t => {
    // Hide if permanently finished
    const isFinished = t.status === "completed" || t.status === "partial" || t.status === "skipped";
    if (isFinished) return false;
    // Hide if completed today (recurring event logic keeps status 'not_started' but sets completed_at to today)
    if (t.completed_at && getLocalDateStr(t.completed_at) === todayStr) return false;
    
    // Only show if scheduled for today or created today
    const isScheduledToday = todayTaskIds.has(t.id);
    const isCreatedToday = getLocalDateStr(t.created_at) === todayStr;
    return isScheduledToday || isCreatedToday;
  }).slice(0, 5);

  if (isLoading) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 h-full flex items-center justify-center min-h-[300px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">Focus Today</h3>
        <Badge variant="purple">{todayTasks.length} tasks</Badge>
      </div>

      {todayTasks.length === 0 ? (
        <div className="flex-1 flex flex-col justify-center mt-4">
          <EmptyState
            icon={CheckCircle2}
            title="All caught up!"
            description="You don't have any tasks pending for today."
          />
        </div>
      ) : (
        <div className="flex flex-col gap-2 mt-2">
          {todayTasks.map(task => (
            <HoverTooltip
              key={task.id}
              content={
                <div className="flex flex-col gap-1 text-sm text-white">
                  <div className="font-semibold">{task.title}</div>
                  {task.description ? (
                    <div className="text-white/70 mt-1 whitespace-pre-wrap text-xs">{task.description}</div>
                  ) : (
                    <div className="text-white/40 italic mt-1 text-xs">No notes provided.</div>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-white/50 font-medium">
                    <span className="capitalize px-1.5 py-0.5 rounded bg-white/10">{task.priority} Priority</span>
                    {task.estimated_minutes > 0 && <span>{task.estimated_minutes} min</span>}
                  </div>
                </div>
              }
            >
              <div 
                className={`flex items-start gap-3 p-3 rounded-xl transition-all duration-200 border border-transparent w-full text-left ${
                  isTaskCompletedToday(task) 
                    ? "bg-white/[0.02]" 
                    : "bg-tempora-black hover:border-white/10"
                }`}
              >
                <button 
                  onClick={() => handleToggleStatus(task)}
                  className="mt-0.5 text-white/40 hover:text-tempora-cyan transition-colors relative z-10"
                >
                  {isTaskCompletedToday(task) ? (
                    <CheckCircle2 className="w-5 h-5 text-tempora-cyan" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <div className={`font-medium truncate ${isTaskCompletedToday(task) ? "text-white/40 line-through" : "text-white/90"}`}>
                    {task.title}
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 text-xs">
                    {task.category && (
                      <div className="flex items-center gap-1.5">
                        <div 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: task.category.color }}
                        />
                        <span className="text-white/60">{task.category.name}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-white/40">
                      <Clock className="w-3 h-3" />
                      {task.estimated_minutes}m
                    </div>
                  </div>
                </div>
              </div>
            </HoverTooltip>
          ))}
        </div>
      )}

      {completionTask && (
        <CompletionModal
          isOpen={true}
          onClose={() => setCompletionTask(null)}
          title={`Complete: ${completionTask.title}`}
          estimatedMinutes={completionTask.estimated_minutes}
          onSubmit={handleCompleteTask}
        />
      )}
    </div>
  );
}
