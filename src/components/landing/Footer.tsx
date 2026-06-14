import * as React from "react"

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-border-default/50 py-12 px-6 bg-background relative z-10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-brand-primary flex items-center justify-center font-display font-bold text-primary text-sm">T</div>
          <span className="font-display font-semibold text-primary">Tempora</span>
        </div>
        <p className="text-secondary text-sm">&copy; {new Date().getFullYear()} Tempora. Plan. Schedule. Improve.</p>
      </div>
    </footer>
  )
}
