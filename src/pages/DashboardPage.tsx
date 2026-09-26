import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useMe } from '../hooks/useAuth'
import { useCampaigns } from '../hooks/useCampaigns'
import { useDeals } from '../hooks/useDeals'
import { useInvitations } from '../hooks/useInvitations'
import { useOffers } from '../hooks/useOffers'
import { formatPhoneDisplay } from '../lib/phone'
import { isCampaignAcceptingInvites } from '../lib/brand-options'
import { isBrandInfluencerDiscoveryEnabled } from '../lib/feature-flags'
import { ApprovalWaitBanner } from '../components/ApprovalWaitBanner'

type PipelineItem = {
  label: string
  count: number
  to: string
  hint: string
}

function PipelineCard({ item }: { item: PipelineItem }) {
  const hasItems = item.count > 0
  return (
    <Link
      to={item.to}
      className={`rounded-2xl border px-4 py-4 transition hover:border-purple/30 ${
        hasItems
          ? 'border-purple/20 bg-purple-soft/25'
          : 'border-border bg-surface-elevated'
      }`}
    >
      <p
        className={`text-2xl font-extrabold tabular-nums ${
          hasItems ? 'text-purple-deep' : 'text-navy'
        }`}
      >
        {item.count.toLocaleString('fa-IR')}
      </p>
      <p className="mt-1 text-sm font-extrabold text-navy">{item.label}</p>
      <p className="mt-1 text-xs leading-5 text-muted">{item.hint}</p>
    </Link>
  )
}

function BrandDashboard() {
  const { data: campaigns, isLoading: campaignsLoading } = useCampaigns(true)
  const { data: offers, isLoading: offersLoading } = useOffers(undefined, true)
  const { data: deals, isLoading: dealsLoading } = useDeals(undefined, true)

  const loading = campaignsLoading || offersLoading || dealsLoading

  const items = useMemo<PipelineItem[]>(() => {
    const openCampaigns =
      campaigns?.filter((c) => isCampaignAcceptingInvites(c.status)).length ?? 0
    const pendingOffers =
      offers?.filter((o) => o.status === 'PENDING').length ?? 0
    const inDelivery =
      deals?.filter(
        (d) =>
          d.status === 'IN_PROGRESS' ||
          d.status === 'DELIVERED' ||
          d.status === 'REVISION_REQUESTED',
      ).length ?? 0

    return [
      {
        label: 'کمپین باز',
        count: openCampaigns,
        to: '/app/campaigns',
        hint: isBrandInfluencerDiscoveryEnabled()
          ? 'کمپین‌های فعال برای دعوت و پیشنهاد'
          : 'کمپین‌های فعال برای پیشنهاد بلاگرها',
      },
      {
        label: 'پیشنهاد در انتظار',
        count: pendingOffers,
        to: '/app/messages',
        hint: 'نیاز به قبول یا رد',
      },
      {
        label: 'در حال تحویل',
        count: inDelivery,
        to: '/app/messages',
        hint: 'پیشنهادهای پذیرفته‌شده در جریان',
      },
    ]
  }, [campaigns, offers, deals])

  return (
    <>
      {loading ? (
        <div className="flex justify-center py-16">
          <span className="size-8 animate-spin rounded-full border-2 border-purple border-t-transparent" />
        </div>
      ) : (
        <section className="mb-6 grid gap-3 sm:grid-cols-3">
          {items.map((item) => (
            <PipelineCard key={item.label} item={item} />
          ))}
        </section>
      )}

      <section className="card-elevated rounded-2xl px-5 py-6 sm:px-7">
        <h2 className="text-lg font-extrabold text-navy">اقدام سریع</h2>
        <p className="mt-1 text-sm leading-7 text-muted">
          {isBrandInfluencerDiscoveryEnabled()
            ? 'کمپین بسازید، بلاگر پیدا کنید و در پیام‌ها پیشنهادها را پیگیری کنید.'
            : 'کمپین بسازید و در پیام‌ها پیشنهادهای بلاگرها را پیگیری کنید.'}
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link
            to="/app/campaigns/new"
            className="btn-primary inline-flex justify-center rounded-xl px-5 py-3 text-sm font-bold"
          >
            ساخت کمپین
          </Link>
          {isBrandInfluencerDiscoveryEnabled() ? (
            <Link
              to="/app/influencers"
              className="inline-flex justify-center rounded-xl border border-border px-5 py-3 text-sm font-semibold text-navy transition hover:bg-surface"
            >
              کشف بلاگر
            </Link>
          ) : null}
          <Link
            to="/app/messages"
            className="inline-flex justify-center rounded-xl border border-border px-5 py-3 text-sm font-semibold text-navy transition hover:bg-surface"
          >
            پیام‌ها
          </Link>
        </div>
      </section>
    </>
  )
}

function InfluencerDashboard() {
  const { data: invitations, isLoading: invitesLoading } = useInvitations(
    undefined,
    true,
  )
  const { data: offers, isLoading: offersLoading } = useOffers(undefined, true)
  const { data: deals, isLoading: dealsLoading } = useDeals(undefined, true)

  const loading = invitesLoading || offersLoading || dealsLoading

  const items = useMemo<PipelineItem[]>(() => {
    const pendingInvites =
      invitations?.filter((i) => i.status === 'PENDING').length ?? 0
    const awaitingReply =
      offers?.filter((o) => o.status === 'PENDING').length ?? 0
    const needsDelivery =
      deals?.filter(
        (d) =>
          d.status === 'IN_PROGRESS' || d.status === 'REVISION_REQUESTED',
      ).length ?? 0

    return [
      {
        label: 'دعوت فعال',
        count: pendingInvites,
        to: '/app/invitations',
        hint: 'صاحبان کسب و کاری که شما را دعوت کرده‌اند',
      },
      {
        label: 'در انتظار پاسخ',
        count: awaitingReply,
        to: '/app/messages',
        hint: 'پیشنهادهایی که هنوز جواب نگرفته‌اند',
      },
      {
        label: 'نیاز به تحویل',
        count: needsDelivery,
        to: '/app/messages',
        hint: 'پیشنهادهای پذیرفته‌شده برای ارسال محتوا',
      },
    ]
  }, [invitations, offers, deals])

  return (
    <>
      {loading ? (
        <div className="flex justify-center py-16">
          <span className="size-8 animate-spin rounded-full border-2 border-purple border-t-transparent" />
        </div>
      ) : (
        <section className="mb-6 grid gap-3 sm:grid-cols-3">
          {items.map((item) => (
            <PipelineCard key={item.label} item={item} />
          ))}
        </section>
      )}

      <section className="card-elevated rounded-2xl px-5 py-6 sm:px-7">
        <h2 className="text-lg font-extrabold text-navy">اقدام سریع</h2>
        <p className="mt-1 text-sm leading-7 text-muted">
          کمپین پیدا کنید، پیشنهاد بفرستید و در پیام‌ها گفتگو کنید.
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link
            to="/app/campaigns"
            className="btn-primary inline-flex justify-center rounded-xl px-5 py-3 text-sm font-bold"
          >
            مشاهده کمپین‌ها
          </Link>
          <Link
            to="/app/invitations"
            className="inline-flex justify-center rounded-xl border border-border px-5 py-3 text-sm font-semibold text-navy transition hover:bg-surface"
          >
            دعوت‌ها
          </Link>
          <Link
            to="/app/messages"
            className="inline-flex justify-center rounded-xl border border-border px-5 py-3 text-sm font-semibold text-navy transition hover:bg-surface"
          >
            پیام‌ها
          </Link>
        </div>
      </section>
    </>
  )
}

export function DashboardPage() {
  const { data: user } = useMe()

  if (!user) return null

  const isBrand = user.role === 'BRAND'

  return (
    <div>
      <section className="mb-8">
        <p className="mb-1 text-sm font-medium text-purple">داشبورد</p>
        <h1 className="text-2xl font-extrabold text-navy sm:text-3xl">
          سلام، {user.name}
        </h1>
        <p className="mt-2 text-sm text-muted">
          <span dir="ltr" className="inline-block tabular-nums">
            {formatPhoneDisplay(user.phone)}
          </span>
          <span className="mx-2 text-border">·</span>
          <span>{isBrand ? 'صاحب کسب و کار' : 'بلاگر'}</span>
        </p>
      </section>

      {isBrand ? <BrandDashboard /> : (
        <>
          <ApprovalWaitBanner />
          <InfluencerDashboard />
        </>
      )}
    </div>
  )
}
