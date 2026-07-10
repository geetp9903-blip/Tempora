"use client";

import { useMemo, useState } from "react";
import { useAnalyticsData } from "@/hooks/useAnalyticsData";
import { X } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export function WeeklyCompletionChart({ dateRange = "week" }: { dateRange?: string }) {
  const { trendData } = useAnalyticsData(dateRange);

  const data = useMemo(() => {
    // Map trendData to AreaChart format
    return trendData.map(d => {
      // If it's week mode, we can format labels as days of week instead of dates,
      // but useAnalyticsData returns "Month/Day" by default. Let's convert week mode dates to weekday names
      // or just use d.label directly.
      let name = d.label;
      if (dateRange === "week" && d.dateStr.includes("-")) {
         const [year, month, day] = d.dateStr.split('-');
         const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
         const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
         name = days[dateObj.getDay()];
      }
      return {
        name,
        date: d.dateStr,
        added: d.added,
        completed: d.completedCount,
        partial: d.statusPartial || 0,
        skipped: d.statusSkipped || 0
      };
    }); 
  }, [trendData, dateRange]);

  const title = dateRange === "today" ? "Today's Activity" :
                dateRange === "week" ? "Weekly Activity" :
                dateRange === "all" ? "All Time Activity" : "Monthly Activity";
  
  const subtitle = dateRange === "today" ? "Tasks completed vs added today" :
                   dateRange === "week" ? "Tasks completed vs added this week" :
                   dateRange === "all" ? "Tasks completed vs added all time" : "Tasks completed vs added this month";

  const [selectedData, setSelectedData] = useState<any>(null);

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 h-full flex flex-col">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-white">{title}</h3>
        <p className="text-sm text-white/60 mt-1">{subtitle}</p>
      </div>
      
      <div className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart 
            data={data} 
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            onClick={(e: any) => {
              if (e && e.activePayload && e.activePayload.length > 0) {
                setSelectedData(e.activePayload[0].payload);
              }
            }}
          >
            <defs>
              <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.5}/>
                <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorAdded" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.5}/>
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorPartial" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.5}/>
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorSkipped" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.5}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis 
              dataKey="name" 
              stroke="rgba(255,255,255,0.3)" 
              fontSize={12} 
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis 
              stroke="rgba(255,255,255,0.3)" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
              dx={-10}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#0e0e1a', 
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '0.75rem',
                boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
              }}
              itemStyle={{ color: '#fff' }}
            />
            <Area 
              type="monotone" 
              dataKey="added" 
              name="Added"
              stroke="#06b6d4" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorAdded)" 
            />
            <Area 
              type="monotone" 
              dataKey="completed" 
              name="Completed"
              stroke="#7c3aed" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorCompleted)" 
            />
            <Area 
              type="monotone" 
              dataKey="partial" 
              name="Partial"
              stroke="#f59e0b" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorPartial)" 
            />
            <Area 
              type="monotone" 
              dataKey="skipped" 
              name="Skipped"
              stroke="#ef4444" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorSkipped)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {selectedData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-[#12121a] border border-white/10 rounded-2xl p-6 w-full max-w-sm relative">
            <button 
              onClick={() => setSelectedData(null)}
              className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-white mb-1">{selectedData.name} Details</h3>
            <p className="text-white/50 text-sm mb-6">{selectedData.date}</p>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-[#06b6d4]"></div>
                  <span className="text-white/80">Added</span>
                </div>
                <span className="text-white font-bold">{selectedData.added}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-[#7c3aed]"></div>
                  <span className="text-white/80">Completed</span>
                </div>
                <span className="text-white font-bold">{selectedData.completed}</span>
              </div>

              <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-[#f59e0b]"></div>
                  <span className="text-white/80">Partial</span>
                </div>
                <span className="text-white font-bold">{selectedData.partial}</span>
              </div>

              <div className="flex justify-between items-center p-3 rounded-lg bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-[#ef4444]"></div>
                  <span className="text-white/80">Skipped</span>
                </div>
                <span className="text-white font-bold">{selectedData.skipped}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
