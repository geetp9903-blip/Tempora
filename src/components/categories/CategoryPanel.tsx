"use client";

import { useState } from "react";
import { useCategories, Category } from "@/hooks/useCategories";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { CategoryForm } from "./CategoryForm";
import { Plus, Edit2, Trash2, FolderOpen } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";

export function CategoryPanel() {
  const { categories, isLoading, deleteCategory, isDeleting } = useCategories();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>(undefined);
  
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleOpenCreate = () => {
    setEditingCategory(undefined);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (category: Category) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (deleteConfirmId) {
      try {
        await deleteCategory(deleteConfirmId);
      } finally {
        setDeleteConfirmId(null);
      }
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <FolderOpen className="w-5 h-5 text-tempora-purple" />
          Categories
        </h2>
        <Button size="sm" onClick={handleOpenCreate} className="gap-1">
          <Plus className="w-4 h-4" />
          New
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <LoadingSpinner />
          </div>
        ) : categories.length === 0 ? (
          <EmptyState
            icon={FolderOpen}
            title="No categories yet"
            description="Create categories to organize your tasks and events."
            action={
              <Button onClick={handleOpenCreate} variant="outline" className="mt-4">
                Create First Category
              </Button>
            }
          />
        ) : (
          <div className="flex flex-col gap-2">
            {categories.map((cat) => (
              <div 
                key={cat.id} 
                className="group flex items-center justify-between p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)]" 
                    style={{ backgroundColor: cat.color, boxShadow: `0 0 10px ${cat.color}60` }}
                  />
                  <span className="font-medium text-white/90">{cat.name}</span>
                </div>
                
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 text-white/40 hover:text-white"
                    onClick={() => handleOpenEdit(cat)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 text-white/40 hover:text-red-400"
                    onClick={() => setDeleteConfirmId(cat.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingCategory ? "Edit Category" : "New Category"}
      >
        <CategoryForm 
          initialData={editingCategory} 
          onSuccess={() => setIsFormOpen(false)}
          onCancel={() => setIsFormOpen(false)}
        />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleDelete}
        title="Delete Category"
        description="Are you sure you want to delete this category? Tasks associated with it will become uncategorized. This action cannot be undone."
        confirmText="Delete"
        isDestructive
        isLoading={isDeleting}
      />
    </div>
  );
}
