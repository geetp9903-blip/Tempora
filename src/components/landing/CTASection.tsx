import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/Button"

export const CTASection: React.FC = () => {
  return (
    <section className="py-24 relative px-6 max-w-5xl mx-auto text-center">
      <div className="glass-card p-12 md:p-20 flex flex-col items-center gap-6 border border-brand-primary/20 relative overflow-hidden">
        <div className="absolute -top-[50%] left-[50%] -translate-x-[50%] w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-[100px]" />
        <h2 className="font-display text-3xl sm:text-5xl font-bold text-primary tracking-tight max-w-2xl relative z-10">
          Ready to Orchestrate Your Time?
        </h2>
        <p className="text-secondary text-base max-w-xl relative z-10">
          Join Tempora today and start planning, scheduling, and improving your daily routine. Free to use.
        </p>
        <Link href="/signup" className="relative z-10 mt-4">
          <Button variant="primary" size="lg" className="px-10">Get Started Free</Button>
        </Link>
      </div>
    </section>
  )
}
