"use client";

import { SelectHTMLAttributes } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, error, className = "", options, ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-sm font-medium text-white/80 ml-1">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          className={`
            w-full px-4 py-2.5 rounded-xl border appearance-none
            bg-white/5 text-white placeholder:text-white/30
            focus:outline-none focus:ring-2 focus:ring-tempora-purple/50 focus:border-tempora-purple
            transition-all duration-200
            ${error ? "border-red-500/50 focus:ring-red-500/50 focus:border-red-500" : "border-white/10"}
            ${className}
          `}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-tempora-black text-white">
              {opt.label}
            </option>
          ))}
        </select>
        {/* Custom Caret */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-white/40">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>
      {error && <p className="text-xs text-red-400 ml-1">{error}</p>}
    </div>
  );
}
