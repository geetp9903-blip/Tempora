import * as React from "react"
import { GlassCard } from "@/components/ui/GlassCard"
import Image from "next/image"

interface AuthCardProps {
  children: React.ReactNode
  title: string
  subtitle: string
}

export const AuthCard: React.FC<AuthCardProps> = ({ children, title, subtitle }) => {
  return (
    <GlassCard className="w-full max-w-md p-8 relative z-10 flex flex-col gap-6" tilt={false}>
      <div className="flex flex-col gap-2 text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-8 h-8 relative">
            <Image src="/icon.png" alt="Tempora Logo" fill className="object-contain animate-pulse-glow" />
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
