import type { ChatMessageMetadata } from '../types/api'

const EVENT_LABELS: Record<string, string> = {
  DEAL_STARTED: 'همکاری آغاز شد',
  DELIVERABLE_SUBMITTED: 'تحویل محتوا',
  DEAL_COMPLETED: 'تأیید تحویل',
  REVISION_REQUESTED: 'درخواست اصلاح',
  DEAL_CANCELLED: 'لغو همکاری',
  OFFER_ACCEPTED: 'پیشنهاد پذیرفته شد',
  OFFER_REJECTED: 'پیشنهاد رد شد',
  OFFER_CANCELLED: 'پیشنهاد لغو شد',
  OFFER_AFTER_INVITATION: 'پاسخ به دعوت',
  PAYMENT_REQUIRED: 'پرداخت لازم است',
  PAYMENT_HELD: 'پرداخت موفق',
  PAYMENT_RELEASED: 'آزادسازی مبلغ',
  PAYMENT_FAILED: 'پرداخت ناموفق',
}

export function ChatSystemMessage({
  body,
  metadata,
  createdAt,
}: {
  body: string
  metadata: ChatMessageMetadata | null
  createdAt: string
}) {
  const event = metadata?.event
  const label = (event && EVENT_LABELS[event]) || body

  return (
    <div className="flex justify-center py-1">
      <div className="max-w-md rounded-2xl border border-border bg-surface-elevated px-4 py-3 text-center shadow-sm">
        <p className="text-xs font-bold text-purple">{label}</p>
        {body !== label ? (
          <p className="mt-1 text-sm leading-6 text-navy">{body}</p>
        ) : null}
        {metadata?.brandFeedback ? (
          <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-left text-xs leading-6 text-amber-900">
            {metadata.brandFeedback}
          </p>
        ) : null}
        <p className="mt-2 text-[10px] text-muted">
          {new Date(createdAt).toLocaleString('fa-IR', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  )
}

export function ChatDeliverableCard({
  body,
  metadata,
  createdAt,
}: {
  body: string
  metadata: ChatMessageMetadata | null
  createdAt: string
}) {
  const contentUrl = metadata?.contentUrl
  const note = metadata?.note
  const proofUrl = metadata?.proofUrl

  return (
    <div className="flex justify-center py-1">
      <article className="w-full max-w-md rounded-2xl border border-blue-200/80 bg-surface-elevated p-4 shadow-sm">
        <p className="text-[11px] font-bold text-blue-700">تحویل محتوا</p>
        <p className="mt-1 text-sm font-extrabold text-navy">{body}</p>
        {contentUrl ? (
          <a
            href={contentUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-3 block truncate text-sm font-bold text-purple hover:underline"
            dir="ltr"
          >
            {contentUrl}
          </a>
        ) : null}
        {note ? (
          <p className="mt-2 text-sm leading-6 text-muted whitespace-pre-wrap">
            {note}
          </p>
        ) : null}
        {proofUrl ? (
          <img
            src={proofUrl}
            alt="مدرک تحویل"
            className="mt-3 max-h-48 w-full rounded-xl object-cover"
          />
        ) : null}
        <p className="mt-3 text-[10px] text-muted">
          {new Date(createdAt).toLocaleString('fa-IR', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </article>
    </div>
  )
}
