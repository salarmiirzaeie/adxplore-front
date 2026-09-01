import { forwardRef, type ChangeEvent, type InputHTMLAttributes } from 'react'
import { toEnglishDigits } from '../../lib/digits'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

function isNumericEntry(
  type: InputHTMLAttributes<HTMLInputElement>['type'],
  inputMode: InputHTMLAttributes<HTMLInputElement>['inputMode'],
) {
  return (
    type === 'number' ||
    type === 'tel' ||
    inputMode === 'numeric' ||
    inputMode === 'decimal' ||
    inputMode === 'tel'
  )
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, className = '', id, type, inputMode, onChange, ...props },
  ref,
) {
  const inputId = id || props.name
  const numeric = isNumericEntry(type, inputMode)
  const resolvedType = type === 'number' ? 'text' : type
  const resolvedInputMode = inputMode ?? (type === 'number' ? 'numeric' : undefined)

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (numeric) {
      const next = toEnglishDigits(event.target.value)
      if (next !== event.target.value) {
        event.target.value = next
      }
    }
    onChange?.(event)
  }

  return (
    <label className="flex w-full flex-col gap-2">
      {label ? <span className="text-sm font-semibold text-navy">{label}</span> : null}
      <input
        ref={ref}
        id={inputId}
        {...props}
        type={resolvedType}
        inputMode={resolvedInputMode}
        aria-invalid={error ? true : undefined}
        className={`input-brand ${className}`}
        onChange={handleChange}
      />
      {error ? <span className="text-xs font-medium text-red-500">{error}</span> : null}
      {!error && hint ? <span className="text-xs text-muted">{hint}</span> : null}
    </label>
  )
})
