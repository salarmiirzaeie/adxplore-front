import { z } from 'zod'
import { parseNumber } from './digits'
import { NATIONWIDE_CITY, refineIranLocation } from './iran-locations'
import { normalizeCategories, normalizeDeliverables } from './brand-options'
import type {
  BrandCategory,
  Campaign,
  CreateCampaignBody,
  DeliverableType,
  UpdateCampaignBody,
} from '../types/api'

export const campaignFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, 'عنوان حداقل ۳ کاراکتر باشد')
      .max(120, 'عنوان حداکثر ۱۲۰ کاراکتر باشد'),
    brief: z
      .string()
      .trim()
      .min(10, 'توضیح حداقل ۱۰ کاراکتر باشد')
      .max(2000, 'توضیح حداکثر ۲۰۰۰ کاراکتر باشد'),
    categories: z
      .array(
        z.enum(
          [
            'BEAUTY',
            'FASHION',
            'FOOD',
            'HEALTH',
            'TECH',
            'EDUCATION',
            'TRAVEL',
            'SPORTS',
            'HOME',
            'FINANCE',
            'ENTERTAINMENT',
            'OTHER',
          ],
          { error: 'دسته را انتخاب کنید' },
        ),
        { error: 'حداقل یک دسته انتخاب کنید' },
      )
      .min(1, 'حداقل یک دسته انتخاب کنید'),
    city: z
      .string()
      .trim()
      .min(2, 'شهر را انتخاب کنید')
      .max(80, 'شهر حداکثر ۸۰ کاراکتر باشد'),
    province: z.string(),
    deliverables: z
      .array(z.enum(['STORY', 'POST', 'REEL'], { error: 'نوع محتوا را انتخاب کنید' }), {
        error: 'حداقل یک نوع محتوا انتخاب کنید',
      })
      .min(1, 'حداقل یک نوع محتوا انتخاب کنید'),
    budgetMin: z.string().trim(),
    budgetMax: z.string().trim(),
    publish: z.boolean(),
  })
  .superRefine((values, ctx) => {
    const min = values.budgetMin ? parseNumber(values.budgetMin) : null
    const max = values.budgetMax ? parseNumber(values.budgetMax) : null
    if (values.budgetMin && Number.isNaN(min)) {
      ctx.addIssue({
        code: 'custom',
        path: ['budgetMin'],
        message: 'عدد معتبر وارد کنید',
      })
    }
    if (values.budgetMax && Number.isNaN(max)) {
      ctx.addIssue({
        code: 'custom',
        path: ['budgetMax'],
        message: 'عدد معتبر وارد کنید',
      })
    }
    if (
      min != null &&
      max != null &&
      !Number.isNaN(min) &&
      !Number.isNaN(max) &&
      min > max
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['budgetMax'],
        message: 'حداکثر باید بزرگ‌تر یا مساوی حداقل باشد',
      })
    }
    refineIranLocation(values, ctx, { allowNationwide: true })
  })

export type CampaignFormValues = z.infer<typeof campaignFormSchema>

function locationFromForm(values: CampaignFormValues) {
  const city = values.city.trim()
  return {
    city,
    province: city === NATIONWIDE_CITY ? null : values.province.trim() || null,
  }
}

function budgetFromForm(values: CampaignFormValues) {
  return {
    budgetMin: values.budgetMin ? parseNumber(values.budgetMin) : null,
    budgetMax: values.budgetMax ? parseNumber(values.budgetMax) : null,
  }
}

export function campaignToFormValues(campaign: Campaign): CampaignFormValues {
  return {
    title: campaign.title,
    brief: campaign.brief,
    categories: normalizeCategories(campaign.categories, campaign.category),
    city: campaign.city,
    province: campaign.province ?? '',
    deliverables: normalizeDeliverables(campaign.deliverables, campaign.deliverable),
    budgetMin: campaign.budgetMin != null ? String(campaign.budgetMin) : '',
    budgetMax: campaign.budgetMax != null ? String(campaign.budgetMax) : '',
    publish: campaign.status === 'OPEN',
  }
}

export function toCreateCampaignBody(values: CampaignFormValues): CreateCampaignBody {
  const location = locationFromForm(values)
  const budget = budgetFromForm(values)
  const body: CreateCampaignBody = {
    title: values.title.trim(),
    brief: values.brief.trim(),
    categories: values.categories,
    category: values.categories[0] as BrandCategory,
    city: location.city,
    province: location.province,
    deliverables: values.deliverables as DeliverableType[],
    deliverable: values.deliverables[0] as DeliverableType,
    status: values.publish ? 'OPEN' : 'DRAFT',
  }
  if (budget.budgetMin != null) body.budgetMin = budget.budgetMin
  if (budget.budgetMax != null) body.budgetMax = budget.budgetMax
  return body
}

export function toUpdateCampaignBody(values: CampaignFormValues): UpdateCampaignBody {
  const location = locationFromForm(values)
  const budget = budgetFromForm(values)
  return {
    title: values.title.trim(),
    brief: values.brief.trim(),
    categories: values.categories,
    category: values.categories[0] as BrandCategory,
    city: location.city,
    province: location.province,
    deliverables: values.deliverables as DeliverableType[],
    deliverable: values.deliverables[0] as DeliverableType,
    budgetMin: budget.budgetMin,
    budgetMax: budget.budgetMax,
  }
}
