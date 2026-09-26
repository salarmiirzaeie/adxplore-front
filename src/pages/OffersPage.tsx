import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Avatar } from '../components/ui/Avatar'
import { useMe } from '../hooks/useAuth'
import { useDeals } from '../hooks/useDeals'
import { useOffers } from '../hooks/useOffers'
import {
  deliverablesLabel,
  offerPipelineLabel,
} from '../lib/brand-options'
import { isBrandInfluencerDiscoveryEnabled } from '../lib/feature-flags'
import { formatLocation } from '../lib/iran-locations'
import type { Deal, DealStatus, Offer, OfferStatus } from '../types/api'

type StatusFilter = 'ALL' | 'PENDING' | 'IN_PROGRESS' | 'DONE' | 'CLOSED'

const FILTERS: Array<{ value: StatusFilter; label: string }> = [
  { value: 'ALL', label: 'همه' },
  { value: 'PENDING', label: 'در انتظار' },
  { value: 'IN_PROGRESS', label: 'در حال انجام' },
  { value: 'DONE', label: 'تکمیل‌شده' },
  { value: 'CLOSED', label: 'رد / لغو' },
]

function pipelineStatusClass(
  offerStatus: OfferStatus,
  dealStatus?: DealStatus | null,
) {
  if (offerStatus === 'REJECTED' || offerStatus === 'CANCELLED') {
    return 'bg-slate-100 text-slate-600'
  }
  if (offerStatus === 'PENDING') return 'bg-amber-50 text-amber-700'
  if (dealStatus === 'COMPLETED') return 'bg-emerald-50 text-emerald-700'
  if (dealStatus === 'DELIVERED') return 'bg-blue-50 text-blue-700'
  if (dealStatus === 'REVISION_REQUESTED') return 'bg-amber-50 text-amber-700'
  if (dealStatus === 'CANCELLED') return 'bg-slate-100 text-slate-600'
  return 'bg-purple-soft/60 text-purple-deep'
}

function matchesFilter(
  offer: Offer,
  deal: Deal | undefined,
  filter: StatusFilter,
) {
  if (filter === 'ALL') return true
  if (filter === 'PENDING') return offer.status === 'PENDING'
  if (filter === 'CLOSED') {
    return (
      offer.status === 'REJECTED' ||
      offer.status === 'CANCELLED' ||
      (offer.status === 'ACCEPTED' && deal?.status === 'CANCELLED')
    )
  }
  if (offer.status !== 'ACCEPTED') return false
  if (filter === 'DONE') return deal?.status === 'COMPLETED'
  // IN_PROGRESS: accepted and not finished/cancelled
  return deal?.status !== 'COMPLETED' && deal?.status !== 'CANCELLED'
}

function OfferCard({
  offer,
  deal,
  isBrand,
}: {
  offer: Offer
  deal?: Deal
  isBrand: boolean
}) {
  const party = isBrand ? offer.influencer : offer.brand
  const fee = offer.fee.toLocaleString('fa-IR')
  const label = offerPipelineLabel(offer.status, deal?.status)
  const href = `/app/messages/${offer.id}`

  return (
    <Link
      to={href}
      className="flex items-center gap-3 rounded-2xl border border-border bg-surface-elevated px-4 py-4 transition hover:border-purple/25 hover:bg-surface"
    >
      <Avatar src={party.photoUrl} name={party.name} size="md" />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-extrabold text-navy">
              {party.name ?? '—'}
            </p>
            <p className="mt-0.5 truncate text-xs font-semibold text-muted">
              {offer.campaign.title}
            </p>
          </div>
          <span
            className={`shrink-0 rounded-lg px-2 py-1 text-[11px] font-bold ${pipelineStatusClass(offer.status, deal?.status)}`}
          >
            {label}
          </span>
        </div>
        <p className="mt-2 truncate text-xs text-navy-muted">
          پیشنهاد {fee} تومان · {deliverablesLabel(offer.campaign.deliverables, offer.campaign.deliverable)} ·{' '}
          {formatLocation(offer.campaign.city, offer.campaign.province)}
        </p>
        <p className="mt-1 text-xs font-bold text-purple">باز کردن گفتگو</p>
      </div>
    </Link>
  )
}

export function OffersPage() {
  const { data: user } = useMe()
  const isBrand = user?.role === 'BRAND'
  const [filter, setFilter] = useState<StatusFilter>('ALL')
  const { data: offers, isLoading, isError } = useOffers(
    undefined,
    Boolean(user),
  )
  const { data: deals } = useDeals(undefined, Boolean(user))

  const dealByOfferId = useMemo(() => {
    const map = new Map<string, Deal>()
    for (const deal of deals ?? []) map.set(deal.offerId, deal)
    return map
  }, [deals])

  const filtered = useMemo(() => {
    if (!offers) return []
    return offers.filter((offer) =>
      matchesFilter(offer, dealByOfferId.get(offer.id), filter),
    )
  }, [offers, dealByOfferId, filter])

  if (!user) return null

  return (
    <div>
      <section className="mb-6 sm:mb-8">
        <p className="mb-1 text-sm font-medium text-purple">پیشنهادها</p>
        <h1 className="text-2xl font-extrabold text-navy sm:text-3xl">
          {isBrand ? 'پیشنهادهای دریافتی' : 'پیشنهادهای من'}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {isBrand
            ? 'برای گفتگو و قبول پیشنهاد از منوی پیام‌ها استفاده کنید؛ اینجا فیلتر وضعیت است.'
            : 'برای گفتگو با صاحب کسب و کار از منوی پیام‌ها استفاده کنید؛ اینجا فیلتر وضعیت پیشنهادهاست.'}
        </p>
      </section>

      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setFilter(item.value)}
            className={`shrink-0 rounded-xl px-3 py-2 text-xs font-bold transition ${
              filter === item.value
                ? 'bg-purple text-white'
                : 'bg-surface-elevated text-navy-muted ring-1 ring-border hover:text-navy'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <span className="size-8 animate-spin rounded-full border-2 border-purple border-t-transparent" />
        </div>
      ) : null}

      {isError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          بارگذاری پیشنهادها ناموفق بود.
        </p>
      ) : null}

      {!isLoading && !isError && offers?.length === 0 ? (
        <section className="card-elevated rounded-2xl px-6 py-14 text-center">
          <h2 className="text-lg font-extrabold text-navy">هنوز پیشنهادی نیست</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-7 text-muted">
            {isBrand
              ? isBrandInfluencerDiscoveryEnabled()
                ? 'پس از دعوت بلاگرها، پیشنهادهای آن‌ها اینجا دیده می‌شود.'
                : 'وقتی بلاگرها برای کمپین‌های باز پیشنهاد بفرستند، اینجا دیده می‌شود.'
              : 'از دعوت‌های دریافتی، برای کمپین موردنظر پیشنهاد قیمت بفرستید.'}
          </p>
          <Link
            to="/app/campaigns"
            className="btn-primary mt-6 inline-flex rounded-xl px-5 py-3 text-sm font-bold"
          >
            {isBrand ? 'کمپین‌های من' : 'مشاهده کمپین‌ها'}
          </Link>
        </section>
      ) : null}

      {!isLoading && !isError && offers && offers.length > 0 && filtered.length === 0 ? (
        <section className="card-elevated rounded-2xl px-6 py-10 text-center">
          <p className="text-sm text-muted">پیشنهادی با این وضعیت نیست.</p>
        </section>
      ) : null}

      {filtered.length > 0 ? (
        <div className="flex flex-col gap-3">
          {filtered.map((offer) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              deal={dealByOfferId.get(offer.id)}
              isBrand={Boolean(isBrand)}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}
