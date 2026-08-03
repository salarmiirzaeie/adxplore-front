import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { getApiErrorMessage } from '../api/client'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { OptionGrid } from './ui/OptionGrid'
import { Select } from './ui/Select'
import {
  FOLLOWER_RANGES,
  INFLUENCER_CATEGORIES,
  IRAN_CITIES,
} from '../lib/brand-options'
import type {
  BrandCategory,
  FollowerRange,
  UpdateProfileBody,
  UserProfile,
} from '../types/api'

const categoryEnum = z.enum(
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
  { error: 'دسته‌بندی را انتخاب کنید' },
)

const followerEnum = z.enum(
  [
    'UNDER_1K',
    'FROM_1K_5K',
    'FROM_5K_10K',
    'FROM_10K_50K',
    'FROM_50K_100K',
    'FROM_100K_500K',
    'OVER_500K',
  ],
  { error: 'بازه فالوور را انتخاب کنید' },
)

export const influencerProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'نام حداقل ۲ کاراکتر باشد')
    .max(80, 'نام حداکثر ۸۰ کاراکتر باشد'),
  website: z
    .string()
    .trim()
    .min(2, 'آیدی اینستاگرام را وارد کنید')
    .max(200, 'آدرس حداکثر ۲۰۰ کاراکتر باشد'),
  category: categoryEnum,
  city: z
    .string()
    .trim()
    .min(2, 'شهر را انتخاب کنید')
    .max(80, 'شهر حداکثر ۸۰ کاراکتر باشد'),
  followerRange: followerEnum,
})

export type InfluencerProfileFormValues = z.infer<typeof influencerProfileSchema>

export function toInfluencerProfileFormValues(
  user: Pick<
    UserProfile,
    'name' | 'website' | 'category' | 'city' | 'followerRange'
  >,
): InfluencerProfileFormValues {
  return {
    name: user.name ?? '',
    website: user.website ?? '',
    category: (user.category ?? undefined) as BrandCategory,
    city: user.city ?? '',
    followerRange: (user.followerRange ?? undefined) as FollowerRange,
  }
}

export function influencerFormToUpdateBody(
  values: InfluencerProfileFormValues,
): UpdateProfileBody {
  return {
    name: values.name.trim(),
    website: values.website.trim(),
    category: values.category,
    city: values.city.trim(),
    followerRange: values.followerRange,
  }
}

interface InfluencerProfileFormProps {
  defaults: InfluencerProfileFormValues
  submitLabel?: string
  cancelLabel?: string
  onCancel?: () => void
  onSubmit: (body: UpdateProfileBody) => void
  loading?: boolean
  error?: unknown
}

export function InfluencerProfileForm({
  defaults,
  submitLabel = 'ذخیره تغییرات',
  cancelLabel = 'انصراف',
  onCancel,
  onSubmit,
  loading,
  error,
}: InfluencerProfileFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<InfluencerProfileFormValues>({
    resolver: zodResolver(influencerProfileSchema),
    values: defaults,
  })

  const submit = handleSubmit((values) => {
    onSubmit(influencerFormToUpdateBody(values))
  })

  return (
    <form onSubmit={submit} className="flex flex-col gap-6">
      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-extrabold text-navy">اطلاعات شخصی</h2>
        <Input
          label="نام نمایشی"
          autoComplete="name"
          placeholder="مثلاً سارا محمدی"
          error={errors.name?.message}
          {...register('name')}
        />
        <Input
          label="اینستاگرام"
          placeholder="@username یا instagram.com/username"
          dir="ltr"
          className="text-left"
          error={errors.website?.message}
          {...register('website')}
        />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-extrabold text-navy">نیچ و موقعیت</h2>
        <Controller
          name="category"
          control={control}
          render={({ field }) => (
            <OptionGrid
              label="دسته‌بندی محتوا"
              options={INFLUENCER_CATEGORIES}
              value={field.value}
              onChange={field.onChange}
              error={errors.category?.message}
            />
          )}
        />
        <Select
          label="شهر"
          placeholder="شهر را انتخاب کنید"
          options={[
            ...IRAN_CITIES.map((c) => ({ value: c, label: c })),
            ...(defaults.city &&
            !IRAN_CITIES.includes(defaults.city as (typeof IRAN_CITIES)[number])
              ? [{ value: defaults.city, label: defaults.city }]
              : []),
          ]}
          error={errors.city?.message}
          {...register('city')}
        />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-extrabold text-navy">اندازه مخاطب</h2>
        <Controller
          name="followerRange"
          control={control}
          render={({ field }) => (
            <OptionGrid
              label="بازه فالوور"
              options={FOLLOWER_RANGES}
              value={field.value}
              onChange={field.onChange}
              error={errors.followerRange?.message}
            />
          )}
        />
      </section>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600">
          {getApiErrorMessage(error, 'ذخیره پروفایل ناموفق بود')}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row-reverse">
        <Button type="submit" loading={loading} disabled={!isDirty && !loading}>
          {submitLabel}
        </Button>
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
        ) : null}
      </div>
    </form>
  )
}
