"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useCategories } from "@/hooks/useCategories";
import { COLOR_PRESETS } from "@/lib/colorPresets";
import { toast } from "sonner";
import { Category } from "@/hooks/useCategories";

interface CategoryFormProps {
  initialData?: Category;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CategoryForm({ initialData, onSuccess, onCancel }: CategoryFormProps) {
  const { categories, activePreset, createCategory, updateCategory, isCreating, isUpdating } = useCategories();
  const presetColors = COLOR_PRESETS[activePreset]?.colors || [];
  const isSubmittingRef = useRef(false);

  const [name, setName] = useState(initialData?.name || "");
  const [color, setColor] = useState(() => {
    if (initialData?.color) return initialData.color;
    return presetColors[categories.length % presetColors.length] || presetColors[0] || "#7c3aed";
  });
  
  const isEditing = !!initialData;
  const isLoading = isCreating || isUpdating;

  // Set sequential default color if not editing and categories/preset loads
  useEffect(() => {
    if (!initialData && categories.length > 0) {
      const defaultColor = presetColors[categories.length % presetColors.length] || presetColors[0];
      if (defaultColor) {
        setColor(defaultColor);
      }
    }
  }, [categories, activePreset, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmittingRef.current) return;

    if (!name.trim()) {
      toast.error("Category name is required");
      return;
    }

    isSubmittingRef.current = true;

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
    } finally {
      isSubmittingRef.current = false;
    }
  };

  const isCustomColor = !presetColors.some(c => c.toLowerCase() === color.toLowerCase());

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
        <div className="flex flex-wrap items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl">
          {presetColors.map((c) => (
            <button
              key={c}
              type="button"
              className={`w-8 h-8 rounded-full transition-all cursor-pointer ${
                color.toLowerCase() === c.toLowerCase()
                  ? "ring-2 ring-offset-2 ring-offset-[#0e0e1a] scale-110" 
                  : "hover:scale-110 opacity-70 hover:opacity-100"
              }`}
              style={{ backgroundColor: c, '--tw-ring-color': c } as React.CSSProperties}
              onClick={() => setColor(c)}
            />
          ))}
          
          {/* Custom Color Selector */}
          <div 
            className={`relative flex items-center justify-center w-8 h-8 rounded-full border cursor-pointer overflow-hidden transition-all ${
              isCustomColor 
                ? "ring-2 ring-offset-2 ring-offset-[#0e0e1a] border-transparent scale-110" 
                : "border-white/20 hover:border-white/40 opacity-75 hover:opacity-100"
            }`}
            style={{ 
              backgroundColor: isCustomColor ? color : 'transparent',
              '--tw-ring-color': isCustomColor ? color : 'transparent'
            } as React.CSSProperties}
          >
            <input
              type="color"
              value={isCustomColor ? color : "#7c3aed"}
              onChange={(e) => setColor(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer scale-150"
            />
            <span className={`text-[9px] font-bold select-none ${isCustomColor ? 'text-black mix-blend-difference' : 'text-white/60'}`}>
              Custom
            </span>
          </div>
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
