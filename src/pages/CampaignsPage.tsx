import { useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Avatar } from '../components/ui/Avatar'
import { useMe } from '../hooks/useAuth'
import { useBrowseCampaigns, useCampaigns } from '../hooks/useCampaigns'
import {
  BRAND_CATEGORIES,
  IRAN_CITIES,
  brandCategoriesLabel,
  campaignStatusLabel,
  deliverableLabel,
  formatBudgetRange,
} from '../lib/brand-options'
import type {
  BrandCategory,
  BrowseCampaignsParams,
  Campaign,
  CampaignStatus,
} from '../types/api'

function statusClass(status: CampaignStatus) {
  if (status === 'OPEN') return 'bg-emerald-50 text-emerald-700'
  if (status === 'CLOSED') return 'bg-slate-100 text-slate-600'
  return 'bg-amber-50 text-amber-700'
}

function BrandCampaignCard({ campaign }: { campaign: Campaign }) {
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
            {brandCategoriesLabel(campaign.categories, campaign.category)}
          </span>
          <span className="rounded-lg bg-surface px-2 py-1">{campaign.city}</span>
          <span className="rounded-lg bg-surface px-2 py-1">
            {deliverableLabel(campaign.deliverable)}
          </span>
        </div>
      </div>
    </Link>
  )
}

function MarketplaceCampaignCard({ campaign }: { campaign: Campaign }) {
  const cover = campaign.images?.[0]?.url
  const budget = formatBudgetRange(campaign.budgetMin, campaign.budgetMax)

  return (
    <Link
      to={`/app/campaigns/${campaign.id}`}
      className="card-elevated block overflow-hidden rounded-2xl transition hover:border-purple/30 hover:shadow-md"
    >
      {cover ? (
        <img src={cover} alt="" className="h-36 w-full object-cover" />
      ) : null}
      <div className="px-5 py-5">
        <div className="mb-3 flex items-start gap-3">
          <Avatar
            src={campaign.brand?.photoUrl}
            name={campaign.brand?.name}
            size="sm"
          />
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-extrabold text-navy">{campaign.title}</h2>
            <p className="mt-0.5 text-xs font-semibold text-muted">
              {campaign.brand?.name ?? 'برند'}
            </p>
          </div>
        </div>
        <p className="line-clamp-2 text-sm leading-6 text-muted">{campaign.brief}</p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-navy-muted">
          <span className="rounded-lg bg-surface px-2 py-1">
            {brandCategoriesLabel(campaign.categories, campaign.category)}
          </span>
          <span className="rounded-lg bg-surface px-2 py-1">{campaign.city}</span>
          <span className="rounded-lg bg-surface px-2 py-1">
            {deliverableLabel(campaign.deliverable)}
          </span>
          {budget ? (
            <span className="rounded-lg bg-surface px-2 py-1" dir="ltr">
              {budget}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  )
}

function BrandCampaigns() {
  const { data: campaigns, isLoading, isError } = useCampaigns(true)

  return (
    <div>
      <section className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-sm font-medium text-purple">کمپین‌های من</p>
          <h1 className="text-2xl font-extrabold text-navy sm:text-3xl">
            مدیریت کمپین‌ها
          </h1>
          <p className="mt-2 text-sm text-muted">
            کمپین بسازید، اینفلوئنسر دعوت کنید و پیشنهادها را ببینید.
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
            اولین کمپین را بسازید و اینفلوئنسرهای مناسب را دعوت کنید.
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
        <div className="grid gap-4 sm:grid-cols-2">
          {campaigns.map((c) => (
            <BrandCampaignCard key={c.id} campaign={c} />
          ))}
        </div>
      ) : null}
    </div>
  )
}

function InfluencerCampaigns() {
  const { data: user } = useMe()
  const [category, setCategory] = useState<BrandCategory | ''>('')
  const [city, setCity] = useState('')
  const [q, setQ] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [forMe, setForMe] = useState(false)
  const [invited, setInvited] = useState(false)

  const params = useMemo<BrowseCampaignsParams>(() => {
    const next: BrowseCampaignsParams = {}
    if (category) next.category = category
    if (city) next.city = city
    if (q.trim()) next.q = q.trim()
    if (forMe) next.forMe = true
    if (invited) next.invited = true
    return next
  }, [category, city, q, forMe, invited])

  const { data: campaigns, isLoading, isError, isFetching } = useBrowseCampaigns(
    params,
    true,
  )

  return (
    <div>
      <section className="mb-6 sm:mb-8">
        <p className="mb-1 text-sm font-medium text-purple">کمپین‌ها</p>
        <h1 className="text-2xl font-extrabold text-navy sm:text-3xl">
          کمپین‌های باز
        </h1>
        <p className="mt-2 text-sm text-muted">
          جستجو و فیلتر کنید، سپس پیشنهاد قیمت بفرستید.
        </p>
      </section>

      <section className="card-elevated mb-5 rounded-2xl px-4 py-4 sm:px-5">
        <form
          className="mb-3"
          onSubmit={(e) => {
            e.preventDefault()
            setQ(searchInput)
          }}
        >
          <input
            className="input-brand w-full py-2.5 text-sm"
            placeholder="جستجو در عنوان یا بریف…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </form>
        <div className="grid gap-3 sm:grid-cols-2">
          <select
            className="input-brand py-2.5 text-sm"
            value={category}
            onChange={(e) => setCategory(e.target.value as BrandCategory | '')}
          >
            <option value="">همه دسته‌ها</option>
            {BRAND_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
          <select
            className="input-brand py-2.5 text-sm"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          >
            <option value="">همه شهرها</option>
            {IRAN_CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setForMe((v) => !v)}
            className={`rounded-xl px-3 py-2 text-xs font-bold transition ${
              forMe
                ? 'bg-purple text-white'
                : 'bg-surface text-navy-muted hover:bg-purple-soft/50'
            }`}
          >
            مناسب من
            {user?.category || user?.city ? '' : ' (پروفایل ناقص)'}
          </button>
          <button
            type="button"
            onClick={() => setInvited((v) => !v)}
            className={`rounded-xl px-3 py-2 text-xs font-bold transition ${
              invited
                ? 'bg-purple text-white'
                : 'bg-surface text-navy-muted hover:bg-purple-soft/50'
            }`}
          >
            دعوت‌شده به من
          </button>
          {isFetching && !isLoading ? (
            <span className="self-center text-xs text-muted">در حال به‌روزرسانی…</span>
          ) : null}
        </div>
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
          <h2 className="text-lg font-extrabold text-navy">کمپینی پیدا نشد</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-7 text-muted">
            فیلترها را عوض کنید یا بعداً دوباره سر بزنید.
          </p>
        </section>
      ) : null}

      {campaigns && campaigns.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {campaigns.map((c) => (
            <MarketplaceCampaignCard key={c.id} campaign={c} />
          ))}
        </div>
      ) : null}
    </div>
  )
}

export function CampaignsPage() {
  const { data: user } = useMe()
  if (!user) return null
  if (user.role === 'BRAND') return <BrandCampaigns />
  if (user.role === 'INFLUENCER') return <InfluencerCampaigns />
  return <Navigate to="/app" replace />
}
