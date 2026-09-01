import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { getApiErrorMessage } from '../api/client'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { OptionGrid } from './ui/OptionGrid'
import { IranCitySelect } from './IranCitySelect'
import {
  BRAND_CATEGORIES,
  BRAND_GOALS,
  BUSINESS_SIZES,
  normalizeCategories,
} from '../lib/brand-options'
import { refineIranLocation } from '../lib/iran-locations'
import type {
  BrandCategory,
  BrandGoal,
  BusinessSize,
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

export const brandProfileSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'نام برند حداقل ۲ کاراکتر باشد')
      .max(80, 'نام برند حداکثر ۸۰ کاراکتر باشد'),
    website: z.string().trim().max(200, 'آدرس حداکثر ۲۰۰ کاراکتر باشد'),
    categories: z
      .array(categoryEnum, { error: 'حداقل یک دسته انتخاب کنید' })
      .min(1, 'حداقل یک دسته انتخاب کنید'),
    province: z.string(),
    city: z
      .string()
      .trim()
      .min(2, 'شهر را انتخاب کنید')
      .max(80, 'شهر حداکثر ۸۰ کاراکتر باشد'),
    goal: z.union([
      z.enum(['AWARENESS', 'SALES', 'CONTENT', 'LAUNCH'], {
        error: 'هدف را انتخاب کنید',
      }),
      z.literal(''),
    ]),
    businessSize: z.union([
      z.enum(['SOLO', 'SME', 'AGENCY', 'ENTERPRISE'], {
        error: 'اندازه کسب‌وکار را انتخاب کنید',
      }),
      z.literal(''),
    ]),
  })
  .superRefine((values, ctx) => refineIranLocation(values, ctx))

export type BrandProfileFormValues = z.infer<typeof brandProfileSchema>

export function toBrandProfileFormValues(
  user: Pick<
    UserProfile,
    | 'name'
    | 'website'
    | 'category'
    | 'categories'
    | 'city'
    | 'province'
    | 'goal'
    | 'businessSize'
  >,
): BrandProfileFormValues {
  return {
    name: user.name ?? '',
    website: user.website ?? '',
    categories: normalizeCategories(user.categories, user.category),
    province: user.province ?? '',
    city: user.city ?? '',
    goal: user.goal ?? '',
    businessSize: user.businessSize ?? '',
  }
}

export function brandFormToUpdateBody(
  values: BrandProfileFormValues,
): UpdateProfileBody {
  return {
    name: values.name.trim(),
    categories: values.categories,
    category: values.categories[0] as BrandCategory,
    city: values.city.trim(),
    province: values.province.trim(),
    website: values.website.trim() ? values.website.trim() : null,
    goal: values.goal ? (values.goal as BrandGoal) : null,
    businessSize: values.businessSize
      ? (values.businessSize as BusinessSize)
      : null,
  }
}

interface BrandProfileFormProps {
  defaults: BrandProfileFormValues
  submitLabel?: string
  cancelLabel?: string
  onCancel?: () => void
  onSubmit: (body: UpdateProfileBody) => void
  loading?: boolean
  error?: unknown
}

export function BrandProfileForm({
  defaults,
  submitLabel = 'ذخیره تغییرات',
  cancelLabel = 'انصراف',
  onCancel,
  onSubmit,
  loading,
  error,
}: BrandProfileFormProps) {
  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<BrandProfileFormValues>({
    resolver: zodResolver(brandProfileSchema),
    defaultValues: defaults,
  })

  return (
    <form
      noValidate
      className="flex flex-col gap-8"
      onSubmit={handleSubmit((values) => onSubmit(brandFormToUpdateBody(values)))}
    >
      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-extrabold text-navy">اطلاعات برند</h2>
        <Input
          label="نام برند"
          error={errors.name?.message}
          {...register('name')}
        />
        <Input
          label="اینستاگرام یا وب‌سایت"
          placeholder="instagram.com/brand یا @brand"
          dir="ltr"
          className="text-left"
          hint="اختیاری"
          error={errors.website?.message}
          {...register('website')}
        />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-extrabold text-navy">دسته و موقعیت</h2>
        <Controller
          name="categories"
          control={control}
          render={({ field }) => (
            <OptionGrid
              label="دسته فعالیت"
              options={BRAND_CATEGORIES}
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
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-extrabold text-navy">جزئیات کمپین</h2>
        <Controller
          name="goal"
          control={control}
          render={({ field }) => (
            <OptionGrid
              label="هدف اصلی"
              options={BRAND_GOALS}
              value={field.value}
              onChange={field.onChange}
              error={errors.goal?.message}
              optional
            />
          )}
        />
        <Controller
          name="businessSize"
          control={control}
          render={({ field }) => (
            <OptionGrid
              label="اندازه کسب‌وکار"
              options={BUSINESS_SIZES}
              value={field.value}
              onChange={field.onChange}
              error={errors.businessSize?.message}
              optional
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
