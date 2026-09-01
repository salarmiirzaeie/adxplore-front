import { getCities, getCity, getProvince, getProvincesList } from '@code-plate/iran-cities'
import type { RefinementCtx } from 'zod'

export const NATIONWIDE_CITY = 'کل ایران'

export const IRAN_PROVINCES = getProvincesList()

export function iranCitiesOf(province: string) {
  if (!province.trim() || province === NATIONWIDE_CITY) return []
  return getCities(province)
}

export function isNationwideCity(city?: string | null) {
  return city?.trim() === NATIONWIDE_CITY
}

export function formatLocation(
  city?: string | null,
  province?: string | null,
) {
  const nextCity = city?.trim()
  if (!nextCity) return null
  const nextProvince = province?.trim()
  if (!nextProvince || isNationwideCity(nextCity) || nextCity === nextProvince) {
    return nextCity
  }
  return `${nextCity}، ${nextProvince}`
}

export function refineIranLocation(
  values: { city: string; province: string },
  ctx: RefinementCtx,
  opts?: { allowNationwide?: boolean },
) {
  const city = values.city.trim()
  const province = values.province.trim()

  if (opts?.allowNationwide && city === NATIONWIDE_CITY) {
    if (province) {
      ctx.addIssue({
        code: 'custom',
        path: ['province'],
        message: 'کمپین سراسری نباید استان داشته باشد',
      })
    }
    return
  }

  if (!province) {
    ctx.addIssue({
      code: 'custom',
      path: ['province'],
      message: 'استان را انتخاب کنید',
    })
    return
  }

  if (!getProvince(province)) {
    ctx.addIssue({
      code: 'custom',
      path: ['province'],
      message: 'استان نامعتبر است',
    })
    return
  }

  if (!city) {
    ctx.addIssue({
      code: 'custom',
      path: ['city'],
      message: 'شهر را انتخاب کنید',
    })
    return
  }

  if (!getCity(city, province)) {
    ctx.addIssue({
      code: 'custom',
      path: ['city'],
      message: 'شهر با این استان مطابقت ندارد',
    })
  }
}
