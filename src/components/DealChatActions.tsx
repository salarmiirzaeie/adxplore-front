import { useState } from 'react'
import { getApiErrorMessage } from '../api/client'
import { Button } from './ui/Button'
import { ConfirmModal } from './ui/ConfirmModal'
import { Input } from './ui/Input'
import { Textarea } from './ui/Textarea'
import {
  useSubmitDeliverable,
  useUpdateDealStatus,
} from '../hooks/useDeals'
import { useRequestDealPayment } from '../hooks/usePayments'
import { dealStatusLabel } from '../lib/brand-options'
import { MediaPicker } from './MediaPicker'
import type { Deal, DealContentKind } from '../types/api'

interface DealChatActionsProps {
  deal: Deal
  isBrand: boolean
  onUpdated?: () => void
}

export function DealChatActions({ deal, isBrand, onUpdated }: DealChatActionsProps) {
  const submit = useSubmitDeliverable(deal.id)
  const update = useUpdateDealStatus(deal.id)
  const pay = useRequestDealPayment(deal.id)
  const [kind, setKind] = useState<DealContentKind>('LINK')
  const [contentUrl, setContentUrl] = useState(deal.contentUrl ?? '')
  const [note, setNote] = useState('')
  const [contentFile, setContentFile] = useState<File | null>(null)
  const [feedback, setFeedback] = useState('')
  const [showSubmit, setShowSubmit] = useState(false)
  const [showRevision, setShowRevision] = useState(false)
  const [confirm, setConfirm] = useState<
    'pay' | 'submit' | 'complete' | 'revision' | 'cancel' | null
  >(null)

  const needsPayment = deal.status === 'PENDING_PAYMENT'
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
    ? (deal.status === 'PENDING_PAYMENT' || deal.status === 'IN_PROGRESS') &&
      !contentPublished
    : deal.status === 'PENDING_PAYMENT' ||
      deal.status === 'IN_PROGRESS' ||
      deal.status === 'REVISION_REQUESTED'
  const busy = submit.isPending || update.isPending || pay.isPending

  if (deal.status === 'COMPLETED' || deal.status === 'CANCELLED') {
    return (
      <div className="border-t border-border bg-surface/80 px-4 py-3 text-center">
        <p className="text-xs font-bold text-muted">
          {dealStatusLabel(deal.status)}
        </p>
      </div>
    )
  }

  if (!needsPayment && !canSubmit && !canReview && !canCancel) return null

  const onSubmitDeliverable = () => {
    const caption = note.trim() || undefined
    if (kind === 'LINK') {
      const url = contentUrl.trim()
      if (!url) return
      submit.mutate(
        { kind: 'LINK', contentUrl: url, note: caption },
        {
          onSuccess: () => {
            setConfirm(null)
            setShowSubmit(false)
            setNote('')
            setContentFile(null)
            onUpdated?.()
          },
        },
      )
      return
    }
    if (!contentFile) return
    submit.mutate(
      { kind, file: contentFile, note: caption },
      {
        onSuccess: () => {
          setConfirm(null)
          setShowSubmit(false)
          setNote('')
          setContentFile(null)
          onUpdated?.()
        },
      },
    )
  }

  const onPay = () => {
    pay.mutate(undefined, {
      onSuccess: (res) => {
        if (res.paymentUrl) {
          window.location.assign(res.paymentUrl)
        }
      },
    })
  }

  return (
    <div className="shrink-0 border-t border-border bg-surface/60 px-3 py-3 sm:px-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-xs font-bold text-navy">
          همکاری · {dealStatusLabel(deal.status)}
        </p>
        <p className="text-xs text-muted" dir="ltr">
          {deal.fee.toLocaleString('fa-IR')} تومان
        </p>
      </div>

      {needsPayment ? (
        <div className="space-y-2">
          {isBrand ? (
            <>
              <p className="text-xs leading-6 text-muted">
                برای شروع همکاری، مبلغ پیشنهاد را از طریق زرین‌پال پرداخت کنید.
                مبلغ تا تأیید تحویل در حساب امانی می‌ماند.
              </p>
              <Button
                type="button"
                fullWidth={false}
                className="w-full"
                disabled={busy}
                onClick={() => setConfirm('pay')}
              >
                پرداخت امن · {deal.fee.toLocaleString('fa-IR')} تومان
              </Button>
              {pay.isError ? (
                <p className="text-xs text-red-600">
                  {getApiErrorMessage(pay.error, 'خطا در اتصال به درگاه')}
                </p>
              ) : null}
            </>
          ) : (
            <p className="text-xs leading-6 text-muted">
              در انتظار پرداخت برند برای شروع همکاری…
            </p>
          )}
        </div>
      ) : null}

      {canSubmit && !showSubmit ? (
        <Button
          type="button"
          fullWidth={false}
          className="w-full"
          onClick={() => setShowSubmit(true)}
        >
          {deal.status === 'REVISION_REQUESTED'
            ? 'ارسال مجدد محتوا'
            : 'تحویل محتوا'}
        </Button>
      ) : null}

      {canSubmit && showSubmit ? (
        <div className="space-y-3 rounded-xl border border-border bg-surface-elevated p-3">
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
                className={`rounded-lg px-2 py-1.5 text-xs font-bold ${
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
              value={contentUrl}
              onChange={(e) => setContentUrl(e.target.value)}
              placeholder="https://instagram.com/p/..."
              dir="ltr"
            />
          ) : (
            <MediaPicker
              key={kind}
              kind={kind}
              file={contentFile}
              onChange={setContentFile}
              compact
            />
          )}
          <Textarea
            label="یادداشت (اختیاری)"
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          {(submit.isError || update.isError) && (
            <p className="text-xs text-red-600">
              {getApiErrorMessage(
                submit.error || update.error,
                'عملیات ناموفق بود',
              )}
            </p>
          )}
          <div className="flex gap-2">
            <Button
              type="button"
              fullWidth={false}
              className="flex-1"
              disabled={
                busy ||
                (kind === 'LINK' ? !contentUrl.trim() : !contentFile)
              }
              onClick={() => setConfirm('submit')}
            >
              ثبت تحویل
            </Button>
            <Button
              type="button"
              variant="outline"
              fullWidth={false}
              className="flex-1"
              onClick={() => setShowSubmit(false)}
            >
              انصراف
            </Button>
          </div>
        </div>
      ) : null}

      {canReview ? (
        <div className="space-y-2">
          {!showRevision ? (
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                fullWidth={false}
                className="flex-1"
                disabled={busy}
                onClick={() => setConfirm('complete')}
              >
                تأیید تحویل
              </Button>
              <Button
                type="button"
                variant="outline"
                fullWidth={false}
                className="flex-1"
                onClick={() => setShowRevision(true)}
              >
                درخواست اصلاح
              </Button>
            </div>
          ) : (
            <div className="space-y-2 rounded-xl border border-border bg-surface-elevated p-3">
              <Textarea
                label="بازخورد برای اصلاح"
                rows={3}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  fullWidth={false}
                  className="flex-1"
                  disabled={!feedback.trim() || busy}
                  onClick={() => setConfirm('revision')}
                >
                  ارسال درخواست
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  fullWidth={false}
                  className="flex-1"
                  onClick={() => setShowRevision(false)}
                >
                  انصراف
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : null}

      {canCancel ? (
        <button
          type="button"
          disabled={busy}
          onClick={() => setConfirm('cancel')}
          className="mt-2 w-full text-center text-xs font-semibold text-red-600 disabled:opacity-50"
        >
          لغو همکاری
        </button>
      ) : null}

      <ConfirmModal
        open={confirm === 'pay'}
        title="پرداخت امن؟"
        description={`به درگاه زرین‌پال منتقل می‌شوید. مبلغ ${deal.fee.toLocaleString('fa-IR')} تومان تا تأیید تحویل در حساب امانی می‌ماند.`}
        confirmLabel="ادامه به پرداخت"
        loading={pay.isPending}
        error={
          pay.isError
            ? getApiErrorMessage(pay.error, 'خطا در اتصال به درگاه')
            : null
        }
        onConfirm={onPay}
        onClose={() => {
          if (!pay.isPending) setConfirm(null)
        }}
      />
      <ConfirmModal
        open={confirm === 'submit'}
        title="ثبت تحویل؟"
        description="محتوا برای برند ارسال می‌شود تا بررسی کند."
        confirmLabel="ثبت تحویل"
        loading={submit.isPending}
        error={
          submit.isError
            ? getApiErrorMessage(submit.error, 'عملیات ناموفق بود')
            : null
        }
        onConfirm={onSubmitDeliverable}
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
            {
              onSuccess: () => {
                setConfirm(null)
                onUpdated?.()
              },
            },
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
            {
              onSuccess: () => {
                setConfirm(null)
                setShowRevision(false)
                setFeedback('')
                onUpdated?.()
              },
            },
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
            {
              onSuccess: () => {
                setConfirm(null)
                onUpdated?.()
              },
            },
          )
        }
        onClose={() => {
          if (!update.isPending) setConfirm(null)
        }}
      />
    </div>
  )
}
