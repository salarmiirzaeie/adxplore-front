import DatePickerImport, { DateObject as DateObjectImport } from 'react-multi-date-picker'
import gregorianImport from 'react-date-object/calendars/gregorian'
import persianImport from 'react-date-object/calendars/persian'
import persianFaImport from 'react-date-object/locales/persian_fa'
import ToolbarImport from 'react-multi-date-picker/plugins/toolbar'
import 'react-multi-date-picker/styles/colors/purple.css'
import type DateObjectType from 'react-date-object'
import type { Calendar, Locale } from 'react-date-object'

function unwrap<T>(mod: T | { default: T }): T {
  if (mod && typeof mod === 'object' && 'default' in (mod as object)) {
    const inner = (mod as { default: T }).default
    if (inner) return inner
  }
  return mod as T
}

const DatePicker = unwrap(DatePickerImport)
const DateObject = unwrap(DateObjectImport)
const Toolbar = unwrap(ToolbarImport)
const gregorian = unwrap(gregorianImport) as Calendar
const persian = unwrap(persianImport) as Calendar
const persian_fa = unwrap(persianFaImport) as Locale

function toPickerValue(iso: string) {
  if (!iso.trim()) return null
  return new DateObject({
    date: iso,
    format: 'YYYY-MM-DD',
    calendar: gregorian,
  }).convert(persian, persian_fa)
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function toIso(date: DateObjectType | DateObjectType[] | null) {
  if (!date || Array.isArray(date)) return ''
  try {
    const js = date.toDate()
    if (!(js instanceof Date) || Number.isNaN(js.getTime())) return ''
    return `${js.getFullYear()}-${pad(js.getMonth() + 1)}-${pad(js.getDate())}`
  } catch {
    return ''
  }
}

export function JalaliDatePicker({
  label,
  value,
  onChange,
  error,
  hint,
  placeholder = 'انتخاب تاریخ',
}: {
  label?: string
  value: string
  onChange: (value: string) => void
  error?: string
  hint?: string
  placeholder?: string
}) {
  return (
    <label className="flex w-full flex-col gap-2">
      {label ? (
        <span className="text-sm font-semibold text-navy">{label}</span>
      ) : null}
      <DatePicker
        calendar={persian}
        locale={persian_fa}
        calendarPosition="bottom-right"
        format="YYYY/MM/DD"
        placeholder={placeholder}
        value={toPickerValue(value)}
        onChange={(date) => onChange(toIso(date))}
        containerClassName="adx-datepicker"
        inputClass={`input-brand ${error ? 'adx-datepicker-invalid' : ''}`}
        className="purple adx-datepicker-calendar"
        shadow={false}
        arrow={false}
        hideOnScroll
        plugins={[
          <Toolbar
            key="toolbar"
            position="bottom"
            sort={['today', 'deselect']}
          />,
        ]}
      />
      {error ? (
        <span className="text-xs font-medium text-red-500">{error}</span>
      ) : null}
      {!error && hint ? <span className="text-xs text-muted">{hint}</span> : null}
    </label>
  )
}
