import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'ghost' | 'outline' | 'soft'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  loading?: boolean
  children: ReactNode
}

const variants: Record<Variant, string> = {
  primary: 'btn-primary',
  soft: 'bg-purple-soft/60 text-purple-deep hover:bg-purple-soft',
  ghost: 'bg-transparent text-muted hover:bg-surface hover:text-navy',
  outline: 'border border-border bg-white text-navy hover:border-purple/40 hover:bg-surface',
}

export function Button({
  variant = 'primary',
  loading = false,
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
      className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
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
