import { zodResolver } from '@hookform/resolvers/zod'
import {
  useEffect,
  useRef,
  useState,
  type ClipboardEvent,
  type KeyboardEvent,
} from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Navigate, useLocation } from 'react-router-dom'
import { z } from 'zod'
import { getApiErrorMessage } from '../api/client'
import { AuthLayout } from '../components/AuthLayout'
import { Button } from '../components/ui/Button'
import { resolveLoginRole, useRequestOtp, useVerifyOtp } from '../hooks/useAuth'
import { getLoginPhone } from '../lib/auth-storage'
import { extractDigits } from '../lib/digits'
import { formatPhoneDisplay } from '../lib/phone'
import type { UserRole } from '../types/api'

const RESEND_SECONDS = 60
const DIGITS = 5

const schema = z.object({
  code: z
    .string()
    .min(1, 'کد تأیید را وارد کنید')
    .refine((v) => extractDigits(v).length === DIGITS, 'کد باید ۵ رقم باشد'),
})

type FormValues = z.infer<typeof schema>

const roleLabel: Record<UserRole, string> = {
  INFLUENCER: 'اینفلوئنسر',
  BRAND: 'برند',
}

export function OtpPage() {
  const location = useLocation()
  const state = location.state as { phone?: string; role?: UserRole } | null
  const phone = state?.phone || getLoginPhone()
  const role = resolveLoginRole(state?.role)

  const verify = useVerifyOtp()
  const resend = useRequestOtp()
  const [cooldown, setCooldown] = useState(RESEND_SECONDS)
  const inputsRef = useRef<Array<HTMLInputElement | null>>([])

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { code: '' },
  })

  const code = watch('code')

  useEffect(() => {
    if (cooldown <= 0) return
    const id = window.setInterval(() => {
      setCooldown((c) => (c <= 1 ? 0 : c - 1))
    }, 1000)
    return () => window.clearInterval(id)
  }, [cooldown])

  useEffect(() => {
    inputsRef.current[0]?.focus()
  }, [])

  if (!phone || !role) {
    return <Navigate to="/login" replace />
  }

  const digits = Array.from({ length: DIGITS }, (_, i) => code?.[i] ?? '')

  const writeDigits = (nextDigits: string[]) => {
    const next = extractDigits(nextDigits.join('')).slice(0, DIGITS)
    setValue('code', next, { shouldValidate: next.length === DIGITS })
  }

  const onDigitChange = (index: number, raw: string) => {
    const digit = extractDigits(raw).slice(-1)
    const nextDigits = [...digits]
    nextDigits[index] = digit || ''
    writeDigits(nextDigits)
    if (digit && index < DIGITS - 1) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  const onKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Backspace') return
    e.preventDefault()
    const nextDigits = [...digits]
    if (nextDigits[index]) {
      nextDigits[index] = ''
      writeDigits(nextDigits)
      return
    }
    if (index > 0) {
      nextDigits[index - 1] = ''
      writeDigits(nextDigits)
      inputsRef.current[index - 1]?.focus()
    }
  }

  const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = extractDigits(e.clipboardData.getData('text')).slice(0, DIGITS)
    if (!pasted) return
    setValue('code', pasted, { shouldValidate: pasted.length === DIGITS })
    const focusAt = Math.min(pasted.length, DIGITS - 1)
    inputsRef.current[focusAt]?.focus()
  }

  const onSubmit = handleSubmit((values) => {
    verify.mutate({ phone, code: extractDigits(values.code), role })
  })

  const handleResend = () => {
    if (cooldown > 0 || resend.isPending) return
    resend.mutate(
      { phone, role },
      {
        onSuccess: () => {
          setCooldown(RESEND_SECONDS)
          setValue('code', '')
          inputsRef.current[0]?.focus()
        },
      },
    )
  }

  return (
    <AuthLayout
      step="مرحله ۲ از ۲"
      title="کد تأیید"
      subtitle={
        <>
          کد ۵ رقمی به{' '}
          <span dir="ltr" className="inline-block tabular-nums">
            {formatPhoneDisplay(phone)}
          </span>{' '}
          ارسال شد · ورود به عنوان {roleLabel[role]}
        </>
      }
      backTo="/login"
      backLabel="تغییر شماره"
    >
      <form noValidate onSubmit={onSubmit} className="flex flex-col gap-5">
        <Controller
          name="code"
          control={control}
          render={() => (
            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-navy">کد پیامک‌شده</span>
              <div className="flex justify-between gap-2" dir="ltr" onPaste={onPaste}>
                {Array.from({ length: DIGITS }).map((_, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      inputsRef.current[i] = el
                    }}
                    type="text"
                    inputMode="numeric"
                    autoComplete={i === 0 ? 'one-time-code' : 'off'}
                    maxLength={1}
                    value={digits[i]}
                    onChange={(e) => onDigitChange(i, e.target.value)}
                    onKeyDown={(e) => onKeyDown(i, e)}
                    aria-label={`رقم ${i + 1}`}
                    className="input-brand h-14 w-12 text-center text-xl font-bold tabular-nums sm:h-14 sm:w-14"
                  />
                ))}
              </div>
              {errors.code ? (
                <span className="text-xs font-medium text-red-500">{errors.code.message}</span>
              ) : null}
            </div>
          )}
        />

        {verify.isError ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600">
            {getApiErrorMessage(verify.error, 'کد نامعتبر یا منقضی است')}
          </p>
        ) : null}

        {resend.isError ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600">
            {getApiErrorMessage(resend.error, 'ارسال مجدد ناموفق بود')}
          </p>
        ) : null}

        <Button type="submit" loading={verify.isPending}>
          ورود به پنل
        </Button>

        <div className="text-center text-sm text-muted">
          {cooldown > 0 ? (
            <span>
              ارسال مجدد تا{' '}
              <span className="font-semibold tabular-nums text-navy">{cooldown}</span> ثانیه
            </span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={resend.isPending}
              className="font-semibold text-purple transition hover:text-purple-deep disabled:opacity-50"
            >
              {resend.isPending ? 'در حال ارسال…' : 'ارسال مجدد کد'}
            </button>
          )}
        </div>
      </form>
    </AuthLayout>
  )
}
