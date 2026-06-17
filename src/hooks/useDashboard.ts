import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export type WidgetId = 
  | 'kpi' 
  | 'weekly_chart' 
  | 'category_chart' 
  | 'today_tasks' 
  | 'ai_insights'
  | 'analytics_trend'
  | 'analytics_planned'
  | 'analytics_time';

export const WIDGET_OPTIONS: { id: WidgetId; name: string; description: string; defaultEnabled: boolean }[] = [
  { id: 'kpi', name: 'KPI Cards', description: 'Overview of completed tasks, tracked hours, and efficiency.', defaultEnabled: true },
  { id: 'weekly_chart', name: 'Weekly Completion Chart', description: 'Bar chart showing tasks completed over the last 7 days.', defaultEnabled: true },
  { id: 'category_chart', name: 'Category Breakdown', description: 'Pie chart showing tasks by category.', defaultEnabled: true },
  { id: 'today_tasks', name: 'Today\'s Tasks', description: 'List of tasks scheduled or created today.', defaultEnabled: true },
  { id: 'ai_insights', name: 'AI Insights Placeholder', description: 'Future AI recommendations section.', defaultEnabled: true },
  { id: 'analytics_trend', name: 'Productivity Trend', description: 'Line chart showing task and event completion trends.', defaultEnabled: false },
  { id: 'analytics_planned', name: 'Time: Planned vs Actual', description: 'Bar chart comparing estimated vs tracked minutes.', defaultEnabled: false },
  { id: 'analytics_time', name: 'Time by Category', description: 'Pie chart showing where your tracked time went.', defaultEnabled: false }
];

const DEFAULT_LAYOUT: WidgetId[] = WIDGET_OPTIONS.filter(w => w.defaultEnabled).map(w => w.id);

export function useDashboard() {
  const { user } = useAuth();
  const [layout, setLayout] = useState<WidgetId[]>(DEFAULT_LAYOUT);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Load from local storage immediately for fast render
    const localLayout = localStorage.getItem('tempora_dashboard_layout');
    if (localLayout) {
      try {
        setLayout(JSON.parse(localLayout));
      } catch (e) {
        console.error('Failed to parse local dashboard layout', e);
      }
    }

    // Sync with Supabase user_metadata if available
    if (user?.user_metadata?.dashboard_layout) {
      setLayout(user.user_metadata.dashboard_layout);
    }
    
    setIsLoading(false);
  }, [user]);

  const updateLayout = async (newLayout: WidgetId[]) => {
    setLayout(newLayout);
    localStorage.setItem('tempora_dashboard_layout', JSON.stringify(newLayout));

    if (user) {
      try {
        const { error } = await supabase.auth.updateUser({
          data: { dashboard_layout: newLayout }
        });
        if (error) throw error;
      } catch (err) {
        console.error('Error updating dashboard layout to Supabase', err);
        toast.error('Failed to sync dashboard preferences');
      }
    }
  };

  const toggleWidget = async (widgetId: WidgetId) => {
    const isEnabled = layout.includes(widgetId);
    let newLayout;
    if (isEnabled) {
      newLayout = layout.filter(id => id !== widgetId);
    } else {
      newLayout = [...layout, widgetId];
    }
    await updateLayout(newLayout);
  };

  return {
    layout,
    isLoading,
    updateLayout,
    toggleWidget,
    availableWidgets: WIDGET_OPTIONS
  };
}
