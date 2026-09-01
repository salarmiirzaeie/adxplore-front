import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from './ui/Button'
import {
  deliverablesLabel,
  offerPipelineLabel,
} from '../lib/brand-options'
import { formatLocation } from '../lib/iran-locations'
import type { DealStatus, Offer } from '../types/api'

interface OfferProposalCardProps {
  offer: Offer
  dealStatus?: DealStatus | null
  isBrand: boolean
  pending: boolean
  updating?: boolean
  onAccept?: () => void
  onReject?: () => void
  onCancel?: () => void
}

/** Structured offer card shown inside the chat thread (Karlancer-style). */
export function OfferProposalCard({
  offer,
  dealStatus,
  isBrand,
  pending,
  updating,
  onAccept,
  onReject,
  onCancel,
}: OfferProposalCardProps) {
  const [expanded, setExpanded] = useState(false)
  const fee = offer.fee.toLocaleString('fa-IR')
  const longMessage =
    offer.message != null && offer.message.trim().length > 120
  const deadline = offer.deadline
    ? new Date(offer.deadline).toLocaleDateString('fa-IR')
    : null

  return (
    <article className="mx-auto w-full max-w-md rounded-2xl border border-emerald-200/80 bg-surface-elevated p-3 shadow-sm sm:p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold text-emerald-700">پیشنهاد همکاری</p>
          <h3 className="mt-1 text-base font-extrabold text-navy">
            {offer.campaign.title}
          </h3>
        </div>
        <span className="shrink-0 rounded-lg bg-surface px-2 py-1 text-[10px] font-bold text-muted">
          {offerPipelineLabel(offer.status, dealStatus)}
        </span>
      </div>

      <dl className="grid grid-cols-2 gap-3 rounded-xl bg-surface px-3 py-3 text-sm">
        <div>
          <dt className="text-[11px] font-semibold text-muted">مبلغ</dt>
          <dd className="mt-0.5 font-extrabold text-navy" dir="ltr">
            {fee} تومان
          </dd>
        </div>
        <div>
          <dt className="text-[11px] font-semibold text-muted">نوع محتوا</dt>
          <dd className="mt-0.5 font-bold text-navy">
            {deliverablesLabel(offer.campaign.deliverables, offer.campaign.deliverable) ?? '—'}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] font-semibold text-muted">شهر</dt>
          <dd className="mt-0.5 font-bold text-navy">
            {formatLocation(offer.campaign.city, offer.campaign.province)}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] font-semibold text-muted">مهلت</dt>
          <dd className="mt-0.5 font-bold text-navy">{deadline ?? '—'}</dd>
        </div>
      </dl>

      {offer.message ? (
        <div className="mt-3">
          <p
            className={`text-sm leading-7 text-muted whitespace-pre-wrap ${
              longMessage && !expanded ? 'line-clamp-3' : ''
            }`}
          >
            {offer.message}
          </p>
          {longMessage ? (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="mt-1 text-xs font-bold text-purple"
            >
              {expanded ? 'بستن' : 'نمایش بیشتر'}
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-3">
        <Link
          to={`/app/campaigns/${offer.campaignId}`}
          className="text-xs font-bold text-purple hover:underline"
        >
          مشاهده کمپین
        </Link>
        {pending ? (
          <div className="flex gap-2">
            {isBrand ? (
              <>
                <Button
                  type="button"
                  fullWidth={false}
                  className="px-3 py-2 text-xs"
                  loading={updating}
                  onClick={onAccept}
                >
                  قبول
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  fullWidth={false}
                  className="px-3 py-2 text-xs"
                  loading={updating}
                  onClick={onReject}
                >
                  رد
                </Button>
              </>
            ) : (
              <Button
                type="button"
                variant="outline"
                fullWidth={false}
                className="px-3 py-2 text-xs"
                loading={updating}
                onClick={onCancel}
              >
                لغو پیشنهاد
              </Button>
            )}
          </div>
        ) : null}
      </div>
    </article>
  )
}
