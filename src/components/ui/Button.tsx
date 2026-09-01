import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'ghost' | 'outline' | 'soft'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  loading?: boolean
  fullWidth?: boolean
  children: ReactNode
}

const variants: Record<Variant, string> = {
  primary: 'btn-primary',
  soft: 'bg-purple-soft/60 text-purple-deep hover:bg-purple-soft',
  ghost: 'bg-transparent text-muted hover:bg-surface hover:text-navy',
  outline: 'border border-border bg-surface-elevated text-navy hover:border-purple/40 hover:bg-surface',
}

export function Button({
  variant = 'primary',
  loading = false,
  fullWidth = true,
  disabled,
  children,
  className = '',
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-50 ${fullWidth ? 'w-full' : 'w-auto shrink-0'} ${variants[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span>لطفاً صبر کنید…</span>
        </>
      ) : (
        children
      )}
    </button>
  )
}
