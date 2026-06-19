"use client";

import { useTasks } from "@/hooks/useTasks";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { CompletionModal } from "@/components/ui/CompletionModal";
import { useState } from "react";
import { Task } from "@/hooks/useTasks";

export function TodayTasksList() {
  const { tasks, isLoading, updateTask } = useTasks();
  const [completionTask, setCompletionTask] = useState<Task | null>(null);

  const getLocalDateStr = (dateParam: Date | string | null) => {
    if (!dateParam) return null;
    const d = new Date(dateParam);
    if (isNaN(d.getTime())) return null;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  const todayStr = getLocalDateStr(new Date())!;

  const isTaskCompletedToday = (task: Task) => {
    if (task.status === "completed") return true;
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

  const handleCompleteTask = async ({ actualMinutes }: { actualMinutes: number }) => {
    if (completionTask) {
      await updateTask({
        id: completionTask.id,
        status: "completed",
        completed_at: new Date().toISOString(),
        actual_minutes: actualMinutes,
      });
      setCompletionTask(null);
    }
  };

  const todayTasks = tasks.filter(t => {
    // Hide if permanently completed
    if (t.status === "completed") return false;
    // Hide if completed today (recurring event logic keeps status 'not_started')
    if (t.completed_at && getLocalDateStr(t.completed_at) === todayStr) return false;
    return true;
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
            <div 
              key={task.id} 
              className={`flex items-start gap-3 p-3 rounded-xl transition-all duration-200 border border-transparent ${
                task.status === "completed" 
                  ? "bg-white/[0.02]" 
                  : "bg-tempora-black hover:border-white/10"
              }`}
            >
              <button 
                onClick={() => handleToggleStatus(task)}
                className="mt-0.5 text-white/40 hover:text-tempora-cyan transition-colors"
              >
                {task.status === "completed" ? (
                  <CheckCircle2 className="w-5 h-5 text-tempora-cyan" />
                ) : (
                  <Circle className="w-5 h-5" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <div className={`font-medium truncate ${task.status === "completed" ? "text-white/40 line-through" : "text-white/90"}`}>
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
