import { forwardRef, type InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, className = '', id, ...props },
  ref,
) {
  const inputId = id || props.name

  return (
    <label className="flex w-full flex-col gap-2">
      {label ? <span className="text-sm font-semibold text-navy">{label}</span> : null}
      <input
        ref={ref}
        id={inputId}
        aria-invalid={error ? true : undefined}
        className={`input-brand ${className}`}
        {...props}
      />
      {error ? <span className="text-xs font-medium text-red-500">{error}</span> : null}
      {!error && hint ? <span className="text-xs text-muted">{hint}</span> : null}
    </label>
  )
})
