import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useId, useState } from 'react'
import { createPortal } from 'react-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { getApiErrorMessage } from '../api/client'
import { useCreateSupportTicket } from '../hooks/useSupport'
import { useMe } from '../hooks/useAuth'
import { isValidIranMobile, normalizeIranPhone } from '../lib/phone'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Textarea } from './ui/Textarea'

const schema = z.object({
  phone: z
    .string()
    .min(1, 'شماره موبایل را وارد کنید')
    .refine((v) => isValidIranMobile(v), 'شماره موبایل معتبر نیست'),
  subject: z
    .string()
    .trim()
    .min(3, 'موضوع را وارد کنید')
    .max(120, 'موضوع حداکثر ۱۲۰ کاراکتر باشد'),
  message: z
    .string()
    .trim()
    .min(10, 'پیام حداقل ۱۰ کاراکتر باشد')
    .max(2000, 'پیام حداکثر ۲۰۰۰ کاراکتر باشد'),
})

type FormValues = z.infer<typeof schema>

const headsetIcon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M5 12a7 7 0 0 1 14 0"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
    />
    <path
      d="M5 12v4.5A2.5 2.5 0 0 0 7.5 19H9v-7H5zM19 12v4.5A2.5 2.5 0 0 1 16.5 19H15v-7h4z"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinejoin="round"
    />
    <path
      d="M12 19v1.5a2 2 0 0 0 2 2h1"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
    />
  </svg>
)

function SupportModal({
  open,
  onClose,
  defaultPhone,
}: {
  open: boolean
  onClose: () => void
  defaultPhone: string
}) {
  const titleId = useId()
  const create = useCreateSupportTicket()
  const resetMutation = create.reset
  const [sent, setSent] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { phone: defaultPhone, subject: '', message: '' },
  })

  useEffect(() => {
    if (!open) return
    setSent(false)
    resetMutation()
    reset({ phone: defaultPhone, subject: '', message: '' })
  }, [open, defaultPhone, reset, resetMutation])

  useEffect(() => {
    if (!open) return

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      e.stopImmediatePropagation()
      if (!create.isPending) onClose()
    }

    window.addEventListener('keydown', onKey, true)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey, true)
      document.body.style.overflow = prev
    }
  }, [open, create.isPending, onClose])

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-200 flex items-end justify-center p-0 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <button
        type="button"
        aria-label="بستن"
        disabled={create.isPending}
        className="absolute inset-0 bg-ink/50 backdrop-blur-[2px] disabled:cursor-not-allowed"
        onClick={() => {
          if (!create.isPending) onClose()
        }}
      />
      <div className="relative z-10 max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-t-3xl border border-border bg-surface-elevated p-5 shadow-2xl animate-fade-slide-in sm:rounded-3xl sm:p-6">
        <h2 id={titleId} className="text-lg font-extrabold text-navy">
          پشتیبانی
        </h2>
        <p className="mt-1 text-sm leading-7 text-muted">
          پیام شما برای تیم ادکسپلور ارسال می‌شود و در اسرع وقت بررسی می‌گردد.
        </p>

        {sent ? (
          <div className="mt-5">
            <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm leading-7 text-emerald-700">
              پیام شما ثبت شد. به‌زودی با شما تماس می‌گیریم.
            </p>
            <Button type="button" className="mt-4" onClick={onClose}>
              بستن
            </Button>
          </div>
        ) : (
          <form
            className="mt-5 space-y-4"
            noValidate
            onSubmit={handleSubmit((values) => {
              create.mutate(
                {
                  phone: normalizeIranPhone(values.phone),
                  subject: values.subject.trim(),
                  message: values.message.trim(),
                },
                { onSuccess: () => setSent(true) },
              )
            })}
          >
            <Input
              label="شماره موبایل"
              type="tel"
              inputMode="tel"
              dir="ltr"
              autoComplete="tel"
              error={errors.phone?.message}
              {...register('phone')}
            />
            <Input
              label="موضوع"
              maxLength={120}
              error={errors.subject?.message}
              {...register('subject')}
            />
            <Textarea
              label="پیام"
              rows={5}
              maxLength={2000}
              error={errors.message?.message}
              {...register('message')}
            />

            {create.isError ? (
              <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                {getApiErrorMessage(create.error, 'ارسال پیام ناموفق بود')}
              </p>
            ) : null}

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button type="submit" loading={create.isPending}>
                ارسال
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={create.isPending}
                onClick={onClose}
              >
                انصراف
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body,
  )
}

export function SupportFab({ hidden }: { hidden?: boolean }) {
  const { data: user } = useMe()
  const [open, setOpen] = useState(false)

  if (hidden) return null

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed z-40 inline-flex items-center gap-2 rounded-full bg-purple px-4 py-3 text-sm font-bold text-white shadow-lg shadow-purple/30 transition hover:opacity-95 active:scale-[0.98] inset-e-4 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] lg:inset-e-6 lg:bottom-6"
        aria-label="پشتیبانی"
      >
        {headsetIcon}
        <span>پشتیبانی</span>
      </button>
      <SupportModal
        open={open}
        onClose={() => setOpen(false)}
        defaultPhone={user?.phone ?? ''}
      />
    </>
  )
}
