export function OptionGrid<T extends string>({
  label,
  options,
  value,
  onChange,
  error,
  optional,
}: {
  label: string
  options: Array<{ value: T; label: string }>
  value: T | '' | undefined
  onChange: (value: T | '') => void
  error?: string
  optional?: boolean
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-navy">{label}</span>
        {optional ? <span className="text-xs text-muted">اختیاری</span> : null}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {options.map((opt) => {
          const selected = value === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(selected && optional ? '' : opt.value)}
              className={`rounded-xl border px-3 py-3 text-right text-sm font-semibold transition ${
                selected
                  ? 'border-purple bg-purple-soft/50 text-navy shadow-[0_0_0_1px_var(--purple)]'
                  : 'border-border bg-white text-navy-muted hover:border-purple/40 hover:bg-surface'
              }`}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
      {error ? <span className="text-xs font-medium text-red-500">{error}</span> : null}
    </div>
  )
}
