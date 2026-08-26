import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { z } from 'zod'
import { getApiErrorMessage } from '../api/client'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Textarea } from '../components/ui/Textarea'
import { useMe } from '../hooks/useAuth'
import { useCampaign } from '../hooks/useCampaigns'
import { useCreateOffer, useOffers } from '../hooks/useOffers'
import {
  deliverableLabel,
  formatBudgetRange,
} from '../lib/brand-options'

const schema = z.object({
  fee: z
    .string()
    .trim()
    .min(1, 'مبلغ را وارد کنید')
    .refine((v) => !Number.isNaN(Number(v)) && Number(v) >= 0, {
      message: 'مبلغ معتبر وارد کنید',
    }),
  message: z.string().trim().max(1000, 'پیام حداکثر ۱۰۰۰ کاراکتر باشد'),
  deadline: z.string().trim(),
})

type FormValues = z.infer<typeof schema>

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

  const {
    register,
    handleSubmit,
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

  return (
    <div>
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
          کمپین «{campaign.title}» · {deliverableLabel(campaign.deliverable)} ·
          بودجه {budget}
        </p>
      </section>

      <form
        className="card-elevated space-y-5 rounded-2xl px-5 py-6 sm:px-7"
        onSubmit={handleSubmit((values) => {
          create.mutate({
            campaignId,
            fee: Number(values.fee),
            message: values.message || undefined,
            deadline: values.deadline
              ? new Date(values.deadline).toISOString()
              : undefined,
          })
        })}
      >
        <Input
          label="مبلغ پیشنهادی (تومان)"
          type="number"
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

        <Input
          label="مهلت تحویل (اختیاری)"
          type="date"
          dir="ltr"
          error={errors.deadline?.message}
          {...register('deadline')}
        />

        {create.isError ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600">
            {getApiErrorMessage(create.error, 'ارسال پیشنهاد ناموفق بود')}
          </p>
        ) : null}

        <Button type="submit" loading={create.isPending}>
          ارسال پیشنهاد
        </Button>
      </form>
    </div>
  )
}
