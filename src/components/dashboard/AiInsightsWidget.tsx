"use client";

import { useState, useEffect } from "react";
import { useAnalyticsData } from "@/hooks/useAnalyticsData";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function AiInsightsWidget({ dateRange = "week" }: { dateRange?: string }) {
  const { kpiData, categoryData, trendData } = useAnalyticsData(dateRange);
  const [insight, setInsight] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load cached insight for this date range from sessionStorage to save API quota
  useEffect(() => {
    const cached = sessionStorage.getItem(`ai_insight_${dateRange}`);
    if (cached) {
      setInsight(cached);
    } else {
      setInsight(null);
    }
  }, [dateRange]);

  const generateInsight = async () => {
    setIsLoading(true);
    setInsight(null);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dateRange,
          kpiData,
          categoryData,
          trendData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate insight');
      }

      setInsight(data.insight);
      sessionStorage.setItem(`ai_insight_${dateRange}`, data.insight);
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.message || 'Something went wrong while generating insights.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 h-[350px] sm:h-[400px] flex flex-col w-full relative overflow-hidden group">
      {/* Decorative gradient */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-tempora-purple/10 rounded-full blur-[80px] -z-10 group-hover:bg-tempora-purple/20 transition-colors duration-700" />
      
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-5 h-5 text-tempora-purple" />
        <h3 className="text-lg font-bold text-white">AI Productivity Insights</h3>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative">
        {isLoading ? (
          <div className="flex flex-col items-center gap-4 text-tempora-purple/60">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="text-sm font-medium animate-pulse">Analyzing your productivity data...</p>
          </div>
        ) : errorMsg ? (
          <div className="flex flex-col items-center text-center px-4">
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mb-4 border border-red-500/30">
              <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-red-300 text-sm mb-6 max-w-sm">{errorMsg}</p>
            <button
              onClick={generateInsight}
              className="px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : insight ? (
          <div className="w-full h-full flex flex-col justify-between">
            <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-white/80 leading-relaxed text-sm md:text-base overflow-y-auto">
              {insight}
            </div>
            <button
              onClick={generateInsight}
              className="mt-4 w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium transition-colors"
            >
              Regenerate Insight
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-tempora-purple/20 flex items-center justify-center mb-4 border border-tempora-purple/30">
              <Sparkles className="w-8 h-8 text-tempora-purple" />
            </div>
            <p className="text-white/60 mb-6 max-w-sm">
              Discover hidden patterns in your workflow. Generate a personalized productivity insight based on your {dateRange === 'today' ? "daily" : dateRange === "week" ? "weekly" : dateRange === "all" ? "overall" : "monthly"} data.
            </p>
            <button
              onClick={generateInsight}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-tempora-purple to-[#9d5af2] text-white font-medium hover:opacity-90 transition-opacity flex items-center gap-2 shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_30px_rgba(124,58,237,0.5)]"
            >
              <Sparkles className="w-4 h-4" />
              Generate Insights
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
