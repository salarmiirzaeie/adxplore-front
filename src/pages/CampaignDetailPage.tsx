import { useEffect, useState } from 'react'
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom'
import { getApiErrorMessage } from '../api/client'
import { CampaignImagesEditor } from '../components/CampaignImagesEditor'
import { InviteInfluencersModal } from '../components/InviteInfluencersModal'
import { Avatar } from '../components/ui/Avatar'
import { Button } from '../components/ui/Button'
import { useMe } from '../hooks/useAuth'
import { useCampaign, useUpdateCampaign } from '../hooks/useCampaigns'
import { useDeals } from '../hooks/useDeals'
import {
  useInvitations,
  useUpdateInvitationStatus,
} from '../hooks/useInvitations'
import { useOffers } from '../hooks/useOffers'
import {
  brandCategoriesLabel,
  campaignStatusLabel,
  deliverableLabel,
  formatBudgetRange,
  invitationStatusLabel,
  offerPipelineLabel,
} from '../lib/brand-options'

function DetailRow({ label, value, dir }: { label: string; value: string; dir?: 'ltr' }) {
  return (
    <div className="border-b border-border py-4 last:border-b-0">
      <dt className="text-xs font-semibold text-muted">{label}</dt>
      <dd className="mt-1.5 text-sm font-bold text-navy whitespace-pre-wrap" dir={dir}>
        {value}
      </dd>
    </div>
  )
}

function CancelInvitationButton({ invitationId }: { invitationId: string }) {
  const update = useUpdateInvitationStatus(invitationId)
  return (
    <button
      type="button"
      disabled={update.isPending}
      onClick={() => update.mutate({ status: 'CANCELLED' })}
      className="shrink-0 text-xs font-bold text-red-600 transition hover:underline disabled:opacity-50"
    >
      لغو
    </button>
  )
}

function BrandCampaignDetail({ id }: { id: string }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [inviteOpen, setInviteOpen] = useState(false)
  const { data: campaign, isLoading, isError } = useCampaign(id, true)
  const update = useUpdateCampaign(id)
  const { data: invitations } = useInvitations(id, true)
  const { data: offers } = useOffers(id, true)
  const { data: deals } = useDeals(id, true)

  useEffect(() => {
    if (searchParams.get('invite') === '1' && campaign?.status === 'OPEN') {
      setInviteOpen(true)
      const next = new URLSearchParams(searchParams)
      next.delete('invite')
      setSearchParams(next, { replace: true })
    }
  }, [campaign?.status, searchParams, setSearchParams])

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <span className="size-8 animate-spin rounded-full border-2 border-purple border-t-transparent" />
      </div>
    )
  }

  if (isError || !campaign) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-red-600">کمپین پیدا نشد.</p>
        <Link to="/app/campaigns" className="mt-4 inline-block text-sm font-semibold text-purple">
          بازگشت به کمپین‌ها
        </Link>
      </div>
    )
  }

  const budget = formatBudgetRange(campaign.budgetMin, campaign.budgetMax) ?? '—'

  return (
    <div>
      <section className="mb-6 sm:mb-8">
        <Link
          to="/app/campaigns"
          className="mb-3 inline-block text-sm font-medium text-muted transition hover:text-purple"
        >
          ← بازگشت به کمپین‌های من
        </Link>
        <p className="mb-1 text-sm font-medium text-purple">
          {campaignStatusLabel(campaign.status)}
        </p>
        <h1 className="text-2xl font-extrabold text-navy sm:text-3xl">{campaign.title}</h1>
      </section>

      <section className="card-elevated mb-4 rounded-2xl px-5 py-2 sm:px-7">
        <dl>
          <DetailRow label="بریف" value={campaign.brief} />
          <DetailRow
            label="دسته"
            value={
              brandCategoriesLabel(campaign.categories, campaign.category) ?? '—'
            }
          />
          <DetailRow label="شهر" value={campaign.city} />
          <DetailRow
            label="نوع محتوا"
            value={deliverableLabel(campaign.deliverable) ?? '—'}
          />
          <DetailRow label="بودجه" value={budget} dir="ltr" />
        </dl>
      </section>

      <div className="mb-4">
        <CampaignImagesEditor
          campaignId={campaign.id}
          images={campaign.images ?? []}
        />
      </div>

      {update.isError ? (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600">
          {getApiErrorMessage(update.error, 'به‌روزرسانی کمپین ناموفق بود')}
        </p>
      ) : null}

      <div className="mb-8 flex flex-col gap-3 sm:flex-row">
        {campaign.status === 'DRAFT' ? (
          <Button
            loading={update.isPending}
            onClick={() =>
              update.mutate(
                { status: 'OPEN' },
                { onSuccess: () => setInviteOpen(true) },
              )
            }
          >
            فعال‌سازی و دعوت
          </Button>
        ) : null}
        {campaign.status === 'OPEN' ? (
          <>
            <Button onClick={() => setInviteOpen(true)}>دعوت اینفلوئنسر</Button>
            <Button
              variant="outline"
              loading={update.isPending}
              onClick={() => update.mutate({ status: 'CLOSED' })}
            >
              بستن کمپین
            </Button>
          </>
        ) : null}
        {campaign.status === 'CLOSED' ? (
          <Button
            variant="outline"
            loading={update.isPending}
            onClick={() => update.mutate({ status: 'OPEN' })}
          >
            بازگشایی کمپین
          </Button>
        ) : null}
      </div>

      <section className="mb-8">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-lg font-extrabold text-navy">دعوت‌ها</h2>
          <span className="text-xs font-semibold text-muted">
            {invitations?.length ?? 0} مورد
          </span>
        </div>
        {invitations && invitations.length > 0 ? (
          <div className="flex flex-col gap-2">
            {invitations.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center gap-3 rounded-xl border border-border bg-surface-elevated px-4 py-3"
              >
                <Avatar
                  src={inv.influencer.photoUrl}
                  name={inv.influencer.name}
                  size="sm"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-navy">
                    {inv.influencer.name ?? '—'}
                  </p>
                  <p className="text-xs text-muted">
                    {invitationStatusLabel(inv.status)}
                  </p>
                </div>
                {inv.status === 'PENDING' ? (
                  <CancelInvitationButton invitationId={inv.id} />
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-xl bg-surface px-4 py-6 text-center text-sm text-muted">
            هنوز کسی را دعوت نکرده‌اید.
          </p>
        )}
      </section>

      <section className="mb-8">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-lg font-extrabold text-navy">پیشنهادها</h2>
          <span className="text-xs font-semibold text-muted">
            {offers?.length ?? 0} مورد
          </span>
        </div>
        {offers && offers.length > 0 ? (
          <div className="flex flex-col gap-2">
            {offers.map((offer) => {
              const deal = deals?.find((d) => d.offerId === offer.id)
              const href = `/app/messages/${offer.id}`
              return (
                <Link
                  key={offer.id}
                  to={href}
                  className="flex items-center gap-3 rounded-xl border border-border bg-white px-4 py-3.5 transition hover:border-purple/25 hover:bg-surface"
                >
                  <Avatar
                    src={offer.influencer.photoUrl}
                    name={offer.influencer.name}
                    size="md"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-extrabold text-navy">
                        {offer.influencer.name ?? '—'}
                      </p>
                      <span className="shrink-0 text-[10px] font-semibold text-muted">
                        {new Date(offer.createdAt).toLocaleDateString('fa-IR', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted">
                      پیشنهاد روی این کمپین ·{' '}
                      {offer.fee.toLocaleString('fa-IR')} تومان
                    </p>
                    <p className="mt-1 text-xs font-bold text-purple">
                      {offerPipelineLabel(offer.status, deal?.status)} · باز کردن گفتگو
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <p className="rounded-xl bg-surface px-4 py-6 text-center text-sm text-muted">
            هنوز پیشنهادی نیامده است.
          </p>
        )}
      </section>

      <InviteInfluencersModal
        campaignId={campaign.id}
        campaignTitle={campaign.title}
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
      />
    </div>
  )
}

function InfluencerCampaignDetail({ id }: { id: string }) {
  const { data: campaign, isLoading, isError } = useCampaign(id, true)
  const { data: invitations } = useInvitations(undefined, true)
  const { data: offers, isLoading: offersLoading } = useOffers(id, true)
  const { data: deals } = useDeals(undefined, true)

  if (isLoading || offersLoading) {
    return (
      <div className="flex justify-center py-24">
        <span className="size-8 animate-spin rounded-full border-2 border-purple border-t-transparent" />
      </div>
    )
  }

  if (isError || !campaign) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-red-600">کمپین پیدا نشد یا فعال نیست.</p>
        <Link to="/app/campaigns" className="mt-4 inline-block text-sm font-semibold text-purple">
          بازگشت به کمپین‌ها
        </Link>
      </div>
    )
  }

  const budget = formatBudgetRange(campaign.budgetMin, campaign.budgetMax) ?? '—'
  const cover = campaign.images?.[0]?.url
  const invite = invitations?.find(
    (i) => i.campaignId === id && i.status === 'PENDING',
  )
  const existingOffer = offers?.[0]
  const relatedDeal = existingOffer
    ? deals?.find((d) => d.offerId === existingOffer.id)
    : undefined
  const offerHref = existingOffer ? `/app/messages/${existingOffer.id}` : null

  return (
    <div>
      <section className="mb-6 sm:mb-8">
        <Link
          to={invite ? '/app/invitations' : '/app/campaigns'}
          className="mb-3 inline-block text-sm font-medium text-muted transition hover:text-purple"
        >
          ← {invite ? 'بازگشت به دعوت‌ها' : 'بازگشت به کمپین‌ها'}
        </Link>
        {existingOffer ? (
          <span className="mb-2 inline-block rounded-lg bg-purple-soft/60 px-2 py-1 text-[11px] font-bold text-purple-deep">
            پیشنهاد ارسال شده ·{' '}
            {offerPipelineLabel(existingOffer.status, relatedDeal?.status)}
          </span>
        ) : invite ? (
          <span className="mb-2 inline-block rounded-lg bg-amber-50 px-2 py-1 text-[11px] font-bold text-amber-700">
            دعوت‌شده
          </span>
        ) : null}
        <h1 className="text-2xl font-extrabold text-navy sm:text-3xl">{campaign.title}</h1>
        <div className="mt-4 flex items-center gap-3">
          <Avatar
            src={campaign.brand?.photoUrl}
            name={campaign.brand?.name}
            size="md"
          />
          <div>
            <p className="text-sm font-bold text-navy">
              {campaign.brand?.name ?? 'برند'}
            </p>
            <p className="text-xs text-muted">
              {brandCategoriesLabel(campaign.categories, campaign.category)} ·{' '}
              {campaign.city}
            </p>
          </div>
        </div>
      </section>

      {cover ? (
        <img
          src={cover}
          alt=""
          className="mb-4 h-48 w-full rounded-2xl object-cover"
        />
      ) : null}

      <section className="card-elevated mb-5 rounded-2xl px-5 py-2 sm:px-7">
        <dl>
          <DetailRow label="بریف" value={campaign.brief} />
          <DetailRow
            label="نوع محتوا"
            value={deliverableLabel(campaign.deliverable) ?? '—'}
          />
          <DetailRow label="بودجه" value={budget} dir="ltr" />
          {invite?.message ? (
            <DetailRow label="پیام دعوت" value={invite.message} />
          ) : null}
        </dl>
      </section>

      {offerHref ? (
        <Link
          to={`/app/messages/${existingOffer!.id}`}
          className="btn-primary inline-flex w-full items-center justify-center rounded-xl px-4 py-3.5 text-sm font-bold"
        >
          باز کردن گفتگو و پیشنهاد
        </Link>
      ) : campaign.status === 'OPEN' ? (
        <Link
          to={`/app/offers/new?campaignId=${campaign.id}`}
          className="btn-primary inline-flex w-full items-center justify-center rounded-xl px-4 py-3.5 text-sm font-bold"
        >
          ارسال پیشنهاد قیمت
        </Link>
      ) : (
        <p className="rounded-xl bg-surface px-4 py-3 text-center text-sm text-muted">
          این کمپین دیگر باز نیست.
        </p>
      )}
    </div>
  )
}

export function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: user } = useMe()

  if (!user || !id) return null
  if (user.role === 'BRAND') return <BrandCampaignDetail id={id} />
  if (user.role === 'INFLUENCER') return <InfluencerCampaignDetail id={id} />
  return <Navigate to="/app" replace />
}
