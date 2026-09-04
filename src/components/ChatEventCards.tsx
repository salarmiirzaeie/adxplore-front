import { MediaPreview } from './MediaPreview'
import type { ChatMessageMetadata } from '../types/api'

const EVENT_LABELS: Record<string, string> = {
  DEAL_STARTED: 'همکاری آغاز شد',
  DELIVERABLE_SUBMITTED: 'تحویل محتوا',
  DEAL_COMPLETED: 'تأیید تحویل',
  REVISION_REQUESTED: 'درخواست اصلاح',
  DEAL_CANCELLED: 'لغو همکاری',
  DEAL_REACTIVATED: 'همکاری ازسر گرفته شد',
  OFFER_ACCEPTED: 'پیشنهاد پذیرفته شد',
  OFFER_REJECTED: 'پیشنهاد رد شد',
  OFFER_CANCELLED: 'پیشنهاد لغو شد',
  OFFER_REOPENED: 'رد پیشنهاد لغو شد',
  OFFER_AFTER_INVITATION: 'پاسخ به دعوت',
  OFFER_UPDATED: 'پیشنهاد ویرایش شد',
}

function formatFee(fee?: number, body?: string) {
  if (typeof fee === 'number') {
    return `${fee.toLocaleString('fa-IR')} تومان`
  }
  const match = body?.match(/([\d۰-۹0-9٬,]+)\s*تومان/)
  return match ? `${match[1]} تومان` : null
}

function paymentLetter(
  event: string,
  isBrand: boolean,
): { title: string; description: string } | null {
  if (event === 'PAYMENT_REQUIRED') {
    return isBrand
      ? {
          title: 'پرداخت برای شروع همکاری',
          description:
            'برای شروع کار، این مبلغ را از درگاه امن پرداخت کنید. پول تا تأیید تحویل در حساب امانی می‌ماند.',
        }
      : {
          title: 'در انتظار پرداخت برند',
          description:
            'برند باید این مبلغ را پرداخت کند تا همکاری شروع شود. پول تا تأیید تحویل در حساب امانی می‌ماند.',
        }
  }
  if (event === 'PAYMENT_HELD') {
    return isBrand
      ? {
          title: 'پرداخت انجام شد',
          description:
            'مبلغ در حساب امانی قفل شد. بعد از تأیید تحویل، به اینفلوئنسر واریز می‌شود.',
        }
      : {
          title: 'پرداخت برند انجام شد',
          description:
            'مبلغ در حساب امانی است. می‌توانید کار را شروع کنید؛ بعد از تأیید تحویل به کیف پول شما واریز می‌شود.',
        }
  }
  if (event === 'PAYMENT_RELEASED') {
    return isBrand
      ? {
          title: 'مبلغ آزاد شد',
          description: 'تحویل تأیید شد و مبلغ از امانت به اینفلوئنسر واریز شد.',
        }
      : {
          title: 'مبلغ به کیف پول شما واریز شد',
          description: 'تحویل تأیید شد و مبلغ از حساب امانی به کیف پول شما منتقل شد.',
        }
  }
  if (event === 'PAYMENT_FAILED') {
    return isBrand
      ? {
          title: 'پرداخت کامل نشد',
          description:
            'پرداخت ناموفق بود. دوباره از بخش همکاری اقدام کنید تا کار شروع شود.',
        }
      : {
          title: 'پرداخت برند کامل نشد',
          description:
            'پرداخت انجام نشد و همکاری هنوز شروع نشده. منتظر پرداخت مجدد برند بمانید.',
        }
  }
  if (event === 'DEAL_CANCELLED') {
    return {
      title: 'همکاری لغو شد',
      description:
        'فقط کسی که همکاری را لغو کرده می‌تواند آن را دوباره فعال کند.',
    }
  }
  if (event === 'DEAL_REACTIVATED') {
    return {
      title: 'همکاری ازسر گرفته شد',
      description: 'همکاری دوباره فعال شد و می‌توانید کار را ادامه دهید.',
    }
  }
  if (event === 'OFFER_REOPENED') {
    return isBrand
      ? {
          title: 'رد پیشنهاد لغو شد',
          description: 'پیشنهاد دوباره در انتظار است و می‌توانید آن را قبول کنید.',
        }
      : {
          title: 'برند رد پیشنهاد را لغو کرد',
          description: 'پیشنهاد دوباره در انتظار بررسی برند است.',
        }
  }
  return null
}

export function ChatSystemMessage({
  body,
  metadata,
  createdAt,
  isBrand,
  fee,
}: {
  body: string
  metadata: ChatMessageMetadata | null
  createdAt: string
  isBrand: boolean
  fee?: number
}) {
  const event = metadata?.event
  const letter = event ? paymentLetter(event, isBrand) : null
  const title = letter?.title ?? (event && EVENT_LABELS[event]) ?? body
  const description = letter?.description ?? null
  const amount = letter
    ? formatFee(fee, body)
    : event === 'OFFER_UPDATED'
      ? formatFee(metadata?.fee ?? fee, body)
      : null
  const showRawBody = !letter && event !== 'OFFER_UPDATED' && body !== title

  return (
    <div className="flex justify-center py-1">
      <div className="max-w-md rounded-2xl border border-border bg-surface-elevated px-4 py-3 text-center shadow-sm">
        <p className="text-xs font-bold text-purple">{title}</p>
        {description ? (
          <p className="mt-1 text-sm leading-7 text-navy">{description}</p>
        ) : null}
        {showRawBody ? (
          <p className="mt-1 text-sm leading-6 text-navy">{body}</p>
        ) : null}
        {amount ? (
          <p className="mt-2 text-sm font-extrabold text-navy" dir="ltr">
            {amount}
          </p>
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
  const contentKind = metadata?.contentKind ?? 'LINK'

  return (
    <div className="flex justify-center py-1">
      <article className="w-full max-w-md rounded-2xl border border-blue-200/80 bg-surface-elevated p-4 shadow-sm">
        <p className="text-[11px] font-bold text-blue-700">تحویل محتوا</p>
        <p className="mt-1 text-sm font-extrabold text-navy">{body}</p>
        <MediaPreview kind={contentKind} url={contentUrl} alt="محتوای تحویل" />
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
