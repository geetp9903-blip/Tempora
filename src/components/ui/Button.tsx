import * as React from "react"
import { LoadingSpinner } from "./LoadingSpinner"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', isLoading = false, children, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 active:scale-98 cursor-pointer focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
    
    const variants = {
      primary: "bg-brand-primary text-primary border border-brand-light/20 shadow-[0_4px_12px_rgba(124,58,237,0.3),inset_0_1px_0_rgba(255,255,255,0.2)] hover:bg-brand-light hover:shadow-[0_6px_20px_rgba(124,58,237,0.5)] active:translate-y-[1px]",
      secondary: "bg-surface text-primary border border-border-default hover:bg-raised hover:border-brand-primary/40 active:translate-y-[1px]",
      outline: "bg-transparent text-primary border border-border-default hover:border-brand-primary/50 hover:bg-brand-primary/5 active:translate-y-[1px]",
      danger: "bg-danger text-primary hover:bg-red-600 shadow-[0_4px_12px_rgba(239,68,68,0.2)] active:translate-y-[1px]",
      ghost: "bg-transparent text-primary hover:bg-white/5 active:translate-y-[1px]"
    }

    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-5 py-2.5 text-base",
      lg: "px-7 py-3.5 text-lg"
    }

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <LoadingSpinner size="sm" />
            {children}
          </span>
        ) : children}
      </button>
    )
  }
)
Button.displayName = "Button"

