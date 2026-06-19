'use client'

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/Button"
import { usePageLoader } from "@/providers/PageLoaderProvider"

export const LandingNav: React.FC = () => {
  const { navigate } = usePageLoader()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/30 backdrop-blur-md border-b border-border-default/50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 relative">
            <Image src="/icon.png" alt="Tempora Logo" fill className="object-contain" />
          </div>
          <span className="font-display font-bold text-2xl tracking-tight text-primary">Tempora</span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-secondary">
          <a href="#features" className="hover:text-primary transition-colors">Features</a>
          <a href="#workflow" className="hover:text-primary transition-colors">Workflow</a>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/login')}
          >
            Sign In
          </Button>
          <Button 
            variant="primary" 
            size="sm" 
            onClick={() => navigate('/signup')}
          >
            Get Started
          </Button>
        </div>
      </div>
    </nav>
  )
}
