import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { Link, Navigate } from 'react-router-dom'
import { z } from 'zod'
import { getApiErrorMessage } from '../api/client'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { OptionGrid } from '../components/ui/OptionGrid'
import { Select } from '../components/ui/Select'
import { Textarea } from '../components/ui/Textarea'
import { useMe } from '../hooks/useAuth'
import { useCreateCampaign } from '../hooks/useCampaigns'
import {
  BRAND_CATEGORIES,
  DELIVERABLE_TYPES,
  IRAN_CITIES,
} from '../lib/brand-options'
import type {
  BrandCategory,
  CreateCampaignBody,
  DeliverableType,
  UserProfile,
} from '../types/api'

const schema = z
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
      { error: 'دسته را انتخاب کنید' },
    ),
    city: z.string().trim().min(2, 'شهر را انتخاب کنید').max(80),
    deliverable: z.enum(['STORY', 'POST', 'REEL'], {
      error: 'نوع محتوا را انتخاب کنید',
    }),
    budgetMin: z.string().trim(),
    budgetMax: z.string().trim(),
    publish: z.boolean(),
  })
  .superRefine((values, ctx) => {
    const min = values.budgetMin ? Number(values.budgetMin) : null
    const max = values.budgetMax ? Number(values.budgetMax) : null
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
  })

type FormValues = z.infer<typeof schema>

function CreateCampaignForm({ user }: { user: UserProfile }) {
  const create = useCreateCampaign()

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      brief: '',
      category: (user.category ?? undefined) as BrandCategory | undefined,
      city: user.city ?? '',
      deliverable: undefined,
      budgetMin: '',
      budgetMax: '',
      publish: false,
    },
  })

  const onSubmit = handleSubmit((values) => {
    const body: CreateCampaignBody = {
      title: values.title.trim(),
      brief: values.brief.trim(),
      category: values.category,
      city: values.city.trim(),
      deliverable: values.deliverable as DeliverableType,
      status: values.publish ? 'OPEN' : 'DRAFT',
    }
    if (values.budgetMin) body.budgetMin = Number(values.budgetMin)
    if (values.budgetMax) body.budgetMax = Number(values.budgetMax)
    create.mutate(body)
  })

  return (
    <div className="mx-auto max-w-2xl animate-fade-slide-in">
      <section className="mb-6 sm:mb-8">
        <Link
          to="/app/campaigns"
          className="mb-3 inline-block text-sm font-medium text-muted transition hover:text-purple"
        >
          ← بازگشت به کمپین‌ها
        </Link>
        <h1 className="text-2xl font-extrabold text-navy sm:text-3xl">ساخت کمپین</h1>
        <p className="mt-2 text-sm text-muted">
          جزئیات کمپین را وارد کنید. می‌توانید به‌صورت پیش‌نویس ذخیره یا فوراً فعال کنید.
        </p>
      </section>

      <section className="card-elevated rounded-2xl px-5 py-6 sm:px-7 sm:py-8">
        <form onSubmit={onSubmit} className="flex flex-col gap-5">
          <Input
            label="عنوان کمپین"
            placeholder="مثلاً لانچ محصول تابستانی"
            error={errors.title?.message}
            {...register('title')}
          />

          <Textarea
            label="بریف / توضیح"
            placeholder="هدف کمپین، پیام کلیدی و انتظارات از اینفلوئنسر را بنویسید."
            error={errors.brief?.message}
            {...register('brief')}
          />

          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <OptionGrid
                label="دسته"
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
            options={[
              ...IRAN_CITIES.map((c) => ({ value: c, label: c })),
              ...(user.city &&
              !IRAN_CITIES.includes(user.city as (typeof IRAN_CITIES)[number])
                ? [{ value: user.city, label: user.city }]
                : []),
            ]}
            error={errors.city?.message}
            {...register('city')}
          />

          <Controller
            name="deliverable"
            control={control}
            render={({ field }) => (
              <OptionGrid
                label="نوع محتوا"
                options={DELIVERABLE_TYPES}
                value={field.value}
                onChange={field.onChange}
                error={errors.deliverable?.message}
              />
            )}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="حداقل بودجه (تومان)"
              inputMode="numeric"
              dir="ltr"
              className="text-left"
              placeholder="اختیاری"
              hint="اختیاری"
              error={errors.budgetMin?.message}
              {...register('budgetMin')}
            />
            <Input
              label="حداکثر بودجه (تومان)"
              inputMode="numeric"
              dir="ltr"
              className="text-left"
              placeholder="اختیاری"
              hint="اختیاری"
              error={errors.budgetMax?.message}
              {...register('budgetMax')}
            />
          </div>

          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3">
            <input
              type="checkbox"
              className="size-4 accent-[var(--purple)]"
              {...register('publish')}
            />
            <span className="text-sm font-semibold text-navy">
              پس از ساخت، کمپین را فعال کن (OPEN)
            </span>
          </label>

          {create.isError ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600">
              {getApiErrorMessage(create.error, 'ساخت کمپین ناموفق بود')}
            </p>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row-reverse">
            <Button type="submit" loading={create.isPending}>
              ذخیره کمپین
            </Button>
            <Link
              to="/app/campaigns"
              className="inline-flex w-full items-center justify-center rounded-xl border border-border px-4 py-3.5 text-sm font-bold text-navy transition hover:bg-surface"
            >
              انصراف
            </Link>
          </div>
        </form>
      </section>
    </div>
  )
}

export function CreateCampaignPage() {
  const { data: user } = useMe()

  if (!user) return null
  if (user.role !== 'BRAND') {
    return <Navigate to="/app/campaigns" replace />
  }

  return <CreateCampaignForm user={user} />
}
