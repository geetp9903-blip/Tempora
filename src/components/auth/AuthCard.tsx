import * as React from "react"
import { GlassCard } from "@/components/ui/GlassCard"

interface AuthCardProps {
  children: React.ReactNode
  title: string
  subtitle: string
}

export const AuthCard: React.FC<AuthCardProps> = ({ children, title, subtitle }) => {
  return (
    <GlassCard className="w-full max-w-md p-8 relative z-10 flex flex-col gap-6" tilt={false}>
      <div className="flex flex-col gap-2 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center shadow-[0_0_15px_rgba(124,58,237,0.4)]">
            <span className="font-display font-bold text-primary text-xl">T</span>
          </div>
          <span className="font-display font-bold text-2xl tracking-tight text-primary">Tempora</span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-primary">{title}</h1>
        <p className="text-sm text-secondary">{subtitle}</p>
      </div>
      {children}
    </GlassCard>
  )
}
