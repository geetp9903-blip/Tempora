"use client";

import { Select } from "@/components/ui/Select";
import { useEffect, useState } from "react";

interface GlobalDateRangeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function GlobalDateRangeSelector({ value, onChange }: GlobalDateRangeSelectorProps) {
  // Determine the base category ('today', 'week', 'month', 'all')
  const [baseRange, setBaseRange] = useState<string>(() => {
    if (value.startsWith("month-")) return "month";
    return value;
  });

  // Track the specifically selected month (default to current month)
  const [selectedMonthStr, setSelectedMonthStr] = useState<string>(() => {
    if (value.startsWith("month-")) {
      return value.replace("month-", "");
    }
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });

  useEffect(() => {
    if (baseRange === "month") {
      onChange(`month-${selectedMonthStr}`);
    } else {
      onChange(baseRange);
    }
  }, [baseRange, selectedMonthStr, onChange]);

  return (
    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto items-start sm:items-center">
      <div className="w-full sm:w-48">
        <Select
          value={baseRange}
          onChange={(e) => setBaseRange(e.target.value)}
          options={[
            { value: "today", label: "Today" },
            { value: "week", label: "This Week" },
            { value: "month", label: "Month" },
            { value: "all", label: "All Time" },
          ]}
        />
      </div>
      
      {baseRange === "month" && (
        <div className="w-full sm:w-48 relative">
          <input
            type="month"
            value={selectedMonthStr}
            onChange={(e) => setSelectedMonthStr(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-white/10 appearance-none bg-white/5 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-tempora-purple/50 focus:border-tempora-purple transition-all duration-200"
            style={{ colorScheme: "dark" }}
          />
        </div>
      )}
    </div>
  );
}
