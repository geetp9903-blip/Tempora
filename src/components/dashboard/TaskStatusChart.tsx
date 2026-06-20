"use client";

import { useAnalyticsData } from "@/hooks/useAnalyticsData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface TaskStatusChartProps {
  dateRange: string;
}

export function TaskStatusChart({ dateRange }: TaskStatusChartProps) {
  const { trendData } = useAnalyticsData(dateRange);

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 h-[350px] flex flex-col">
      <h3 className="text-lg font-semibold text-white mb-4">Task Completion Status</h3>
      
      <div className="flex-1 w-full min-h-0">
        {trendData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={trendData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis 
                dataKey="label" 
                stroke="rgba(255,255,255,0.5)" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis 
                stroke="rgba(255,255,255,0.5)" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => Math.round(value).toString()}
              />
              <Tooltip
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                contentStyle={{ 
                  backgroundColor: '#1E1E2E', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
                }}
                itemStyle={{ color: '#fff' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar dataKey="statusCompleted" name="Completed" stackId="a" fill="#10B981" radius={[0, 0, 4, 4]} />
              <Bar dataKey="statusPartial" name="Partial" stackId="a" fill="#F59E0B" />
              <Bar dataKey="statusSkipped" name="Skipped" stackId="a" fill="#EF4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-white/40">
            No data available for this period
          </div>
        )}
      </div>
    </div>
  );
}
