import * as React from "react"
import { AnimatedOrbs } from "@/components/landing/AnimatedOrbs"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background px-4 overflow-hidden py-12">
      <AnimatedOrbs />
      {children}
    </div>
  )
}
