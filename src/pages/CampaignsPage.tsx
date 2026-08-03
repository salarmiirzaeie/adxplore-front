import { Link } from 'react-router-dom'
import { useMe } from '../hooks/useAuth'
import { useCampaigns } from '../hooks/useCampaigns'
import {
  brandCategoryLabel,
  campaignStatusLabel,
  deliverableLabel,
  formatBudgetRange,
} from '../lib/brand-options'
import type { Campaign, CampaignStatus } from '../types/api'

function statusClass(status: CampaignStatus) {
  if (status === 'OPEN') return 'bg-emerald-50 text-emerald-700'
  if (status === 'CLOSED') return 'bg-slate-100 text-slate-600'
  return 'bg-amber-50 text-amber-700'
}

function CampaignCard({ campaign }: { campaign: Campaign }) {
  const cover = campaign.images?.[0]?.url

  return (
    <Link
      to={`/app/campaigns/${campaign.id}`}
      className="card-elevated block overflow-hidden rounded-2xl transition hover:border-purple/30 hover:shadow-md"
    >
      {cover ? (
        <img src={cover} alt="" className="h-36 w-full object-cover" />
      ) : null}
      <div className="px-5 py-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <h2 className="text-base font-extrabold text-navy">{campaign.title}</h2>
          <span
            className={`shrink-0 rounded-lg px-2 py-1 text-[11px] font-bold ${statusClass(campaign.status)}`}
          >
            {campaignStatusLabel(campaign.status)}
          </span>
        </div>
        <p className="line-clamp-2 text-sm leading-6 text-muted">{campaign.brief}</p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-navy-muted">
          <span className="rounded-lg bg-surface px-2 py-1">
            {brandCategoryLabel(campaign.category)}
          </span>
          <span className="rounded-lg bg-surface px-2 py-1">{campaign.city}</span>
          <span className="rounded-lg bg-surface px-2 py-1">
            {deliverableLabel(campaign.deliverable)}
          </span>
          {formatBudgetRange(campaign.budgetMin, campaign.budgetMax) ? (
            <span className="rounded-lg bg-surface px-2 py-1" dir="ltr">
              {formatBudgetRange(campaign.budgetMin, campaign.budgetMax)}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  )
}

export function CampaignsPage() {
  const { data: user } = useMe()
  const isBrand = user?.role === 'BRAND'
  const { data: campaigns, isLoading, isError } = useCampaigns(isBrand)

  if (!user) return null

  if (!isBrand) {
    return (
      <div className="mx-auto max-w-2xl animate-fade-slide-in py-16 text-center">
        <h1 className="text-2xl font-extrabold text-navy">کمپین‌ها</h1>
        <p className="mt-3 text-sm leading-7 text-muted">
          مشاهده و همکاری در کمپین‌ها به‌زودی برای اینفلوئنسرها فعال می‌شود.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl animate-fade-slide-in">
      <section className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-sm font-medium text-purple">کمپین‌ها</p>
          <h1 className="text-2xl font-extrabold text-navy sm:text-3xl">
            کمپین‌های من
          </h1>
          <p className="mt-2 text-sm text-muted">
            کمپین بسازید و بعداً به اینفلوئنسرها پیشنهاد بدهید.
          </p>
        </div>
        <Link
          to="/app/campaigns/new"
          className="btn-primary inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-bold"
        >
          ساخت کمپین
        </Link>
      </section>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <span className="size-8 animate-spin rounded-full border-2 border-purple border-t-transparent" />
        </div>
      ) : null}

      {isError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          بارگذاری کمپین‌ها ناموفق بود.
        </p>
      ) : null}

      {!isLoading && !isError && campaigns?.length === 0 ? (
        <section className="card-elevated rounded-2xl px-6 py-14 text-center">
          <h2 className="text-lg font-extrabold text-navy">هنوز کمپینی ندارید</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-7 text-muted">
            اولین کمپین خود را بسازید تا بتوانید اینفلوئنسر پیدا کنید.
          </p>
          <Link
            to="/app/campaigns/new"
            className="btn-primary mt-6 inline-flex rounded-xl px-5 py-3 text-sm font-bold"
          >
            ساخت کمپین
          </Link>
        </section>
      ) : null}

      {campaigns && campaigns.length > 0 ? (
        <div className="flex flex-col gap-3">
          {campaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      ) : null}
    </div>
  )
}
