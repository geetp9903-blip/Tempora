import * as React from "react"

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  tilt?: boolean
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', tilt = true, ...props }) => {
  return (
    <div
      className={`glass-card p-6 ${tilt ? 'hover:translate-y-[-2px] hover:perspective-[1000px] hover:rotate-x-[2deg]' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
