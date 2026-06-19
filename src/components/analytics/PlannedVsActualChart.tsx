"use client";

import React from "react";
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { AnalyticsTooltip } from "./AnalyticsTooltip";
import { useAnalyticsData } from "@/hooks/useAnalyticsData";

export function PlannedVsActualChart({ dateRange = "week" }: { dateRange?: string }) {
  const { trendData } = useAnalyticsData(dateRange);

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6 h-[350px] sm:h-[400px] flex flex-col w-full">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-white">Time: Planned vs Actual</h3>
        <p className="text-sm text-white/60">Comparison of estimated vs tracked minutes.</p>
      </div>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="label" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} dy={10} />
            <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} dx={-10} allowDecimals={false} />
            <Tooltip content={<AnalyticsTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)' }} />
            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }} />
            <Line 
              type="monotone" 
              dataKey="planned" 
              name="Planned (min)" 
              stroke="#7c3aed" 
              strokeWidth={3} 
              dot={{ r: 4, fill: '#0e0e1a', strokeWidth: 2 }} 
              activeDot={{ r: 6, fill: '#7c3aed', stroke: '#0e0e1a', strokeWidth: 2 }} 
            />
            <Line 
              type="monotone" 
              dataKey="actual" 
              name="Actual (min)" 
              stroke="#06b6d4" 
              strokeWidth={3} 
              dot={{ r: 4, fill: '#0e0e1a', strokeWidth: 2 }} 
              activeDot={{ r: 6, fill: '#06b6d4', stroke: '#0e0e1a', strokeWidth: 2 }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
