import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useId } from 'react'
import { createPortal } from 'react-dom'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { getApiErrorMessage } from '../api/client'
import { useUpdateOfferTerms } from '../hooks/useOffers'
import { parseNumber } from '../lib/digits'
import type { Offer } from '../types/api'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { JalaliDatePicker } from './ui/JalaliDatePicker'
import { Textarea } from './ui/Textarea'

const schema = z.object({
  fee: z
    .string()
    .trim()
    .min(1, 'مبلغ را وارد کنید')
    .refine(
      (v) => {
        const n = parseNumber(v)
        return !Number.isNaN(n) && n >= 0
      },
      { message: 'مبلغ معتبر وارد کنید' },
    ),
  message: z.string().trim().max(1000, 'پیام حداکثر ۱۰۰۰ کاراکتر باشد'),
  deadline: z.string().trim(),
})

type FormValues = z.infer<typeof schema>

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function isoToDateInput(iso: string | null) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function toDeadlineIso(value: string) {
  const raw = value.trim()
  if (!raw) return null
  const parsed = /^\d{4}-\d{2}-\d{2}$/.test(raw)
    ? new Date(`${raw}T12:00:00`)
    : new Date(raw)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed.toISOString()
}

interface EditOfferModalProps {
  offer: Offer
  open: boolean
  onClose: () => void
  onUpdated?: () => void
}

export function EditOfferModal({
  offer,
  open,
  onClose,
  onUpdated,
}: EditOfferModalProps) {
  const titleId = useId()
  const update = useUpdateOfferTerms(offer.id)
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fee: String(offer.fee),
      message: offer.message ?? '',
      deadline: isoToDateInput(offer.deadline),
    },
  })

  useEffect(() => {
    if (!open) return
    reset({
      fee: String(offer.fee),
      message: offer.message ?? '',
      deadline: isoToDateInput(offer.deadline),
    })
  }, [open, offer.fee, offer.message, offer.deadline, offer.id, reset])

  useEffect(() => {
    if (!open) return

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      e.stopImmediatePropagation()
      if (!update.isPending) onClose()
    }

    window.addEventListener('keydown', onKey, true)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey, true)
      document.body.style.overflow = prev
    }
  }, [open, update.isPending, onClose])

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
        disabled={update.isPending}
        className="absolute inset-0 bg-ink/50 backdrop-blur-[2px] disabled:cursor-not-allowed"
        onClick={() => {
          if (!update.isPending) onClose()
        }}
      />
      <div className="relative z-10 max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-t-3xl border border-border bg-surface-elevated p-5 shadow-2xl animate-fade-slide-in sm:rounded-3xl sm:p-6">
        <h2 id={titleId} className="text-lg font-extrabold text-navy">
          ویرایش پیشنهاد
        </h2>
        <p className="mt-1 text-sm leading-7 text-muted">
          تا قبل از پاسخ صاحب کسب و کار می‌توانید مبلغ، پیام و مهلت را تغییر دهید.
        </p>

        <form
          className="mt-5 space-y-4"
          onSubmit={handleSubmit((values) => {
            update.mutate(
              {
                fee: parseNumber(values.fee),
                message: values.message.trim() || null,
                deadline: toDeadlineIso(values.deadline),
              },
              {
                onSuccess: () => {
                  onUpdated?.()
                  onClose()
                },
              },
            )
          })}
        >
          <Input
            label="مبلغ پیشنهادی (تومان)"
            inputMode="numeric"
            dir="ltr"
            error={errors.fee?.message}
            {...register('fee')}
          />

          <Textarea
            label="پیام (اختیاری)"
            rows={4}
            error={errors.message?.message}
            {...register('message')}
          />

          <Controller
            name="deadline"
            control={control}
            render={({ field }) => (
              <JalaliDatePicker
                label="مهلت تحویل (اختیاری)"
                value={field.value}
                onChange={field.onChange}
                error={errors.deadline?.message}
                hint="تقویم شمسی — خالی بگذارید تا مهلت حذف شود"
                placeholder="انتخاب تاریخ شمسی"
              />
            )}
          />

          {update.isError ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {getApiErrorMessage(update.error, 'ویرایش پیشنهاد ناموفق بود')}
            </p>
          ) : null}

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="submit" loading={update.isPending}>
              ذخیره تغییرات
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={update.isPending}
              onClick={onClose}
            >
              انصراف
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  )
}
