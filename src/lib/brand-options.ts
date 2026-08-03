import type {
  BrandCategory,
  BrandGoal,
  BusinessSize,
  CampaignStatus,
  DeliverableType,
  FollowerRange,
} from '../types/api'

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

/** Same niche list — used for influencer category matching. */
export const INFLUENCER_CATEGORIES = BRAND_CATEGORIES

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

export const FOLLOWER_RANGES: Array<{ value: FollowerRange; label: string }> = [
  { value: 'UNDER_1K', label: '<1k' },
  { value: 'FROM_1K_5K', label: '1k–5k' },
  { value: 'FROM_5K_10K', label: '5k–10k' },
  { value: 'FROM_10K_50K', label: '10k–50k' },
  { value: 'FROM_50K_100K', label: '50k–100k' },
  { value: 'FROM_100K_500K', label: '100k–500k' },
  { value: 'OVER_500K', label: '500k+' },
]

export const DELIVERABLE_TYPES: Array<{
  value: DeliverableType
  label: string
}> = [
  { value: 'STORY', label: 'استوری' },
  { value: 'POST', label: 'پست' },
  { value: 'REEL', label: 'ریلز' },
]

export const CAMPAIGN_STATUSES: Array<{
  value: CampaignStatus
  label: string
}> = [
  { value: 'DRAFT', label: 'پیش‌نویس' },
  { value: 'OPEN', label: 'فعال' },
  { value: 'CLOSED', label: 'بسته' },
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

export function followerRangeLabel(value: FollowerRange | null | undefined) {
  if (!value) return null
  return FOLLOWER_RANGES.find((r) => r.value === value)?.label ?? value
}

export function deliverableLabel(value: DeliverableType | null | undefined) {
  if (!value) return null
  return DELIVERABLE_TYPES.find((d) => d.value === value)?.label ?? value
}

export function campaignStatusLabel(value: CampaignStatus | null | undefined) {
  if (!value) return null
  return CAMPAIGN_STATUSES.find((s) => s.value === value)?.label ?? value
}

export function formatBudgetRange(
  min: number | null | undefined,
  max: number | null | undefined,
) {
  if (min == null && max == null) return null
  const fmt = (n: number) => n.toLocaleString('fa-IR')
  if (min != null && max != null) return `${fmt(min)} – ${fmt(max)} تومان`
  if (min != null) return `از ${fmt(min)} تومان`
  return `تا ${fmt(max!)} تومان`
}
