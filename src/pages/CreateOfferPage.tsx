import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { useState } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { z } from 'zod'
import { getApiErrorMessage } from '../api/client'
import { Button } from '../components/ui/Button'
import { ConfirmModal } from '../components/ui/ConfirmModal'
import { Input } from '../components/ui/Input'
import { JalaliDatePicker } from '../components/ui/JalaliDatePicker'
import { Textarea } from '../components/ui/Textarea'
import { useMe } from '../hooks/useAuth'
import { useCampaign } from '../hooks/useCampaigns'
import { useCreateOffer, useOffers } from '../hooks/useOffers'
import {
  deliverablesLabel,
  formatBudgetRange,
} from '../lib/brand-options'
import { parseNumber } from '../lib/digits'
import { canSendOffers } from '../lib/auth-storage'
import { ApprovalWaitBanner } from '../components/ApprovalWaitBanner'

const schema = z.object({
  fee: z
    .string()
    .trim()
    .min(1, 'مبلغ را وارد کنید')
    .refine((v) => {
      const n = parseNumber(v)
      return !Number.isNaN(n) && n >= 0
    }, {
      message: 'مبلغ معتبر وارد کنید',
    }),
  message: z.string().trim().max(1000, 'پیام حداکثر ۱۰۰۰ کاراکتر باشد'),
  deadline: z.string().trim(),
})

type FormValues = z.infer<typeof schema>

function toDeadlineIso(value: string) {
  const raw = value.trim()
  if (!raw) return undefined
  const parsed = /^\d{4}-\d{2}-\d{2}$/.test(raw)
    ? new Date(`${raw}T12:00:00`)
    : new Date(raw)
  if (Number.isNaN(parsed.getTime())) return undefined
  return parsed.toISOString()
}

export function CreateOfferPage() {
  const [params] = useSearchParams()
  const campaignId = params.get('campaignId') ?? ''
  const { data: user } = useMe()
  const { data: campaign, isLoading } = useCampaign(
    campaignId || undefined,
    user?.role === 'INFLUENCER' && Boolean(campaignId),
  )
  const { data: offers, isLoading: offersLoading } = useOffers(
    campaignId || undefined,
    user?.role === 'INFLUENCER' && Boolean(campaignId),
  )
  const create = useCreateOffer()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const {
    register,
    control,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { fee: '', message: '', deadline: '' },
  })

  if (!user) return null
  if (user.role !== 'INFLUENCER') {
    return <Navigate to="/app/offers" replace />
  }
  if (!campaignId) {
    return <Navigate to="/app/campaigns" replace />
  }

  if (isLoading || offersLoading) {
    return (
      <div className="flex justify-center py-24">
        <span className="size-8 animate-spin rounded-full border-2 border-purple border-t-transparent" />
      </div>
    )
  }

  const existingOffer = offers?.[0]
  if (existingOffer) {
    return <Navigate to={`/app/messages/${existingOffer.id}`} replace />
  }

  if (!campaign || campaign.status !== 'OPEN') {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-red-600">کمپین فعال پیدا نشد.</p>
        <Link
          to="/app/campaigns"
          className="mt-4 inline-block text-sm font-semibold text-purple"
        >
          بازگشت به کمپین‌ها
        </Link>
      </div>
    )
  }

  const budget =
    formatBudgetRange(campaign.budgetMin, campaign.budgetMax) ?? '—'
  const backTo = `/app/campaigns/${campaign.id}`
  const offersLocked = !canSendOffers(user)

  return (
    <div>
      <ApprovalWaitBanner />
      <section className="mb-6 sm:mb-8">
        <Link
          to={backTo}
          className="mb-3 inline-block text-sm font-medium text-muted transition hover:text-purple"
        >
          ← بازگشت
        </Link>
        <h1 className="text-2xl font-extrabold text-navy sm:text-3xl">
          ارسال پیشنهاد
        </h1>
        <p className="mt-2 text-sm text-muted">
          کمپین «{campaign.title}» ·{' '}
          {deliverablesLabel(campaign.deliverables, campaign.deliverable)} ·
          بودجه {budget}
        </p>
      </section>

      <form
        className="card-elevated space-y-5 rounded-2xl px-5 py-6 sm:px-7"
        onSubmit={handleSubmit(() => setConfirmOpen(true))}
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
              hint="تقویم شمسی"
              placeholder="انتخاب تاریخ شمسی"
            />
          )}
        />

        {offersLocked ? (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm leading-7 text-amber-800">
            منتظر تأیید ادمین بمانید. پس از بررسی فالو و دایرکت می‌توانید پیشنهاد
            بفرستید.
          </p>
        ) : null}

        {create.isError ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600">
            {getApiErrorMessage(create.error, 'ارسال پیشنهاد ناموفق بود')}
          </p>
        ) : null}

        <Button type="submit" loading={create.isPending} disabled={offersLocked}>
          ارسال پیشنهاد
        </Button>
      </form>

      <ConfirmModal
        open={confirmOpen}
        title="ارسال پیشنهاد؟"
        description="پیشنهاد قیمت برای صاحب کسب و کار ارسال می‌شود و گفتگو باز می‌شود."
        confirmLabel="ارسال پیشنهاد"
        loading={create.isPending}
        error={
          create.isError
            ? getApiErrorMessage(create.error, 'ارسال پیشنهاد ناموفق بود')
            : null
        }
        onConfirm={() => {
          const values = getValues()
          create.mutate({
            campaignId,
            fee: parseNumber(values.fee),
            message: values.message || undefined,
            deadline: toDeadlineIso(values.deadline),
          })
        }}
        onClose={() => {
          if (!create.isPending) setConfirmOpen(false)
        }}
      />
    </div>
  )
}
