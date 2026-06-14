"use client";

import { KPICards } from "@/components/dashboard/KPICards";
import { WeeklyCompletionChart } from "@/components/dashboard/WeeklyCompletionChart";
import { CategoryBreakdownChart } from "@/components/dashboard/CategoryBreakdownChart";
import { TodayTasksList } from "@/components/dashboard/TodayTasksList";
import { useAuth } from "@/providers/AuthProvider";

export default function DashboardPage() {
  const { user } = useAuth();
  
  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || "User";

  return (
    <div className="flex flex-col gap-6 h-full pb-8">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Welcome back, {firstName}
        </h2>
        <p className="text-white/60 mt-1">Here's your productivity overview for today.</p>
      </div>

      {/* KPI Cards Row */}
      <KPICards />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <WeeklyCompletionChart />
        </div>
        <div className="lg:col-span-1">
          <CategoryBreakdownChart />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <TodayTasksList />
        </div>
        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6 h-[300px] flex flex-col items-center justify-center">
          {/* Placeholder for future features or AI recommendations */}
          <div className="text-tempora-purple/40 mb-2">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-white/80">AI Productivity Insights</h3>
          <p className="text-sm text-white/40 mt-1 max-w-sm text-center">
            Complete more tasks to unlock personalized AI recommendations for your workflow.
          </p>
        </div>
      </div>
    </div>
  );
}
