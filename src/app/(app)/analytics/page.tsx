"use client";

import { useState } from "react";
import { useAnalyticsData } from "@/hooks/useAnalyticsData";
import { Select } from "@/components/ui/Select";
import { CheckCircle2, Clock, Zap, TrendingUp } from "lucide-react";
import { rrulestr } from "rrule";
import { ProductivityTrendChart } from "@/components/analytics/ProductivityTrendChart";
import { PlannedVsActualChart } from "@/components/analytics/PlannedVsActualChart";
import { TimeByCategoryChart } from "@/components/analytics/TimeByCategoryChart";

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState("7");
  const { kpiData } = useAnalyticsData(dateRange);

  return (
    <div className="flex flex-col gap-6 h-full pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Analytics</h2>
          <p className="text-white/60 mt-1">Deep dive into your productivity patterns.</p>
        </div>
        
        <div className="w-full sm:w-48">
          <Select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            options={[
              { value: "7", label: "Last 7 Days" },
              { value: "14", label: "Last 14 Days" },
              { value: "30", label: "Last 30 Days" },
            ]}
          />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col gap-2">
          <div className="flex items-center gap-2 text-white/60">
            <CheckCircle2 className="w-4 h-4 text-tempora-cyan" />
            <span className="text-sm font-medium">Completed</span>
          </div>
          <div className="text-3xl font-bold text-white">{kpiData.totalCompleted}</div>
        </div>
        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col gap-2">
          <div className="flex items-center gap-2 text-white/60">
            <Clock className="w-4 h-4 text-tempora-purple" />
            <span className="text-sm font-medium">Hours Tracked</span>
          </div>
          <div className="text-3xl font-bold text-white">{kpiData.totalHours}h</div>
        </div>
        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col gap-2">
          <div className="flex items-center gap-2 text-white/60">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium">Efficiency</span>
          </div>
          <div className="text-3xl font-bold text-white">
            {kpiData.efficiency > 0 ? `${kpiData.efficiency}%` : '-'}
          </div>
        </div>
        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex flex-col gap-2">
          <div className="flex items-center gap-2 text-white/60">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium">Current Streak</span>
          </div>
          <div className="text-3xl font-bold text-white">{kpiData.currentStreak} <span className="text-lg text-white/40">days</span></div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProductivityTrendChart dateRange={dateRange} />
        <PlannedVsActualChart dateRange={dateRange} />
        <div className="lg:col-span-2">
          <TimeByCategoryChart dateRange={dateRange} />
        </div>
      </div>
    </div>
  );
}
