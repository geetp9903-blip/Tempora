"use client";

import { useState, useRef, useEffect } from "react";
import { Category } from "@/hooks/useCategories";
import { Check, Plus } from "lucide-react";

interface CategoryAutocompleteProps {
  categories: Category[];
  selectedCategoryId: string;
  newCategoryName: string;
  onChange: (id: string, newName: string) => void;
  label?: string;
}

export function CategoryAutocomplete({
  categories,
  selectedCategoryId,
  newCategoryName,
  onChange,
  label = "Category",
}: CategoryAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Sync input value with selection
  useEffect(() => {
    if (selectedCategoryId) {
      const cat = categories.find((c) => c.id === selectedCategoryId);
      if (cat) setInputValue(cat.name);
    } else if (newCategoryName) {
      setInputValue(newCategoryName);
    } else {
      setInputValue("");
    }
  }, [selectedCategoryId, newCategoryName, categories]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(inputValue.toLowerCase())
  );

  const exactMatch = categories.find(
    (c) => c.name.toLowerCase() === inputValue.trim().toLowerCase()
  );

  const showCreateOption = inputValue.trim().length > 0 && !exactMatch;

  const handleSelect = (categoryId: string) => {
    onChange(categoryId, "");
    setIsOpen(false);
  };

  const handleCreate = () => {
    if (inputValue.trim()) {
      onChange("", inputValue.trim());
      setIsOpen(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setIsOpen(true);
    // If input is cleared, clear selection
    if (e.target.value === "") {
      onChange("", "");
    }
  };

  return (
    <div className="flex flex-col gap-1.5 relative" ref={wrapperRef}>
      {label && (
        <label className="text-sm font-medium text-white/80 ml-1">{label}</label>
      )}
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        placeholder="Search or create category..."
        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-tempora-purple/50 focus:border-tempora-purple transition-all duration-200"
      />

      {isOpen && (
        <div className="absolute z-50 top-full left-0 w-full mt-1 bg-[#161627] border border-white/10 rounded-xl shadow-2xl shadow-black overflow-hidden max-h-60 overflow-y-auto">
          {filteredCategories.length > 0 && (
            <div className="py-1">
              {filteredCategories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleSelect(cat.id)}
                  className="w-full px-4 py-2 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-white/90">{cat.name}</span>
                  </div>
                  {selectedCategoryId === cat.id && (
                    <Check className="w-4 h-4 text-tempora-purple" />
                  )}
                </button>
              ))}
            </div>
          )}

          {showCreateOption && (
            <div className={filteredCategories.length > 0 ? "border-t border-white/10" : ""}>
              <button
                type="button"
                onClick={handleCreate}
                className="w-full px-4 py-3 text-left flex items-center gap-2 hover:bg-white/5 text-tempora-cyan transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>
                  Create "<span className="font-semibold">{inputValue.trim()}</span>"
                </span>
              </button>
            </div>
          )}

          {filteredCategories.length === 0 && !showCreateOption && (
            <div className="px-4 py-3 text-white/40 text-sm text-center">
              Type to search or create
            </div>
          )}
        </div>
      )}
    </div>
  );
}
