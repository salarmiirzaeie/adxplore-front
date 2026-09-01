import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { getApiErrorMessage } from '../api/client'
import { AuthLayout } from '../components/AuthLayout'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useRequestOtp } from '../hooks/useAuth'
import { isValidIranMobile, normalizeIranPhone } from '../lib/phone'
import type { UserRole } from '../types/api'

const schema = z.object({
  role: z.enum(['INFLUENCER', 'BRAND'], {
    error: 'نوع حساب را انتخاب کنید',
  }),
  phone: z
    .string()
    .min(1, 'شماره موبایل را وارد کنید')
    .refine((v) => isValidIranMobile(v), 'شماره موبایل معتبر نیست'),
})

type FormValues = z.infer<typeof schema>

const roles: Array<{
  value: UserRole
  title: string
  description: string
}> = [
  {
    value: 'INFLUENCER',
    title: 'اینفلوئنسر',
    description: 'ورود برای همکاری در کمپین‌ها و دریافت پیشنهاد',
  },
  {
    value: 'BRAND',
    title: 'برند',
    description: 'ورود برای ساخت کمپین و پیدا کردن اینفلوئنسر',
  },
]

export function LoginPage() {
  const requestOtp = useRequestOtp()

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { phone: '', role: undefined },
  })

  const onSubmit = handleSubmit((values) => {
    requestOtp.mutate({
      phone: normalizeIranPhone(values.phone),
      role: values.role,
    })
  })

  return (
    <AuthLayout
      step="مرحله ۱ از ۲"
      title="ورود به ادکسپلور"
      subtitle="نوع حساب را انتخاب کنید و شماره موبایل خود را وارد کنید."
    >
      <form noValidate onSubmit={onSubmit} className="flex flex-col gap-5">
        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-navy">ورود به عنوان</span>
              <div className="grid gap-3 sm:grid-cols-2">
                {roles.map((role) => {
                  const selected = field.value === role.value
                  return (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() => field.onChange(role.value)}
                      aria-pressed={selected}
                      className={`rounded-2xl border px-4 py-4 text-right transition ${
                        selected
                          ? 'border-purple bg-purple-soft/50 shadow-[0_0_0_1px_var(--purple)]'
                          : 'border-border bg-white hover:border-purple/40 hover:bg-surface'
                      }`}
                    >
                      <span className="block text-sm font-extrabold text-navy">{role.title}</span>
                      <span className="mt-1.5 block text-xs leading-5 text-muted">
                        {role.description}
                      </span>
                    </button>
                  )
                })}
              </div>
              {errors.role ? (
                <span className="text-xs font-medium text-red-500">{errors.role.message}</span>
              ) : null}
            </div>
          )}
        />

        <Input
          label="شماره موبایل"
          inputMode="tel"
          autoComplete="tel"
          placeholder="0912XXXXXXX"
          dir="ltr"
          className="text-left tracking-wide"
          error={errors.phone?.message}
          hint="۰۹…، ۹… یا +۹۸۹…"
          {...register('phone')}
        />

        {requestOtp.isError ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600">
            {getApiErrorMessage(requestOtp.error, 'ارسال کد ناموفق بود')}
          </p>
        ) : null}

        <Button type="submit" loading={requestOtp.isPending}>
          ادامه
        </Button>
      </form>
    </AuthLayout>
  )
}
