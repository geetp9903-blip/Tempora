import * as React from "react"

export const AnimatedOrbs: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute top-[10%] left-[20%] w-[30vw] h-[30vw] rounded-full bg-brand-primary/10 blur-[120px] animate-float" />
      <div className="absolute bottom-[20%] right-[10%] w-[35vw] h-[35vw] rounded-full bg-accent-cyan/5 blur-[150px] animate-float [animation-delay:2s]" />
      <div className="absolute top-[50%] left-[60%] w-[25vw] h-[25vw] rounded-full bg-brand-light/5 blur-[100px] animate-float [animation-delay:4s]" />
    </div>
  )
}
