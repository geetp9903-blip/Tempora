import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured.' },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const body = await req.json();

    const { kpiData, dateRange, categoryData, trendData } = body;

    // Create a summarized string of the category data
    let categoryString = "";
    if (categoryData && Array.isArray(categoryData)) {
       categoryString = categoryData.map((c: any) => `${c.name}: ${Math.round(c.actual)} min`).join(', ');
    }

    // Create a summarized string of the trend data
    let trendString = "";
    if (trendData && Array.isArray(trendData)) {
       trendString = trendData.map((t: any) => `[${t.label}: Planned ${t.planned}m, Actual ${t.actual}m, Completed ${t.completedCount}]`).join(' | ');
    }

    const prompt = `You are an elite performance analyst. Analyze the user's productivity data for the selected period (${dateRange}) and provide 1-2 concise, highly actionable insights. Be direct and analytical without generic cheerleader fluff. Do not greet the user.

Current Performance:
- Total Hours: ${kpiData?.totalHours || 0}
- Efficiency: ${kpiData?.efficiency || 0}%
- Current Streak: ${kpiData?.currentStreak || 0} days

Baseline (Previous Period):
- Previous Total Hours: ${kpiData?.previousTotalHours || 0}
- Previous Efficiency: ${kpiData?.previousEfficiency || 0}%

Category Breakdown:
${categoryString || 'No category data'}

Temporal Trends:
${trendString || 'No trend data'}

Respond with ONLY the insight text, without any markdown formatting like bolding or lists. Just a short, well-written paragraph of 2-3 sentences. Identify specific bottlenecks in the trends (e.g., dropping off on Thursdays), call out massive improvements compared to the baseline, or highlight categorical inefficiencies.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return NextResponse.json({ insight: response.text });
  } catch (error: any) {
    console.error('Error generating AI insight:', error);
    
    // Check for 503 high demand
    if (error.message?.includes('503') || error.status === 503) {
      return NextResponse.json(
        { error: 'Google AI is currently experiencing high demand. Please try again in a few moments.' },
        { status: 503 }
      );
    }

    // Check for 429 quota exceeded
    if (error.message?.includes('429') || error.status === 429) {
      if (error.message?.includes('limit: 0')) {
        return NextResponse.json(
          { error: 'API Quota is 0 for this specific model on your current tier. Please check your Google AI Studio plan.' },
          { status: 429 }
        );
      }
      return NextResponse.json(
        { error: 'You have exceeded your Gemini API quota. Please try again later.' },
        { status: 429 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to generate insight. Please check your API key and try again.' },
      { status: 500 }
    );
  }
}
