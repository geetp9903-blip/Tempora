import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/Button"

export const HeroSection: React.FC = () => {
  return (
    <section className="relative pt-36 pb-20 md:pb-28 flex flex-col items-center justify-center text-center px-6 overflow-hidden min-h-screen">
      <div className="max-w-4xl mx-auto flex flex-col items-center gap-6 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-primary/10 border border-brand-primary/30 rounded-full text-xs font-semibold text-brand-light shadow-[0_0_15px_rgba(124,58,237,0.1)]">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
          Introducing Tempora MVP
        </div>
        <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-bold text-primary tracking-tight leading-none">
          Your Time, <br/>
          <span className="bg-gradient-to-r from-brand-light via-brand-primary to-accent-cyan bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(124,58,237,0.2)]">
            Orchestrated
          </span>
        </h1>
        <p className="text-lg sm:text-xl text-secondary max-w-2xl mt-2">
          Plan. Schedule. Improve. — Tempora brings your tasks, calendar scheduling, and productivity insights into one premium, 3D-inspired workspace.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full sm:w-auto">
          <Link href="/signup" className="w-full sm:w-auto">
            <Button variant="primary" size="lg" className="w-full sm:w-auto px-8">Get Started Free</Button>
          </Link>
          <a href="#features" className="w-full sm:w-auto">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto px-8">See Features</Button>
          </a>
        </div>
      </div>
      
      {/* 3D Dashboard Mockup */}
      <div className="relative w-full max-w-5xl mx-auto mt-16 px-4 md:px-0 z-10 transition-all duration-700 hover:scale-[1.02]">
        <div className="relative rounded-2xl overflow-hidden border border-brand-primary/20 shadow-[0_0_50px_rgba(124,58,237,0.15)] [transform:perspective(1000px)_rotateX(8deg)_translateY(-10px)] hover:[transform:perspective(1000px)_rotateX(2deg)_translateY(0px)] transition-all duration-500">
          <img 
            src="/images/dashboard_mockup.png" 
            alt="Tempora Dashboard Mockup" 
            className="w-full h-auto object-cover rounded-2xl"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent pointer-events-none" />
        </div>
      </div>
    </section>
  )
}
