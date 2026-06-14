"use client";

import { useMemo, useState } from "react";
import { useTasks } from "@/hooks/useTasks";
import { useCategories } from "@/hooks/useCategories";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line
} from "recharts";
import { Select } from "@/components/ui/Select";

export default function AnalyticsPage() {
  const { tasks } = useTasks();
  const { categories } = useCategories();
  const { events } = useCalendarEvents();
  
  const [dateRange, setDateRange] = useState("7"); // 7 days, 30 days, 90 days

  // Planned vs Actual Time Chart Data (Cyan vs Purple)
  const plannedVsActualData = useMemo(() => {
    // We compare estimated_minutes from tasks with actual_minutes from completed events
    const days = parseInt(dateRange);
    const today = new Date();
    
    return Array.from({ length: Math.min(days, 14) }).map((_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (Math.min(days, 14) - 1 - i));
      const dateStr = d.toISOString().split('T')[0];
      
      let planned = 0;
      let actual = 0;
      let tasksCompleted = 0;

      tasks.forEach(task => {
        if (task.created_at.split('T')[0] === dateStr) {
          planned += task.estimated_minutes || 0;
        }
        
        if (task.status === "completed") {
          const completedDate = task.completed_at 
            ? task.completed_at.split('T')[0] 
            : task.created_at.split('T')[0];
          if (completedDate === dateStr) {
            tasksCompleted += 1;
          }
        }
      });

      events.forEach(event => {
        if (event.completed && event.completed_at?.split('T')[0] === dateStr) {
          actual += event.actual_minutes || 0;
        }
      });

      return {
        date: dateStr.split('-').slice(1).join('/'), // MM/DD
        planned,
        actual,
        tasksCompleted
      };
    });
  }, [tasks, events, dateRange]);

  return (
    <div className="flex flex-col gap-6 h-full pb-8">
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
              { value: "30", label: "Last 30 Days" },
              { value: "90", label: "Last 90 Days" },
            ]}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Planned vs Actual Chart */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 h-[400px] flex flex-col">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white">Planned vs Actual Time (min)</h3>
            <p className="text-sm text-white/60">Estimated task time vs actual tracked time.</p>
          </div>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={plannedVsActualData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} dx={-10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0e0e1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.75rem' }}
                  itemStyle={{ color: '#fff' }}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                <Bar dataKey="planned" name="Planned Time" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                <Bar dataKey="actual" name="Actual Time" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Productivity Trend Chart */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 h-[400px] flex flex-col">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white">Productivity Trend</h3>
            <p className="text-sm text-white/60">Tasks completed over time.</p>
          </div>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={plannedVsActualData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} dx={-10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0e0e1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.75rem' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="tasksCompleted" 
                  name="Tasks Completed" 
                  stroke="#06b6d4" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#0e0e1a', strokeWidth: 2 }} 
                  activeDot={{ r: 6, fill: '#06b6d4' }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
