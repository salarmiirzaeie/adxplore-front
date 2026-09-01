import {
  IRAN_PROVINCES,
  NATIONWIDE_CITY,
  iranCitiesOf,
  isNationwideCity,
} from '../lib/iran-locations'
import { Select } from './ui/Select'

export interface IranLocationValue {
  province: string
  city: string
}

interface IranCitySelectProps {
  province: string
  city: string
  onChange: (next: IranLocationValue) => void
  provinceError?: string
  cityError?: string
  allowNationwide?: boolean
  optional?: boolean
  variant?: 'form' | 'filter'
  disabled?: boolean
  showLabels?: boolean
}

export function IranCitySelect({
  province,
  city,
  onChange,
  provinceError,
  cityError,
  allowNationwide = false,
  optional = false,
  variant = 'form',
  disabled = false,
  showLabels = false,
}: IranCitySelectProps) {
  const nationwide = isNationwideCity(city)
  const cities = nationwide ? [] : iranCitiesOf(province)
  const provinceValue = nationwide ? NATIONWIDE_CITY : province

  const provinceOptions = [
    ...(allowNationwide && variant === 'filter'
      ? [{ value: NATIONWIDE_CITY, label: NATIONWIDE_CITY }]
      : []),
    ...IRAN_PROVINCES.map((p) => ({ value: p.fa, label: p.fa })),
  ]

  const cityOptions = nationwide
    ? [{ value: NATIONWIDE_CITY, label: NATIONWIDE_CITY }]
    : cities.map((c) => ({ value: c.fa, label: c.fa }))

  const handleProvince = (next: string) => {
    if (next === NATIONWIDE_CITY) {
      onChange({ province: '', city: NATIONWIDE_CITY })
      return
    }
    onChange({ province: next, city: '' })
  }

  const cityDisabled = disabled || nationwide || !province
  const provincePlaceholder = optional ? 'همه استان‌ها' : 'استان را انتخاب کنید'
  const cityPlaceholder = optional ? 'همه شهرها' : 'شهر را انتخاب کنید'

  if (variant === 'filter') {
    const provinceSelect = (
      <select
        className="input-brand py-2.5 text-sm"
        value={provinceValue}
        disabled={disabled}
        onChange={(e) => handleProvince(e.target.value)}
      >
        <option value="">{provincePlaceholder}</option>
        {provinceOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    )
    const citySelect = (
      <select
        className="input-brand py-2.5 text-sm"
        value={nationwide ? NATIONWIDE_CITY : city}
        disabled={cityDisabled}
        onChange={(e) => onChange({ province, city: e.target.value })}
      >
        <option value="">{cityPlaceholder}</option>
        {cityOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    )

    if (showLabels) {
      return (
        <>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-muted">استان</span>
            {provinceSelect}
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-muted">شهر</span>
            {citySelect}
          </label>
        </>
      )
    }

    return (
      <>
        {provinceSelect}
        {citySelect}
      </>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {allowNationwide ? (
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3">
          <input
            type="checkbox"
            className="size-4 accent-[var(--purple)]"
            checked={nationwide}
            disabled={disabled}
            onChange={(e) => {
              if (e.target.checked) {
                onChange({ province: '', city: NATIONWIDE_CITY })
                return
              }
              onChange({ province: '', city: '' })
            }}
          />
          <span className="flex min-w-0 flex-col">
            <span className="text-sm font-semibold text-navy">کل ایران</span>
            <span className="text-xs text-muted">
              کمپین سراسری — در همه شهرها نمایش داده می‌شود
            </span>
          </span>
        </label>
      ) : null}

      {nationwide ? null : (
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="استان"
            placeholder={provincePlaceholder}
            allowEmpty={optional}
            options={provinceOptions}
            value={provinceValue}
            disabled={disabled}
            error={provinceError}
            onChange={(e) => handleProvince(e.target.value)}
          />
          <Select
            label="شهر"
            placeholder={cityPlaceholder}
            allowEmpty={optional}
            options={cityOptions}
            value={city}
            disabled={cityDisabled}
            error={cityError}
            onChange={(e) => onChange({ province, city: e.target.value })}
          />
        </div>
      )}
    </div>
  )
}
