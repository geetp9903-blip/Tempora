"use client";

import { useMemo } from "react";
import { useTasks } from "@/hooks/useTasks";
import { useCategories } from "@/hooks/useCategories";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

export function CategoryBreakdownChart() {
  const { tasks } = useTasks();
  const { categories } = useCategories();

  const data = useMemo(() => {
    const counts: Record<string, number> = {};
    
    tasks.forEach(task => {
      const catId = task.category_id || 'uncategorized';
      counts[catId] = (counts[catId] || 0) + 1;
    });

    const chartData = Object.entries(counts).map(([catId, count]) => {
      if (catId === 'uncategorized') {
        return { name: "Uncategorized", value: count, color: "#4b5563" };
      }
      const category = categories.find(c => c.id === catId);
      return { 
        name: category?.name || "Unknown", 
        value: count, 
        color: category?.color || "#7c3aed" 
      };
    }).sort((a, b) => b.value - a.value);

    return chartData;
  }, [tasks, categories]);

  if (data.length === 0) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 h-full flex flex-col items-center justify-center text-center">
        <div className="text-white/40 mb-2">No category data</div>
        <p className="text-sm text-white/30">Create categories and assign tasks to see your breakdown.</p>
      </div>
    );
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 h-full flex flex-col">
      <div className="mb-2">
        <h3 className="text-lg font-bold text-white">Category Breakdown</h3>
      </div>
      
      <div className="flex-1 min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#0e0e1a', 
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '0.5rem'
              }}
              itemStyle={{ color: '#fff' }}
            />
            <Legend verticalAlign="bottom" height={36} iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
