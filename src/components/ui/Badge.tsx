import { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "purple" | "cyan" | "green" | "red" | "gray";
  className?: string;
}

export function Badge({ children, variant = "purple", className = "" }: BadgeProps) {
  const variants = {
    purple: "bg-tempora-purple/10 text-tempora-purple border-tempora-purple/20",
    cyan: "bg-tempora-cyan/10 text-tempora-cyan border-tempora-cyan/20",
    green: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    red: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    gray: "bg-white/5 text-white/60 border-white/10",
  };

  return (
    <span 
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
