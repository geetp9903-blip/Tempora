import * as React from "react"
import { GlassCard } from "@/components/ui/GlassCard"

export const WorkflowSection: React.FC = () => {
  return (
    <section id="workflow" className="py-24 relative px-6 max-w-7xl mx-auto">
      <div className="flex flex-col gap-4 max-w-2xl mx-auto text-center mb-16">
        <h2 className="font-display text-3xl sm:text-5xl font-bold text-primary">The Tempora Journey</h2>
        <p className="text-secondary text-base">We believe productivity is not just about doing, but reviewing and learning from your day.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
        <GlassCard className="flex flex-col gap-4 text-center md:text-left relative z-10" tilt={false}>
          <div className="w-10 h-10 rounded-full bg-brand-primary flex items-center justify-center font-display font-bold text-lg text-primary shadow-[0_0_15px_rgba(124,58,237,0.3)] mx-auto md:mx-0">
            1
          </div>
          <h3 className="text-xl font-bold text-primary">Plan</h3>
          <p className="text-secondary text-sm">
            Jot down your tasks, estimate how long they will take, and group them by custom color-coded categories (Work, Personal, Health, etc.).
          </p>
        </GlassCard>

        <GlassCard className="flex flex-col gap-4 text-center md:text-left relative z-10" tilt={false}>
          <div className="w-10 h-10 rounded-full bg-brand-primary/50 border border-brand-primary flex items-center justify-center font-display font-bold text-lg text-primary shadow-[0_0_15px_rgba(124,58,237,0.2)] mx-auto md:mx-0">
            2
          </div>
          <h3 className="text-xl font-bold text-primary">Schedule</h3>
          <p className="text-secondary text-sm">
            Drag your tasks directly into your calendar. Block out your time visually to protect your focus and structure your schedule.
          </p>
        </GlassCard>

        <GlassCard className="flex flex-col gap-4 text-center md:text-left relative z-10 border border-accent-cyan/30 bg-accent-cyan/5" tilt={false}>
          <div className="w-10 h-10 rounded-full bg-accent-cyan flex items-center justify-center font-display font-bold text-lg text-primary shadow-[0_0_15px_rgba(6,182,212,0.3)] mx-auto md:mx-0">
            3
          </div>
          <h3 className="text-xl font-bold text-accent-cyan">Improve</h3>
          <p className="text-secondary text-sm">
            Mark calendar events complete, input the actual time spent, and view beautiful charts comparing your expectations with reality.
          </p>
        </GlassCard>
      </div>
    </section>
  )
}
