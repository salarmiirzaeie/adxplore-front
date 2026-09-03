import { useMemo } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { Avatar } from '../components/ui/Avatar'
import { useMe } from '../hooks/useAuth'
import { useCampaign } from '../hooks/useCampaigns'
import { useDeals } from '../hooks/useDeals'
import { useOffers } from '../hooks/useOffers'
import { offerPipelineLabel } from '../lib/brand-options'
import type { Deal, DealStatus, Offer, OfferStatus } from '../types/api'

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

function OfferRow({ offer, deal }: { offer: Offer; deal?: Deal }) {
  const fee = offer.fee.toLocaleString('fa-IR')
  const label = offerPipelineLabel(offer.status, deal?.status)

  return (
    <Link
      to={`/app/messages/${offer.id}`}
      className="flex items-center gap-3 rounded-2xl border border-border bg-surface-elevated px-4 py-4 transition hover:border-purple/25 hover:bg-surface"
    >
      <Avatar
        src={offer.influencer.photoUrl}
        name={offer.influencer.name}
        size="md"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate text-sm font-extrabold text-navy">
            {offer.influencer.name ?? '—'}
          </p>
          <span
            className={`shrink-0 rounded-lg px-2 py-1 text-[11px] font-bold ${pipelineStatusClass(offer.status, deal?.status)}`}
          >
            {label}
          </span>
        </div>
        <p className="mt-1 truncate text-xs text-muted">
          پیشنهاد {fee} تومان
          {offer.deadline
            ? ` · مهلت ${new Date(offer.deadline).toLocaleDateString('fa-IR')}`
            : ''}
        </p>
        <p className="mt-1 text-xs font-bold text-purple">باز کردن گفتگو</p>
      </div>
    </Link>
  )
}

export function CampaignOffersPage() {
  const { id } = useParams<{ id: string }>()
  const { data: user } = useMe()
  const { data: campaign, isLoading: campaignLoading, isError: campaignError } =
    useCampaign(id, Boolean(id) && user?.role === 'BRAND')
  const { data: offers, isLoading, isError } = useOffers(
    id,
    Boolean(id) && user?.role === 'BRAND',
  )
  const { data: deals } = useDeals(id, Boolean(id) && user?.role === 'BRAND')

  const dealByOfferId = useMemo(() => {
    const map = new Map<string, Deal>()
    for (const deal of deals ?? []) map.set(deal.offerId, deal)
    return map
  }, [deals])

  if (!user) return null
  if (user.role !== 'BRAND') {
    return <Navigate to="/app/campaigns" replace />
  }
  if (!id) return null

  if (campaignLoading || isLoading) {
    return (
      <div className="flex justify-center py-24">
        <span className="size-8 animate-spin rounded-full border-2 border-purple border-t-transparent" />
      </div>
    )
  }

  if (campaignError || !campaign) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-red-600">کمپین پیدا نشد.</p>
        <Link
          to="/app/campaigns"
          className="mt-4 inline-block text-sm font-semibold text-purple"
        >
          بازگشت به کمپین‌ها
        </Link>
      </div>
    )
  }

  return (
    <div>
      <section className="mb-6 sm:mb-8">
        <Link
          to={`/app/campaigns/${campaign.id}`}
          className="mb-3 inline-block text-sm font-medium text-muted transition hover:text-purple"
        >
          ← بازگشت به کمپین
        </Link>
        <p className="mb-1 text-sm font-medium text-purple">پیشنهادها</p>
        <h1 className="text-2xl font-extrabold text-navy sm:text-3xl">
          پیشنهادهای این کمپین
        </h1>
        <p className="mt-2 truncate text-sm text-muted">{campaign.title}</p>
      </section>

      {isError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          بارگذاری پیشنهادها ناموفق بود.
        </p>
      ) : null}

      {!isError && offers?.length === 0 ? (
        <section className="card-elevated rounded-2xl px-6 py-14 text-center">
          <h2 className="text-lg font-extrabold text-navy">هنوز پیشنهادی نیست</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-7 text-muted">
            بعد از دعوت اینفلوئنسرها، پیشنهادهای آن‌ها اینجا دیده می‌شود.
          </p>
          <Link
            to={`/app/campaigns/${campaign.id}/invitations`}
            className="btn-primary mt-6 inline-flex rounded-xl px-5 py-3 text-sm font-bold"
          >
            مشاهده دعوت‌ها
          </Link>
        </section>
      ) : null}

      {offers && offers.length > 0 ? (
        <div className="flex flex-col gap-3">
          {offers.map((offer) => (
            <OfferRow
              key={offer.id}
              offer={offer}
              deal={dealByOfferId.get(offer.id)}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}
