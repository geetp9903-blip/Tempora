import * as React from "react"
import { LandingNav } from "@/components/landing/LandingNav"
import { HeroSection } from "@/components/landing/HeroSection"
import { FeaturesSection } from "@/components/landing/FeaturesSection"
import { WorkflowSection } from "@/components/landing/WorkflowSection"
import { CTASection } from "@/components/landing/CTASection"
import { Footer } from "@/components/landing/Footer"
import { AnimatedOrbs } from "@/components/landing/AnimatedOrbs"

export default function Home() {
  return (
    <div className="relative min-h-screen bg-background overflow-hidden flex flex-col">
      <AnimatedOrbs />
      <LandingNav />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <WorkflowSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
