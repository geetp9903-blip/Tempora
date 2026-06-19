"use client";

import React from "react";
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend, LabelList } from "recharts";
import { AnalyticsTooltip } from "./AnalyticsTooltip";
import { useAnalyticsData } from "@/hooks/useAnalyticsData";

export function PlannedVsActualChart({ dateRange = "7" }: { dateRange?: string }) {
  const { trendData } = useAnalyticsData(dateRange);

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6 h-[350px] sm:h-[400px] flex flex-col w-full">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-white">Time: Planned vs Actual</h3>
        <p className="text-sm text-white/60">Comparison of estimated vs tracked minutes.</p>
      </div>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={trendData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="label" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} dy={10} />
            <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} dx={-10} />
            <Tooltip content={<AnalyticsTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }} />
            <Bar dataKey="planned" name="Planned (min)" fill="#7c3aed" radius={[4, 4, 0, 0]} maxBarSize={40}>
              <LabelList dataKey="planned" position="top" formatter={(v: any) => typeof v === "number" && v > 0 ? `${v}m` : ""} fill="rgba(255,255,255,0.7)" fontSize={10} offset={4} />
            </Bar>
            <Bar dataKey="actual" name="Actual (min)" fill="#06b6d4" radius={[4, 4, 0, 0]} maxBarSize={40}>
              <LabelList dataKey="actual" position="top" formatter={(v: any) => typeof v === "number" && v > 0 ? `${v}m` : ""} fill="rgba(255,255,255,0.7)" fontSize={10} offset={4} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
