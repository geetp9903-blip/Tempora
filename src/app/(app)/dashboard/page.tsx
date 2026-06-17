"use client";

import { useAuth } from "@/providers/AuthProvider";
import { useDashboard, WidgetId } from "@/hooks/useDashboard";
import { KPICards } from "@/components/dashboard/KPICards";
import { WeeklyCompletionChart } from "@/components/dashboard/WeeklyCompletionChart";
import { CategoryBreakdownChart } from "@/components/dashboard/CategoryBreakdownChart";
import { TodayTasksList } from "@/components/dashboard/TodayTasksList";
import { ProductivityTrendChart } from "@/components/analytics/ProductivityTrendChart";
import { PlannedVsActualChart } from "@/components/analytics/PlannedVsActualChart";
import { TimeByCategoryChart } from "@/components/analytics/TimeByCategoryChart";

const AiInsightsPlaceholder = () => (
  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 h-[300px] flex flex-col items-center justify-center w-full">
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
);

// Registry mapping widget IDs to their components and grid spans
const WIDGET_REGISTRY: Record<WidgetId, { component: React.FC<any>, spanClass: string }> = {
  kpi: { component: KPICards, spanClass: "col-span-1 lg:col-span-3" },
  weekly_chart: { component: WeeklyCompletionChart, spanClass: "col-span-1 lg:col-span-2" },
  category_chart: { component: CategoryBreakdownChart, spanClass: "col-span-1" },
  today_tasks: { component: TodayTasksList, spanClass: "col-span-1 lg:col-span-1" },
  ai_insights: { component: AiInsightsPlaceholder, spanClass: "col-span-1 lg:col-span-2" },
  analytics_trend: { component: ProductivityTrendChart, spanClass: "col-span-1 lg:col-span-2" },
  analytics_planned: { component: PlannedVsActualChart, spanClass: "col-span-1 lg:col-span-1" },
  analytics_time: { component: TimeByCategoryChart, spanClass: "col-span-1 lg:col-span-3" },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { layout, isLoading } = useDashboard();
  
  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || "User";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  // Group widgets that span the full width (like KPI) to break the normal 3-col grid flow gracefully
  // CSS Grid will naturally handle varying spans, but we need the main container to be 3 columns
  return (
    <div className="flex flex-col gap-6 h-full pb-8">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Welcome back, {firstName}
        </h2>
        <p className="text-white/60 mt-1">Here's your customized productivity overview.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 auto-rows-min">
        {layout.map((widgetId) => {
          const WidgetConfig = WIDGET_REGISTRY[widgetId];
          if (!WidgetConfig) return null;
          
          const WidgetComponent = WidgetConfig.component;
          return (
            <div key={widgetId} className={WidgetConfig.spanClass}>
              <WidgetComponent dateRange="7" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
