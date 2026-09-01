import { useRef, useState } from 'react'
import { getApiErrorMessage } from '../api/client'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { Textarea } from './ui/Textarea'
import {
  useSubmitDeliverable,
  useUpdateDealStatus,
} from '../hooks/useDeals'
import { useRequestDealPayment } from '../hooks/usePayments'
import { dealStatusLabel } from '../lib/brand-options'
import type { Deal } from '../types/api'

interface DealChatActionsProps {
  deal: Deal
  isBrand: boolean
  onUpdated?: () => void
}

export function DealChatActions({ deal, isBrand, onUpdated }: DealChatActionsProps) {
  const submit = useSubmitDeliverable(deal.id)
  const update = useUpdateDealStatus(deal.id)
  const pay = useRequestDealPayment(deal.id)
  const fileRef = useRef<HTMLInputElement>(null)
  const [contentUrl, setContentUrl] = useState(deal.contentUrl ?? '')
  const [note, setNote] = useState('')
  const [proof, setProof] = useState<File | null>(null)
  const [feedback, setFeedback] = useState('')
  const [showSubmit, setShowSubmit] = useState(false)
  const [showRevision, setShowRevision] = useState(false)

  const needsPayment = deal.status === 'PENDING_PAYMENT'
  const canSubmit =
    !isBrand &&
    (deal.status === 'IN_PROGRESS' || deal.status === 'REVISION_REQUESTED')
  const canReview = isBrand && deal.status === 'DELIVERED'
  const canCancel =
    deal.status === 'PENDING_PAYMENT' ||
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
    const url = contentUrl.trim()
    if (!url) return
    submit.mutate(
      { contentUrl: url, note: note.trim() || undefined, proof: proof ?? undefined },
      {
        onSuccess: () => {
          setShowSubmit(false)
          setNote('')
          setProof(null)
          if (fileRef.current) fileRef.current.value = ''
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
                loading={pay.isPending}
                onClick={onPay}
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
          <Input
            label="لینک محتوا"
            value={contentUrl}
            onChange={(e) => setContentUrl(e.target.value)}
            placeholder="https://instagram.com/p/..."
            dir="ltr"
          />
          <Textarea
            label="یادداشت (اختیاری)"
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <label className="block text-xs font-semibold text-muted">
            تصویر مدرک (اختیاری)
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="mt-1 block w-full text-xs"
              onChange={(e) => setProof(e.target.files?.[0] ?? null)}
            />
          </label>
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
              loading={submit.isPending}
              onClick={onSubmitDeliverable}
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
                loading={update.isPending}
                onClick={() =>
                  update.mutate({ status: 'COMPLETED' }, { onSuccess: onUpdated })
                }
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
                  loading={update.isPending}
                  disabled={!feedback.trim()}
                  onClick={() =>
                    update.mutate(
                      {
                        status: 'REVISION_REQUESTED',
                        brandFeedback: feedback.trim(),
                      },
                      {
                        onSuccess: () => {
                          setShowRevision(false)
                          setFeedback('')
                          onUpdated?.()
                        },
                      },
                    )
                  }
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
          onClick={() =>
            update.mutate({ status: 'CANCELLED' }, { onSuccess: onUpdated })
          }
          className="mt-2 w-full text-center text-xs font-semibold text-red-600 disabled:opacity-50"
        >
          لغو همکاری
        </button>
      ) : null}
    </div>
  )
}
