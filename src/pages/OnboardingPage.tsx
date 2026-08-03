import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Navigate } from 'react-router-dom'
import { z } from 'zod'
import { getApiErrorMessage } from '../api/client'
import { AuthLayout } from '../components/AuthLayout'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { OptionGrid } from '../components/ui/OptionGrid'
import { Select } from '../components/ui/Select'
import { useMe, useUpdateProfile } from '../hooks/useAuth'
import { getAccessToken, isProfileComplete } from '../lib/auth-storage'
import {
  BRAND_CATEGORIES,
  BRAND_GOALS,
  BUSINESS_SIZES,
  IRAN_CITIES,
} from '../lib/brand-options'
import type {
  BrandCategory,
  BrandGoal,
  BusinessSize,
  UpdateProfileBody,
} from '../types/api'

const influencerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'نام حداقل ۲ کاراکتر باشد')
    .max(80, 'نام حداکثر ۸۰ کاراکتر باشد'),
})

const brandSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'نام برند حداقل ۲ کاراکتر باشد')
    .max(80, 'نام برند حداکثر ۸۰ کاراکتر باشد'),
  website: z
    .string()
    .trim()
    .max(200, 'آدرس حداکثر ۲۰۰ کاراکتر باشد')
    .optional()
    .or(z.literal('')),
  category: z.enum(
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
    { required_error: 'دسته را انتخاب کنید' },
  ),
  city: z
    .string()
    .trim()
    .min(2, 'شهر را انتخاب کنید')
    .max(80, 'شهر حداکثر ۸۰ کاراکتر باشد'),
  goal: z
    .enum(['AWARENESS', 'SALES', 'CONTENT', 'LAUNCH'])
    .optional()
    .or(z.literal('')),
  businessSize: z
    .enum(['SOLO', 'SME', 'AGENCY', 'ENTERPRISE'])
    .optional()
    .or(z.literal('')),
})

type InfluencerValues = z.infer<typeof influencerSchema>
type BrandValues = z.infer<typeof brandSchema>

const TOTAL_BRAND_STEPS = 3

function InfluencerOnboarding({
  defaultName,
}: {
  defaultName: string
}) {
  const update = useUpdateProfile()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InfluencerValues>({
    resolver: zodResolver(influencerSchema),
    values: { name: defaultName },
  })

  const onSubmit = handleSubmit((values) => {
    update.mutate({ name: values.name.trim() })
  })

  return (
    <AuthLayout
      title="تکمیل پروفایل"
      subtitle="نام نمایشی خود را وارد کنید تا وارد پنل شوید."
      step="مرحله ۱ از ۱"
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        <Input
          label="نام"
          autoComplete="name"
          placeholder="مثلاً سارا محمدی"
          error={errors.name?.message}
          {...register('name')}
        />

        <p className="text-xs leading-6 text-muted">
          حساب شما به‌عنوان اینفلوئنسر ثبت شده است. دسته‌بندی و شهر به‌زودی اضافه می‌شوند.
        </p>

        {update.isError ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600">
            {getApiErrorMessage(update.error, 'ذخیره پروفایل ناموفق بود')}
          </p>
        ) : null}

        <Button type="submit" loading={update.isPending}>
          ورود به داشبورد
        </Button>
      </form>
    </AuthLayout>
  )
}

function BrandOnboarding({
  defaults,
}: {
  defaults: Partial<BrandValues>
}) {
  const update = useUpdateProfile()
  const [step, setStep] = useState(0)

  const {
    register,
    control,
    handleSubmit,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<BrandValues>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      name: defaults.name ?? '',
      website: defaults.website ?? '',
      category: defaults.category,
      city: defaults.city ?? '',
      goal: defaults.goal ?? '',
      businessSize: defaults.businessSize ?? '',
    },
  })

  const stepFields: Array<(keyof BrandValues)[]> = [
    ['name', 'website'],
    ['category', 'city'],
    ['goal', 'businessSize'],
  ]

  const goNext = async () => {
    const ok = await trigger(stepFields[step])
    if (ok) setStep((s) => Math.min(s + 1, TOTAL_BRAND_STEPS - 1))
  }

  const goBack = () => setStep((s) => Math.max(s - 1, 0))

  const submitProfile = (values: BrandValues) => {
    const body: UpdateProfileBody = {
      name: values.name.trim(),
      category: values.category as BrandCategory,
      city: values.city.trim(),
    }
    if (values.website?.trim()) body.website = values.website.trim()
    if (values.goal) body.goal = values.goal as BrandGoal
    if (values.businessSize) body.businessSize = values.businessSize as BusinessSize
    update.mutate(body)
  }

  const onFinalSubmit = handleSubmit(submitProfile)

  const skipOptional = async () => {
    const ok = await trigger(['name', 'website', 'category', 'city'])
    if (!ok) {
      const values = getValues()
      if (!values.name?.trim() || (values.website && values.website.length > 200)) {
        setStep(0)
        return
      }
      setStep(1)
      return
    }
    const values = getValues()
    submitProfile({
      ...values,
      goal: '',
      businessSize: '',
    })
  }

  const titles = [
    { title: 'معرفی برند', subtitle: 'نام برند و آدرس اینستاگرام یا وب‌سایت را وارد کنید.' },
    { title: 'دسته و شهر', subtitle: 'برای پیشنهاد اینفلوئنسرهای مرتبط، دسته و شهر را مشخص کنید.' },
    { title: 'هدف کمپین', subtitle: 'اختیاری — می‌توانید بعداً هم تکمیل کنید.' },
  ]

  return (
    <AuthLayout
      title={titles[step].title}
      subtitle={titles[step].subtitle}
      step={`مرحله ${step + 1} از ${TOTAL_BRAND_STEPS}`}
    >
      <form onSubmit={onFinalSubmit} className="flex flex-col gap-5">
        {step === 0 ? (
          <>
            <Input
              label="نام برند"
              autoComplete="organization"
              placeholder="مثلاً کافه نوآ"
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
          </>
        ) : null}

        {step === 1 ? (
          <>
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <OptionGrid
                  label="دسته فعالیت"
                  options={BRAND_CATEGORIES}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.category?.message}
                />
              )}
            />
            <Select
              label="شهر"
              placeholder="شهر را انتخاب کنید"
              options={IRAN_CITIES.map((c) => ({ value: c, label: c }))}
              error={errors.city?.message}
              {...register('city')}
            />
          </>
        ) : null}

        {step === 2 ? (
          <>
            <Controller
              name="goal"
              control={control}
              render={({ field }) => (
                <OptionGrid
                  label="هدف اصلی"
                  options={BRAND_GOALS}
                  value={field.value || ''}
                  onChange={field.onChange}
                  error={errors.goal?.message}
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
                  value={field.value || ''}
                  onChange={field.onChange}
                  error={errors.businessSize?.message}
                />
              )}
            />
          </>
        ) : null}

        {update.isError ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600">
            {getApiErrorMessage(update.error, 'ذخیره پروفایل ناموفق بود')}
          </p>
        ) : null}

        <div className="flex flex-col gap-3">
          {step < TOTAL_BRAND_STEPS - 1 ? (
            <Button type="button" onClick={goNext}>
              ادامه
            </Button>
          ) : (
            <>
              <Button type="submit" loading={update.isPending}>
                ورود به داشبورد
              </Button>
              <button
                type="button"
                disabled={update.isPending}
                onClick={skipOptional}
                className="text-sm font-semibold text-muted transition hover:text-purple disabled:opacity-50"
              >
                فعلاً رد شو
              </button>
            </>
          )}

          {step > 0 ? (
            <button
              type="button"
              onClick={goBack}
              className="text-sm font-medium text-muted transition hover:text-navy"
            >
              بازگشت
            </button>
          ) : null}
        </div>
      </form>
    </AuthLayout>
  )
}

export function OnboardingPage() {
  const token = getAccessToken()
  const { data: user, isLoading, isError } = useMe(Boolean(token))

  if (!token) {
    return <Navigate to="/login" replace />
  }

  if (!isLoading && user && isProfileComplete(user)) {
    return <Navigate to="/app" replace />
  }

  if (isError) {
    return <Navigate to="/login" replace />
  }

  if (isLoading || !user) {
    return (
      <AuthLayout title="تکمیل پروفایل" subtitle="در حال بارگذاری…">
        <div className="flex justify-center py-10">
          <span className="size-8 animate-spin rounded-full border-2 border-purple border-t-transparent" />
        </div>
      </AuthLayout>
    )
  }

  if (user.role === 'BRAND') {
    return (
      <BrandOnboarding
        defaults={{
          name: user.name ?? '',
          website: user.website ?? '',
          category: user.category ?? undefined,
          city: user.city ?? '',
          goal: user.goal ?? '',
          businessSize: user.businessSize ?? '',
        }}
      />
    )
  }

  return <InfluencerOnboarding defaultName={user.name ?? ''} />
}
