import { forwardRef, type SelectHTMLAttributes } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  hint?: string
  options: Array<{ value: string; label: string }>
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, hint, options, placeholder, className = '', id, ...props },
  ref,
) {
  const selectId = id || props.name

  return (
    <label className="flex w-full flex-col gap-2">
      {label ? <span className="text-sm font-semibold text-navy">{label}</span> : null}
      <select
        ref={ref}
        id={selectId}
        aria-invalid={error ? true : undefined}
        className={`input-brand ${className}`}
        {...props}
      >
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error ? <span className="text-xs font-medium text-red-500">{error}</span> : null}
      {!error && hint ? <span className="text-xs text-muted">{hint}</span> : null}
    </label>
  )
})
