"use client";

import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useCategories } from "@/hooks/useCategories";
import { Search } from "lucide-react";

interface TaskFiltersProps {
  filters: {
    search: string;
    category_id: string;
    status: string;
  };
  onFilterChange: (key: string, value: string) => void;
}

export function TaskFilters({ filters, onFilterChange }: TaskFiltersProps) {
  const { categories } = useCategories();

  const categoryOptions = [
    { value: "", label: "All Categories" },
    ...categories.map(c => ({ value: c.id, label: c.name }))
  ];

  const statusOptions = [
    { value: "", label: "All Statuses" },
    { value: "not_started", label: "Not Started" },
    { value: "in_progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-4 bg-white/5 border border-white/10 rounded-2xl p-4">
      <div className="flex-1 relative">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-white/40" />
        </div>
        <input
          type="text"
          placeholder="Search tasks..."
          value={filters.search}
          onChange={(e) => onFilterChange("search", e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-tempora-black border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-tempora-purple/50 focus:border-tempora-purple transition-all duration-200"
        />
      </div>
      
      <div className="w-full sm:w-48">
        <Select
          value={filters.category_id}
          onChange={(e) => onFilterChange("category_id", e.target.value)}
          options={categoryOptions}
        />
      </div>

      <div className="w-full sm:w-48">
        <Select
          value={filters.status}
          onChange={(e) => onFilterChange("status", e.target.value)}
          options={statusOptions}
        />
      </div>
    </div>
  );
}
