import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/Button"

export const LandingNav: React.FC = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/30 backdrop-blur-md border-b border-border-default/50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center shadow-[0_0_15px_rgba(124,58,237,0.4)]">
            <span className="font-display font-bold text-primary text-xl">T</span>
          </div>
          <span className="font-display font-bold text-2xl tracking-tight text-primary">Tempora</span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-secondary">
          <a href="#features" className="hover:text-primary transition-colors">Features</a>
          <a href="#workflow" className="hover:text-primary transition-colors">Workflow</a>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="outline" size="sm">Sign In</Button>
          </Link>
          <Link href="/signup">
            <Button variant="primary" size="sm">Get Started</Button>
          </Link>
        </div>
      </div>
    </nav>
  )
}
