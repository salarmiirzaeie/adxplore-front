import { useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { getApiErrorMessage } from '../api/client'
import { Avatar } from '../components/ui/Avatar'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Textarea } from '../components/ui/Textarea'
import { useMe } from '../hooks/useAuth'
import {
  useDeal,
  useSubmitDeliverable,
  useUpdateDealStatus,
} from '../hooks/useDeals'
import {
  brandCategoriesLabel,
  dealStatusLabel,
  deliverablesLabel,
} from '../lib/brand-options'
import { formatLocation } from '../lib/iran-locations'
import type { DealStatus } from '../types/api'

function DetailRow({
  label,
  value,
  dir,
}: {
  label: string
  value: string
  dir?: 'ltr'
}) {
  return (
    <div className="border-b border-border py-4 last:border-b-0">
      <dt className="text-xs font-semibold text-muted">{label}</dt>
      <dd
        className="mt-1.5 text-sm font-bold text-navy whitespace-pre-wrap"
        dir={dir}
      >
        {value}
      </dd>
    </div>
  )
}

function statusClass(status: DealStatus) {
  if (status === 'COMPLETED') return 'bg-emerald-50 text-emerald-700'
  if (status === 'DELIVERED') return 'bg-blue-50 text-blue-700'
  if (status === 'REVISION_REQUESTED') return 'bg-amber-50 text-amber-700'
  if (status === 'PENDING_PAYMENT') return 'bg-orange-50 text-orange-700'
  if (status === 'CANCELLED') return 'bg-slate-100 text-slate-600'
  return 'bg-purple-soft/60 text-purple-deep'
}

const deliverableSchema = z.object({
  contentUrl: z
    .string()
    .trim()
    .url('آدرس معتبر وارد کنید')
    .min(1, 'لینک محتوا الزامی است'),
  note: z.string().trim().max(2000, 'توضیح حداکثر ۲۰۰۰ کاراکتر باشد'),
})

type DeliverableForm = z.infer<typeof deliverableSchema>

export function DealDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: user } = useMe()
  const { data: deal, isLoading, isError } = useDeal(id)
  const submit = useSubmitDeliverable(id ?? '')
  const update = useUpdateDealStatus(id ?? '')
  const fileRef = useRef<HTMLInputElement>(null)
  const [proof, setProof] = useState<File | null>(null)
  const [feedback, setFeedback] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DeliverableForm>({
    resolver: zodResolver(deliverableSchema),
    defaultValues: { contentUrl: '', note: '' },
  })

  if (!user) return null

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <span className="size-8 animate-spin rounded-full border-2 border-purple border-t-transparent" />
      </div>
    )
  }

  if (isError || !deal) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-red-600">پیشنهاد / تحویل پیدا نشد.</p>
        <Link
          to="/app/offers"
          className="mt-4 inline-block text-sm font-semibold text-purple"
        >
          بازگشت به پیشنهادها
        </Link>
      </div>
    )
  }

  const isBrand = user.role === 'BRAND'
  const party = isBrand ? deal.influencer : deal.brand
  const fee = deal.fee.toLocaleString('fa-IR')
  const canSubmit =
    !isBrand &&
    (deal.status === 'IN_PROGRESS' || deal.status === 'REVISION_REQUESTED')
  const canReview = isBrand && deal.status === 'DELIVERED'
  const canCancel =
    deal.status === 'IN_PROGRESS' || deal.status === 'REVISION_REQUESTED'

  return (
    <div>
      <section className="mb-6 sm:mb-8">
        <Link
          to="/app/offers"
          className="mb-3 inline-block text-sm font-medium text-muted transition hover:text-purple"
        >
          ← بازگشت به پیشنهادها
        </Link>
        <span
          className={`mb-2 inline-block rounded-lg px-2 py-1 text-[11px] font-bold ${statusClass(deal.status)}`}
        >
          {dealStatusLabel(deal.status)}
        </span>
        <h1 className="text-2xl font-extrabold text-navy sm:text-3xl">
          {deal.campaign.title}
        </h1>
        <div className="mt-4 flex items-center gap-3">
          <Avatar src={party.photoUrl} name={party.name} size="md" />
          <div>
            <p className="text-sm font-bold text-navy">{party.name ?? '—'}</p>
            <p className="text-xs font-semibold text-muted">
              {isBrand ? 'اینفلوئنسر' : 'برند'}
              {party.category
                ? ` · ${brandCategoriesLabel(party.categories, party.category)}`
                : ''}
            </p>
          </div>
        </div>
      </section>

      <Link
        to={`/app/messages/${deal.offerId}`}
        className="mb-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-purple px-4 py-3.5 text-sm font-bold text-white transition hover:opacity-95"
      >
        باز کردن گفتگو
      </Link>

      <Link
        to={`/app/campaigns/${deal.campaignId}`}
        className="mb-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface-elevated px-4 py-3.5 text-sm font-bold text-navy transition hover:border-purple/30 hover:bg-purple-soft/20"
      >
        مشاهده کمپین
      </Link>

      <section className="card-elevated mb-4 rounded-2xl px-5 py-2 sm:px-7">
        <dl>
          <DetailRow label="مبلغ توافقی" value={`${fee} تومان`} dir="ltr" />
          <DetailRow
            label="نوع محتوا"
            value={
              deliverablesLabel(deal.campaign.deliverables, deal.campaign.deliverable) ??
              '—'
            }
          />
          <DetailRow
            label="شهر"
            value={formatLocation(deal.campaign.city, deal.campaign.province) || '—'}
          />
          {deal.contentUrl ? (
            <DetailRow label="لینک محتوا" value={deal.contentUrl} dir="ltr" />
          ) : null}
          {deal.note ? <DetailRow label="یادداشت تحویل" value={deal.note} /> : null}
          {deal.brandFeedback ? (
            <DetailRow label="بازخورد برند" value={deal.brandFeedback} />
          ) : null}
        </dl>
      </section>

      {deal.proofUrl ? (
        <img
          src={deal.proofUrl}
          alt="مدرک تحویل"
          className="mb-4 max-h-64 w-full rounded-2xl object-cover"
        />
      ) : null}

      {(submit.isError || update.isError) && (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600">
          {getApiErrorMessage(
            submit.error || update.error,
            'عملیات ناموفق بود',
          )}
        </p>
      )}

      {canSubmit ? (
        <form
          className="card-elevated mb-4 space-y-4 rounded-2xl px-5 py-6 sm:px-7"
          onSubmit={handleSubmit((values) => {
            submit.mutate({
              contentUrl: values.contentUrl,
              note: values.note || undefined,
              proof: proof ?? undefined,
            })
          })}
        >
          <h2 className="text-base font-extrabold text-navy">تحویل محتوا</h2>
          {deal.status === 'REVISION_REQUESTED' && deal.brandFeedback ? (
            <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">
              اصلاح درخواستی: {deal.brandFeedback}
            </p>
          ) : null}
          <Input
            label="لینک اینستاگرام"
            placeholder="https://www.instagram.com/..."
            dir="ltr"
            error={errors.contentUrl?.message}
            {...register('contentUrl')}
          />
          <Textarea
            label="یادداشت (اختیاری)"
            rows={3}
            error={errors.note?.message}
            {...register('note')}
          />
          <div>
            <p className="mb-2 text-sm font-semibold text-navy">
              اسکرین‌شات (اختیاری)
            </p>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => setProof(e.target.files?.[0] ?? null)}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-navy hover:bg-surface"
            >
              {proof ? proof.name : 'انتخاب تصویر'}
            </button>
          </div>
          <Button type="submit" loading={submit.isPending}>
            ارسال تحویل
          </Button>
        </form>
      ) : null}

      {canReview ? (
        <div className="mb-4 space-y-3">
          <Button
            loading={update.isPending}
            onClick={() => update.mutate({ status: 'COMPLETED' })}
          >
            تأیید تحویل و تکمیل
          </Button>
          <Textarea
            label="درخواست اصلاح"
            rows={3}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="توضیح دهید چه چیزی باید اصلاح شود…"
          />
          <Button
            variant="outline"
            loading={update.isPending}
            disabled={!feedback.trim()}
            onClick={() =>
              update.mutate({
                status: 'REVISION_REQUESTED',
                brandFeedback: feedback.trim(),
              })
            }
          >
            درخواست اصلاح
          </Button>
        </div>
      ) : null}

      {canCancel ? (
        <Button
          variant="outline"
          loading={update.isPending}
          onClick={() => update.mutate({ status: 'CANCELLED' })}
        >
          لغو پیشنهاد پذیرفته‌شده
        </Button>
      ) : null}

      {deal.status === 'COMPLETED' ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          این پیشنهاد با موفقیت تکمیل شد.
        </p>
      ) : null}
    </div>
  )
}
