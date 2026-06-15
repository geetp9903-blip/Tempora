"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { TaskFilters } from "@/components/tasks/TaskFilters";
import { TaskTable } from "@/components/tasks/TaskTable";
import { TaskForm } from "@/components/tasks/TaskForm";
import { CategoryPanel } from "@/components/categories/CategoryPanel";
import { useTasks, Task } from "@/hooks/useTasks";
import { Plus } from "lucide-react";

export default function TasksPage() {
  const [filters, setFilters] = useState({ search: "", category_id: "", status: "" });
  const { tasks, isLoading } = useTasks(filters);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleOpenCreate = () => {
    setEditingTask(undefined);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start h-full pb-8">
      <div className="xl:col-span-3 flex flex-col gap-6 h-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Tasks</h2>
            <p className="text-white/60 mt-1">Manage your to-dos and priorities.</p>
          </div>
          <Button onClick={handleOpenCreate} className="gap-2">
            <Plus className="w-4 h-4" />
            New Task
          </Button>
        </div>

        <TaskFilters filters={filters} onFilterChange={handleFilterChange} />
        
        <div className="flex-1">
          <TaskTable 
            tasks={tasks} 
            isLoading={isLoading} 
            onEditTask={handleOpenEdit} 
          />
        </div>
      </div>

      <div className="xl:col-span-1 xl:sticky xl:top-6">
        <CategoryPanel />
      </div>

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingTask ? "Edit Task" : "New Task"}
      >
        <TaskForm 
          initialData={editingTask}
          onSuccess={() => setIsFormOpen(false)}
          onCancel={() => setIsFormOpen(false)}
          defaultCategoryId={filters.category_id}
        />
      </Modal>
    </div>
  );
}
