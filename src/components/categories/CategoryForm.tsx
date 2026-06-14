"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useCategories } from "@/hooks/useCategories";
import { toast } from "sonner";
import { Category } from "@/hooks/useCategories";

const PRESET_COLORS = [
  "#7c3aed", // Purple
  "#2dd4bf", // Cyan
  "#f43f5e", // Rose
  "#eab308", // Yellow
  "#3b82f6", // Blue
  "#10b981", // Emerald
  "#ec4899", // Pink
  "#f97316", // Orange
];

interface CategoryFormProps {
  initialData?: Category;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CategoryForm({ initialData, onSuccess, onCancel }: CategoryFormProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [color, setColor] = useState(initialData?.color || PRESET_COLORS[0]);
  
  const { createCategory, updateCategory, isCreating, isUpdating } = useCategories();
  const isEditing = !!initialData;
  const isLoading = isCreating || isUpdating;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      if (isEditing && initialData) {
        await updateCategory({ id: initialData.id, name: name.trim(), color });
        toast.success("Category updated");
      } else {
        await createCategory({ name: name.trim(), color });
        toast.success("Category created");
      }
      onSuccess?.();
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Input
        label="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Work, Health, Personal..."
        autoFocus
      />
      
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-white/80 ml-1">Color</label>
        <div className="flex flex-wrap gap-3 p-2">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              className={`w-8 h-8 rounded-full transition-all ${
                color === c 
                  ? "ring-2 ring-offset-2 ring-offset-tempora-black scale-110" 
                  : "hover:scale-110 opacity-70 hover:opacity-100"
              }`}
              style={{ backgroundColor: c, '--tw-ring-color': c } as React.CSSProperties}
              onClick={() => setColor(c)}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2 mt-2 border-t border-white/10">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" isLoading={isLoading}>
          {isEditing ? "Save Changes" : "Create Category"}
        </Button>
      </div>
    </form>
  );
}
