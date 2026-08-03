import type { BrandCategory, BrandGoal, BusinessSize } from '../types/api'

export const BRAND_CATEGORIES: Array<{ value: BrandCategory; label: string }> = [
  { value: 'BEAUTY', label: 'زیبایی و آرایشی' },
  { value: 'FASHION', label: 'مد و پوشاک' },
  { value: 'FOOD', label: 'غذا و نوشیدنی' },
  { value: 'HEALTH', label: 'سلامت و تناسب' },
  { value: 'TECH', label: 'تکنولوژی' },
  { value: 'EDUCATION', label: 'آموزش' },
  { value: 'TRAVEL', label: 'سفر و گردشگری' },
  { value: 'SPORTS', label: 'ورزش' },
  { value: 'HOME', label: 'خانه و زندگی' },
  { value: 'FINANCE', label: 'مالی و بیمه' },
  { value: 'ENTERTAINMENT', label: 'سرگرمی' },
  { value: 'OTHER', label: 'سایر' },
]

export const BRAND_GOALS: Array<{ value: BrandGoal; label: string }> = [
  { value: 'AWARENESS', label: 'آگاهی از برند' },
  { value: 'SALES', label: 'فروش' },
  { value: 'CONTENT', label: 'تولید محتوا' },
  { value: 'LAUNCH', label: 'لانچ محصول' },
]

export const BUSINESS_SIZES: Array<{ value: BusinessSize; label: string }> = [
  { value: 'SOLO', label: 'فردی / فریلنسر' },
  { value: 'SME', label: 'کسب‌وکار کوچک و متوسط' },
  { value: 'AGENCY', label: 'آژانس' },
  { value: 'ENTERPRISE', label: 'سازمان بزرگ' },
]

export const IRAN_CITIES = [
  'تهران',
  'کرج',
  'اصفهان',
  'مشهد',
  'شیراز',
  'تبریز',
  'اهواز',
  'قم',
  'کرمان',
  'رشت',
  'یزد',
  'همدان',
  'ارومیه',
  'کرمانشاه',
  'بندرعباس',
  'سایر',
] as const

export function brandCategoryLabel(value: BrandCategory | null | undefined) {
  if (!value) return null
  return BRAND_CATEGORIES.find((c) => c.value === value)?.label ?? value
}

export function brandGoalLabel(value: BrandGoal | null | undefined) {
  if (!value) return null
  return BRAND_GOALS.find((g) => g.value === value)?.label ?? value
}

export function businessSizeLabel(value: BusinessSize | null | undefined) {
  if (!value) return null
  return BUSINESS_SIZES.find((s) => s.value === value)?.label ?? value
}
