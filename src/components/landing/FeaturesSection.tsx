import * as React from "react"
import { FeatureCard } from "./FeatureCard"
import { CheckSquare, Calendar, BarChart3 } from "lucide-react"

export const FeaturesSection: React.FC = () => {
  return (
    <section id="features" className="py-24 relative px-6 max-w-7xl mx-auto text-center">
      <div className="flex flex-col gap-4 max-w-2xl mx-auto mb-16">
        <h2 className="font-display text-3xl sm:text-5xl font-bold text-primary">Designed to Help You Grow</h2>
        <p className="text-secondary text-base">Everything you need to orchestrate your day, keep track of details, and look back at your performance to improve.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <FeatureCard 
          icon={<CheckSquare className="w-6 h-6" />}
          title="Task Management"
          description="Create categorized tasks, assign estimated times, and prioritize. Everything cascades smoothly into your scheduler."
        />
        <FeatureCard 
          icon={<Calendar className="w-6 h-6" />}
          title="Intelligent Calendar"
          description="Google Calendar-style scheduler. Drag, resize, and structure your day using category color-coding for a visual split of your time."
        />
        <FeatureCard 
          icon={<BarChart3 className="w-6 h-6" />}
          title="Performance Analytics"
          description="Leans into your actual completion times. Look at charts comparing planned vs actual hours to optimize your future scheduling."
        />
      </div>
    </section>
  )
}
