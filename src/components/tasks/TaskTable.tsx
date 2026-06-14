"use client";

import { useState } from "react";
import { Task, useTasks } from "@/hooks/useTasks";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Edit2, Trash2, Clock, CheckCircle2, Circle } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { CompletionModal } from "@/components/ui/CompletionModal";

interface TaskTableProps {
  tasks: Task[];
  isLoading: boolean;
  onEditTask: (task: Task) => void;
}

export function TaskTable({ tasks, isLoading, onEditTask }: TaskTableProps) {
  const { updateTask, deleteTask } = useTasks();
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [completionTask, setCompletionTask] = useState<Task | null>(null);

  const handleToggleStatus = async (task: Task) => {
    if (task.status !== "completed") {
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

  const handleDelete = async () => {
    if (deleteConfirmId) {
      await deleteTask(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high": return <Badge variant="red">High</Badge>;
      case "medium": return <Badge variant="cyan">Medium</Badge>;
      case "low": return <Badge variant="gray">Low</Badge>;
      default: return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20 bg-white/5 border border-white/10 rounded-2xl">
        <LoadingSpinner />
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <EmptyState
        icon={CheckCircle2}
        title="No tasks found"
        description="We couldn't find any tasks matching your criteria. Try adjusting your filters or create a new task."
      />
    );
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/5 text-sm text-white/60">
              <th className="px-6 py-4 font-medium w-12">Status</th>
              <th className="px-6 py-4 font-medium">Task</th>
              <th className="px-6 py-4 font-medium">Category</th>
              <th className="px-6 py-4 font-medium">Priority</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {tasks.map((task) => (
              <tr 
                key={task.id} 
                className={`group transition-colors duration-200 ${
                  task.status === "completed" ? "bg-white/[0.02]" : "hover:bg-white/[0.03]"
                }`}
              >
                <td className="px-6 py-4">
                  <button 
                    onClick={() => handleToggleStatus(task)}
                    className="text-white/40 hover:text-tempora-cyan transition-colors"
                  >
                    {task.status === "completed" ? (
                      <CheckCircle2 className="w-6 h-6 text-tempora-cyan" />
                    ) : (
                      <Circle className="w-6 h-6" />
                    )}
                  </button>
                </td>
                <td className="px-6 py-4">
                  <div className={`font-medium ${task.status === "completed" ? "text-white/40 line-through" : "text-white/90"}`}>
                    {task.title}
                  </div>
                  {task.description && (
                    <div className="text-sm text-white/40 truncate max-w-xs mt-0.5">
                      {task.description}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-white/40">
                    <Clock className="w-3.5 h-3.5" />
                    {task.estimated_minutes} min
                  </div>
                </td>
                <td className="px-6 py-4">
                  {task.category ? (
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: task.category.color }}
                      />
                      <span className="text-sm text-white/70">{task.category.name}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-white/30">Uncategorized</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {getPriorityBadge(task.priority)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 text-white/40 hover:text-white"
                      onClick={() => onEditTask(task)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 text-white/40 hover:text-red-400"
                      onClick={() => setDeleteConfirmId(task.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleDelete}
        title="Delete Task"
        description="Are you sure you want to delete this task? This action cannot be undone."
        confirmText="Delete"
        isDestructive
      />

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
