"use client";

import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { AnalyticsTooltip } from "./AnalyticsTooltip";
import { useAnalyticsData } from "@/hooks/useAnalyticsData";

export function TimeByCategoryChart({ dateRange = "7" }: { dateRange?: string }) {
  const { categoryData } = useAnalyticsData(dateRange);

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6 h-auto min-h-[380px] md:h-[400px] flex flex-col w-full">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-white">Time Distribution by Category</h3>
        <p className="text-sm text-white/60">Where did your tracked time go?</p>
      </div>
      <div className="flex-1 min-h-0 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8">
        {categoryData.length > 0 ? (
          <>
            <div className="h-[180px] md:h-[200px] w-full md:w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="actual"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    stroke="none"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<AnalyticsTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full md:w-1/2 flex flex-col gap-2.5 overflow-y-auto max-h-[140px] md:max-h-[200px] pr-2">
              {categoryData.map((cat, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="text-white/80">{cat.name}</span>
                  </div>
                  <div className="text-white font-medium">
                    {cat.actual > 0 ? `${(cat.actual / 60).toFixed(1)}h` : '< 0.1h'}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-white/40 h-full">
            <PieChart className="w-12 h-12 mb-3 opacity-20" />
            <p>No time tracked in this period.</p>
          </div>
        )}
      </div>
    </div>
  );
}
