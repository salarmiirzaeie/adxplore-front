import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  deliverablesLabel,
  offerPipelineLabel,
} from '../lib/brand-options'
import { formatLocation } from '../lib/iran-locations'
import type { DealStatus, Offer } from '../types/api'
import { EditOfferModal } from './EditOfferModal'

interface OfferProposalCardProps {
  offer: Offer
  dealStatus?: DealStatus | null
  canEdit?: boolean
  onUpdated?: () => void
}

/** Structured offer card shown inside the chat thread (Karlancer-style). */
export function OfferProposalCard({
  offer,
  dealStatus,
  canEdit = false,
  onUpdated,
}: OfferProposalCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing] = useState(false)
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

      <div className="mt-3 flex items-center justify-between gap-3 border-t border-border pt-3">
        <Link
          to={`/app/campaigns/${offer.campaignId}`}
          className="text-xs font-bold text-purple hover:underline"
        >
          مشاهده کمپین
        </Link>
        {canEdit ? (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-bold text-emerald-800 transition hover:bg-emerald-100"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M4 20h4l10.5-10.5a2.12 2.12 0 0 0-3-3L5 17v3z"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinejoin="round"
              />
              <path
                d="M13.5 6.5l3 3"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            </svg>
            ویرایش
          </button>
        ) : null}
      </div>

      <EditOfferModal
        offer={offer}
        open={editing}
        onClose={() => setEditing(false)}
        onUpdated={onUpdated}
      />
    </article>
  )
}
