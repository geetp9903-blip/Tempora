import * as React from "react"
import { GlassCard } from "@/components/ui/GlassCard"

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <GlassCard className="flex flex-col gap-4 text-left border border-border-default/50 hover:border-brand-primary/40 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full blur-2xl group-hover:bg-brand-primary/10 transition-all duration-300" />
      <div className="w-12 h-12 rounded-xl bg-brand-primary/15 flex items-center justify-center text-brand-light border border-brand-primary/25">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-primary">{title}</h3>
      <p className="text-secondary text-sm leading-relaxed">{description}</p>
    </GlassCard>
  )
}
