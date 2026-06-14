import * as React from "react"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, type = 'text', ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium text-secondary">
            {label}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          className={`px-4 py-3 bg-surface border border-border-default rounded-xl text-primary placeholder:text-secondary focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-glow/30 transition-all duration-200 ${
            error ? 'border-danger focus:ring-danger/20' : ''
          } ${className}`}
          {...props}
        />
        {error && (
          <span className="text-xs text-danger font-medium mt-0.5">
            {error}
          </span>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"
