import type {
  BrandCategory,
  BrandGoal,
  BusinessSize,
  CampaignStatus,
  DealStatus,
  DeliverableType,
  FollowerRange,
  InvitationStatus,
  OfferStatus,
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

export const OFFER_STATUSES: Array<{
  value: OfferStatus
  label: string
}> = [
  { value: 'PENDING', label: 'در انتظار' },
  { value: 'ACCEPTED', label: 'در حال انجام' },
  { value: 'REJECTED', label: 'ردشده' },
  { value: 'CANCELLED', label: 'لغوشده' },
]

export const INVITATION_STATUSES: Array<{
  value: InvitationStatus
  label: string
}> = [
  { value: 'PENDING', label: 'فعال' },
  { value: 'CANCELLED', label: 'لغوشده' },
]

export const DEAL_STATUSES: Array<{
  value: DealStatus
  label: string
}> = [
  { value: 'PENDING_PAYMENT', label: 'در انتظار پرداخت' },
  { value: 'IN_PROGRESS', label: 'در حال انجام' },
  { value: 'DELIVERED', label: 'تحویل‌شده' },
  { value: 'REVISION_REQUESTED', label: 'نیاز به اصلاح' },
  { value: 'COMPLETED', label: 'تکمیل‌شده' },
  { value: 'CANCELLED', label: 'لغوشده' },
]

export { NATIONWIDE_CITY } from './iran-locations'

export function brandCategoryLabel(value: BrandCategory | null | undefined) {
  if (!value) return null
  return BRAND_CATEGORIES.find((s) => s.value === value)?.label ?? value
}

export function brandCategoriesLabel(
  values: BrandCategory[] | null | undefined,
  fallback?: BrandCategory | null,
) {
  const list =
    values && values.length > 0 ? values : fallback ? [fallback] : []
  if (!list.length) return null
  return list.map((v) => brandCategoryLabel(v) ?? v).join(' · ')
}

export function normalizeCategories(
  values: BrandCategory[] | null | undefined,
  fallback?: BrandCategory | null,
): BrandCategory[] {
  if (values && values.length > 0) return [...new Set(values)]
  if (fallback) return [fallback]
  return []
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

export function deliverablesLabel(
  values: DeliverableType[] | null | undefined,
  fallback?: DeliverableType | null,
) {
  const list =
    values && values.length > 0 ? values : fallback ? [fallback] : []
  if (!list.length) return null
  return list.map((v) => deliverableLabel(v) ?? v).join(' · ')
}

export function normalizeDeliverables(
  values: DeliverableType[] | null | undefined,
  fallback?: DeliverableType | null,
): DeliverableType[] {
  if (values && values.length > 0) return [...new Set(values)]
  if (fallback) return [fallback]
  return []
}

export function campaignStatusLabel(value: CampaignStatus | null | undefined) {
  if (!value) return null
  return CAMPAIGN_STATUSES.find((s) => s.value === value)?.label ?? value
}

export function offerStatusLabel(value: OfferStatus | null | undefined) {
  if (!value) return null
  return OFFER_STATUSES.find((s) => s.value === value)?.label ?? value
}

/** For accepted offers, prefer live deal progress when available. */
export function offerPipelineLabel(
  offerStatus: OfferStatus | null | undefined,
  dealStatus?: DealStatus | null,
) {
  if (!offerStatus) return null
  if (offerStatus === 'ACCEPTED' && dealStatus) {
    return dealStatusLabel(dealStatus)
  }
  return offerStatusLabel(offerStatus)
}

export function invitationStatusLabel(value: InvitationStatus | null | undefined) {
  if (!value) return null
  return INVITATION_STATUSES.find((s) => s.value === value)?.label ?? value
}

export function dealStatusLabel(value: DealStatus | null | undefined) {
  if (!value) return null
  return DEAL_STATUSES.find((s) => s.value === value)?.label ?? value
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
