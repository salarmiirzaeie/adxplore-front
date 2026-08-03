import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { getApiErrorMessage } from '../api/client'
import { AuthLayout } from '../components/AuthLayout'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useRequestOtp } from '../hooks/useAuth'
import { isValidIranMobile, normalizeIranPhone } from '../lib/phone'

const schema = z.object({
  phone: z
    .string()
    .min(1, 'شماره موبایل را وارد کنید')
    .refine((v) => isValidIranMobile(v), 'شماره موبایل معتبر نیست'),
})

type FormValues = z.infer<typeof schema>

export function LoginPage() {
  const requestOtp = useRequestOtp()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { phone: '' },
  })

  const onSubmit = handleSubmit((values) => {
    requestOtp.mutate(normalizeIranPhone(values.phone))
  })

  return (
    <AuthLayout
      step="مرحله ۱ از ۲"
      title="ورود به ادکسپلور"
      subtitle="شماره موبایل خود را وارد کنید؛ کد تأیید پیامک می‌شود."
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-5">
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
