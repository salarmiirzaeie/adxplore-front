import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getApiErrorMessage } from '../api/client'
import { Avatar } from '../components/ui/Avatar'
import { Button } from '../components/ui/Button'
import { ConfirmModal } from '../components/ui/ConfirmModal'
import { Input } from '../components/ui/Input'
import { Textarea } from '../components/ui/Textarea'
import { MediaPicker } from '../components/MediaPicker'
import { MediaPreview } from '../components/MediaPreview'
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
import type { DealContentKind, DealStatus } from '../types/api'

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

export function DealDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: user } = useMe()
  const { data: deal, isLoading, isError } = useDeal(id)
  const submit = useSubmitDeliverable(id ?? '')
  const update = useUpdateDealStatus(id ?? '')
  const [kind, setKind] = useState<DealContentKind>('LINK')
  const [contentUrl, setContentUrl] = useState('')
  const [note, setNote] = useState('')
  const [contentFile, setContentFile] = useState<File | null>(null)
  const [feedback, setFeedback] = useState('')
  const [confirm, setConfirm] = useState<
    'submit' | 'complete' | 'revision' | 'cancel' | null
  >(null)

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
  const contentPublished =
    Boolean(deal.contentUrl) ||
    Boolean(deal.submittedAt) ||
    deal.status === 'DELIVERED' ||
    deal.status === 'REVISION_REQUESTED'
  const canCancel = isBrand
    ? deal.status === 'IN_PROGRESS' && !contentPublished
    : deal.status === 'IN_PROGRESS' || deal.status === 'REVISION_REQUESTED'

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
          {deal.contentUrl &&
          (deal.contentKind ?? 'LINK') === 'LINK' ? (
            <DetailRow label="لینک محتوا" value={deal.contentUrl} dir="ltr" />
          ) : null}
          {deal.note ? <DetailRow label="یادداشت تحویل" value={deal.note} /> : null}
          {deal.brandFeedback ? (
            <DetailRow label="بازخورد برند" value={deal.brandFeedback} />
          ) : null}
        </dl>
      </section>

      {deal.contentUrl &&
      ((deal.contentKind ?? 'LINK') === 'IMAGE' ||
        (deal.contentKind ?? 'LINK') === 'VIDEO') ? (
        <div className="mb-4 overflow-hidden rounded-2xl border border-border bg-surface-elevated p-3">
          <MediaPreview
            kind={deal.contentKind ?? 'LINK'}
            url={deal.contentUrl}
            alt="محتوای تحویل"
          />
        </div>
      ) : null}

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
          onSubmit={(e) => {
            e.preventDefault()
            if (kind === 'LINK' ? !contentUrl.trim() : !contentFile) return
            setConfirm('submit')
          }}
        >
          <h2 className="text-base font-extrabold text-navy">تحویل محتوا</h2>
          {deal.status === 'REVISION_REQUESTED' && deal.brandFeedback ? (
            <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">
              اصلاح درخواستی: {deal.brandFeedback}
            </p>
          ) : null}
          <div className="grid grid-cols-3 gap-1 rounded-xl bg-surface p-1">
            {(
              [
                ['LINK', 'لینک'],
                ['IMAGE', 'تصویر'],
                ['VIDEO', 'ویدیو'],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setKind(value)
                  setContentFile(null)
                }}
                className={`rounded-lg px-2 py-2 text-sm font-bold ${
                  kind === value
                    ? 'bg-surface-elevated text-purple shadow-sm'
                    : 'text-muted'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {kind === 'LINK' ? (
            <Input
              label="لینک محتوا"
              placeholder="https://www.instagram.com/..."
              dir="ltr"
              value={contentUrl}
              onChange={(e) => setContentUrl(e.target.value)}
            />
          ) : (
            <MediaPicker
              key={kind}
              kind={kind}
              file={contentFile}
              onChange={setContentFile}
            />
          )}
          <Textarea
            label="یادداشت (اختیاری)"
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <Button
            type="submit"
            disabled={
              submit.isPending ||
              (kind === 'LINK' ? !contentUrl.trim() : !contentFile)
            }
          >
            ارسال تحویل
          </Button>
        </form>
      ) : null}

      {canReview ? (
        <div className="mb-4 space-y-3">
          <Button
            disabled={update.isPending}
            onClick={() => setConfirm('complete')}
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
            disabled={update.isPending || !feedback.trim()}
            onClick={() => setConfirm('revision')}
          >
            درخواست اصلاح
          </Button>
        </div>
      ) : null}

      {canCancel ? (
        <Button
          variant="outline"
          disabled={update.isPending}
          onClick={() => setConfirm('cancel')}
        >
          لغو پیشنهاد پذیرفته‌شده
        </Button>
      ) : null}

      {deal.status === 'COMPLETED' ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          این پیشنهاد با موفقیت تکمیل شد.
        </p>
      ) : null}

      <ConfirmModal
        open={confirm === 'submit'}
        title="ثبت تحویل؟"
        description="محتوا برای برند ارسال می‌شود تا بررسی کند."
        confirmLabel="ارسال تحویل"
        loading={submit.isPending}
        error={
          submit.isError
            ? getApiErrorMessage(submit.error, 'عملیات ناموفق بود')
            : null
        }
        onConfirm={() => {
          const caption = note.trim() || undefined
          submit.mutate(
            kind === 'LINK'
              ? {
                  kind: 'LINK',
                  contentUrl: contentUrl.trim(),
                  note: caption,
                }
              : {
                  kind,
                  file: contentFile ?? undefined,
                  note: caption,
                },
            {
              onSuccess: () => {
                setConfirm(null)
                setNote('')
                setContentFile(null)
              },
            },
          )
        }}
        onClose={() => {
          if (!submit.isPending) setConfirm(null)
        }}
      />
      <ConfirmModal
        open={confirm === 'complete'}
        title="تأیید تحویل؟"
        description="با تأیید، مبلغ از امانت آزاد و به اینفلوئنسر واریز می‌شود. این کار قابل برگشت نیست."
        confirmLabel="تأیید و تکمیل"
        loading={update.isPending}
        error={
          update.isError
            ? getApiErrorMessage(update.error, 'عملیات ناموفق بود')
            : null
        }
        onConfirm={() =>
          update.mutate(
            { status: 'COMPLETED' },
            { onSuccess: () => setConfirm(null) },
          )
        }
        onClose={() => {
          if (!update.isPending) setConfirm(null)
        }}
      />
      <ConfirmModal
        open={confirm === 'revision'}
        title="ارسال درخواست اصلاح؟"
        description="اینفلوئنسر باید محتوا را بر اساس بازخورد شما دوباره ارسال کند."
        confirmLabel="ارسال درخواست"
        loading={update.isPending}
        error={
          update.isError
            ? getApiErrorMessage(update.error, 'عملیات ناموفق بود')
            : null
        }
        onConfirm={() =>
          update.mutate(
            {
              status: 'REVISION_REQUESTED',
              brandFeedback: feedback.trim(),
            },
            { onSuccess: () => setConfirm(null) },
          )
        }
        onClose={() => {
          if (!update.isPending) setConfirm(null)
        }}
      />
      <ConfirmModal
        open={confirm === 'cancel'}
        title="لغو همکاری؟"
        description="همکاری لغو می‌شود و در صورت پرداخت، مبلغ به کیف پول برند برمی‌گردد."
        confirmLabel="لغو همکاری"
        tone="danger"
        loading={update.isPending}
        error={
          update.isError
            ? getApiErrorMessage(update.error, 'عملیات ناموفق بود')
            : null
        }
        onConfirm={() =>
          update.mutate(
            { status: 'CANCELLED' },
            { onSuccess: () => setConfirm(null) },
          )
        }
        onClose={() => {
          if (!update.isPending) setConfirm(null)
        }}
      />
    </div>
  )
}
