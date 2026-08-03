import { forwardRef, type TextareaHTMLAttributes } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ label, error, hint, className = '', id, ...props }, ref) {
    const textareaId = id || props.name

    return (
      <label className="flex w-full flex-col gap-2">
        {label ? <span className="text-sm font-semibold text-navy">{label}</span> : null}
        <textarea
          ref={ref}
          id={textareaId}
          aria-invalid={error ? true : undefined}
          className={`input-brand min-h-28 resize-y ${className}`}
          {...props}
        />
        {error ? <span className="text-xs font-medium text-red-500">{error}</span> : null}
        {!error && hint ? <span className="text-xs text-muted">{hint}</span> : null}
      </label>
    )
  },
)
