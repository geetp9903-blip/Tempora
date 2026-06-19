"use client";

import { useAnalyticsData } from "@/hooks/useAnalyticsData";
import { CheckCircle2, Clock, ListTodo, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export function KPICards({ dateRange = "week" }: { dateRange?: string }) {
  const { kpiData } = useAnalyticsData(dateRange);

  const completionRate = kpiData.totalTasks ? Math.round((kpiData.totalCompleted / kpiData.totalTasks) * 100) : 0;
  
  const estimatedHours = Math.floor(kpiData.estimatedTimeRemaining / 60);
  const estimatedMins = kpiData.estimatedTimeRemaining % 60;

  // Since we don't have historical trend data implemented for the previous period to compare,
  // we'll hide the hardcoded trend badges for now or just show a label based on the date range
  const rangeLabel = dateRange === "today" ? "today" : 
                     dateRange === "week" ? "this week" :
                     dateRange === "all" ? "all time" : "this month";

  const kpis = [
    {
      title: "Total Tasks",
      value: kpiData.totalTasks,
      icon: ListTodo,
      color: "text-tempora-purple",
      bg: "bg-tempora-purple/10",
      trend: rangeLabel
    },
    {
      title: "Completed",
      value: kpiData.totalCompleted,
      icon: CheckCircle2,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      trend: rangeLabel
    },
    {
      title: "Completion Rate",
      value: `${completionRate}%`,
      icon: TrendingUp,
      color: "text-tempora-cyan",
      bg: "bg-tempora-cyan/10",
      trend: rangeLabel
    },
    {
      title: "Est. Time Remaining",
      value: `${estimatedHours}h ${estimatedMins}m`,
      icon: Clock,
      color: "text-rose-400",
      bg: "bg-rose-500/10",
      trend: rangeLabel
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {kpis.map((kpi, idx) => (
        <motion.div
          key={kpi.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: idx * 0.1 }}
          whileHover={{ 
            y: -4, 
            rotateX: 4, 
            rotateY: -2,
            transition: { duration: 0.2 } 
          }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6 glass-card perspective-1000"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${kpi.bg}`}>
              <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
            </div>
            <span className="text-xs font-medium text-white/40 bg-white/5 px-2 py-1 rounded-full capitalize">
              {kpi.trend}
            </span>
          </div>
          <div>
            <div className="text-3xl font-bold text-white mb-1 tracking-tight">
              {kpi.value}
            </div>
            <div className="text-sm text-white/60 font-medium">
              {kpi.title}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
