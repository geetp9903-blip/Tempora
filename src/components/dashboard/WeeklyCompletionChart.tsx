"use client";

import { useMemo } from "react";
import { useTasks } from "@/hooks/useTasks";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export function WeeklyCompletionChart() {
  const { tasks } = useTasks();
  const { events } = useCalendarEvents({ 
    start: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString(),
    end: new Date().toISOString()
  });

  const data = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const today = new Date();
    
    // Helper to get local date string YYYY-MM-DD
    const getLocalDateStr = (dateParam: Date | string | null) => {
      if (!dateParam) return null;
      const d = new Date(dateParam);
      if (isNaN(d.getTime())) return null;
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    // Generate last 7 days of data
    const chartData = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (6 - i));
      return {
        name: days[d.getDay()],
        date: getLocalDateStr(d)!,
        completed: 0,
        added: 0
      };
    });

    tasks.forEach(task => {
      const createdDate = getLocalDateStr(task.created_at);
      const createdMatch = chartData.find(d => d.date === createdDate);
      if (createdMatch) {
        createdMatch.added += 1;
      }

      if (task.status === "completed") {
        const completedDate = task.completed_at 
          ? getLocalDateStr(task.completed_at)
          : getLocalDateStr(task.created_at);
        const match = chartData.find(d => d.date === completedDate);
        if (match) match.completed += 1;
      }
    });

    events.forEach(event => {
      // Add event creations to added count if desired, but we only really care about completed events
      if (event.completed && event.completed_at) {
        const completedDate = getLocalDateStr(event.completed_at);
        const match = chartData.find(d => d.date === completedDate);
        // Avoid double counting if event is linked to task
        if (match && !event.task_id) match.completed += 1;
      }
    });

    return chartData;
  }, [tasks, events]);

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 h-full flex flex-col">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-white">Weekly Activity</h3>
        <p className="text-sm text-white/60 mt-1">Tasks completed vs added over the last 7 days</p>
      </div>
      
      <div className="flex-1 min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.5}/>
                <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorAdded" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.5}/>
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
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
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
