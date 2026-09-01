import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { getApiErrorMessage } from '../api/client'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { OptionGrid } from './ui/OptionGrid'
import { IranCitySelect } from './IranCitySelect'
import {
  FOLLOWER_RANGES,
  INFLUENCER_CATEGORIES,
  normalizeCategories,
} from '../lib/brand-options'
import { refineIranLocation } from '../lib/iran-locations'
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
  { error: 'دسته را انتخاب کنید' },
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

export const influencerProfileSchema = z
  .object({
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
    categories: z
      .array(categoryEnum, { error: 'حداقل یک دسته انتخاب کنید' })
      .min(1, 'حداقل یک دسته انتخاب کنید'),
    province: z.string(),
    city: z
      .string()
      .trim()
      .min(2, 'شهر را انتخاب کنید')
      .max(80, 'شهر حداکثر ۸۰ کاراکتر باشد'),
    followerRange: followerEnum,
  })
  .superRefine((values, ctx) => refineIranLocation(values, ctx))

export type InfluencerProfileFormValues = z.infer<typeof influencerProfileSchema>

export function toInfluencerProfileFormValues(
  user: Pick<
    UserProfile,
    'name' | 'website' | 'category' | 'categories' | 'city' | 'province' | 'followerRange'
  >,
): InfluencerProfileFormValues {
  return {
    name: user.name ?? '',
    website: user.website ?? '',
    categories: normalizeCategories(user.categories, user.category),
    province: user.province ?? '',
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
    categories: values.categories,
    category: values.categories[0] as BrandCategory,
    city: values.city.trim(),
    province: values.province.trim(),
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
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<InfluencerProfileFormValues>({
    resolver: zodResolver(influencerProfileSchema),
    defaultValues: defaults,
  })

  return (
    <form
      noValidate
      className="flex flex-col gap-8"
      onSubmit={handleSubmit((values) =>
        onSubmit(influencerFormToUpdateBody(values)),
      )}
    >
      <section className="flex flex-col gap-4">
        <Input
          label="نام نمایشی"
          error={errors.name?.message}
          {...register('name')}
        />
        <Input
          label="آیدی اینستاگرام"
          placeholder="@username"
          dir="ltr"
          className="text-left"
          error={errors.website?.message}
          {...register('website')}
        />
      </section>

      <section className="flex flex-col gap-4">
        <Controller
          name="categories"
          control={control}
          render={({ field }) => (
            <OptionGrid
              label="دسته‌بندی محتوا"
              options={INFLUENCER_CATEGORIES}
              value={field.value}
              onChange={(v) => field.onChange(Array.isArray(v) ? v : v ? [v] : [])}
              error={errors.categories?.message}
              multiple
            />
          )}
        />
        <IranCitySelect
          province={watch('province')}
          city={watch('city')}
          provinceError={errors.province?.message}
          cityError={errors.city?.message}
          onChange={({ province, city }) => {
            setValue('province', province, { shouldDirty: true, shouldValidate: true })
            setValue('city', city, { shouldDirty: true, shouldValidate: true })
          }}
        />
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
