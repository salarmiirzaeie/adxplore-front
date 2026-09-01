import { useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Avatar } from '../components/ui/Avatar'
import { IranCitySelect } from '../components/IranCitySelect'
import { useMe } from '../hooks/useAuth'
import { useInfluencers } from '../hooks/useInfluencers'
import {
  BRAND_CATEGORIES,
  FOLLOWER_RANGES,
  brandCategoriesLabel,
  followerRangeLabel,
} from '../lib/brand-options'
import { formatLocation } from '../lib/iran-locations'
import type {
  BrandCategory,
  FollowerRange,
  InfluencerCard,
  ListInfluencersParams,
} from '../types/api'

function InfluencerCardView({ influencer }: { influencer: InfluencerCard }) {
  return (
    <Link
      to={`/app/influencers/${influencer.id}`}
      className="flex h-full flex-col rounded-2xl border border-border bg-surface-elevated p-5 transition hover:border-purple/25 hover:shadow-md"
    >
      <div className="mb-4 flex items-start gap-4">
        <Avatar src={influencer.photoUrl} name={influencer.name} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h2 className="text-base font-extrabold text-navy sm:text-lg">
              {influencer.name}
            </h2>
            <span className="shrink-0 rounded-lg bg-purple-soft/60 px-2.5 py-1 text-[11px] font-bold text-purple-deep">
              {followerRangeLabel(influencer.followerRange)}
            </span>
          </div>
          <p className="mt-1 truncate text-sm text-muted" dir="ltr">
            {influencer.website}
          </p>
        </div>
      </div>
      <div className="mt-auto flex flex-wrap gap-2 text-xs font-semibold text-navy-muted">
        <span className="rounded-lg bg-surface px-2.5 py-1">
          {brandCategoriesLabel(influencer.categories, influencer.category)}
        </span>
        <span className="rounded-lg bg-surface px-2.5 py-1">
          {formatLocation(influencer.city, influencer.province)}
        </span>
      </div>
      <p className="mt-4 text-xs font-bold text-purple">مشاهده پروفایل و دعوت</p>
    </Link>
  )
}

export function InfluencersPage() {
  const { data: user } = useMe()
  const [category, setCategory] = useState<BrandCategory | ''>('')
  const [province, setProvince] = useState('')
  const [city, setCity] = useState('')
  const [followerRange, setFollowerRange] = useState<FollowerRange | ''>('')

  const params = useMemo<ListInfluencersParams>(() => {
    const next: ListInfluencersParams = {}
    if (category) next.category = category
    if (city) next.city = city
    if (province) next.province = province
    if (followerRange) next.followerRange = followerRange
    return next
  }, [category, city, province, followerRange])

  const isBrand = user?.role === 'BRAND'
  const { data: influencers, isLoading, isError, isFetching } = useInfluencers(
    params,
    isBrand,
  )

  if (!user) return null
  if (!isBrand) {
    return <Navigate to="/app" replace />
  }

  const hasFilters = Boolean(category || city || province || followerRange)

  return (
    <>
      <section className="mb-6 sm:mb-8">
        <p className="mb-1 text-sm font-medium text-purple">کشف</p>
        <h1 className="text-2xl font-extrabold text-navy sm:text-3xl">
          اینفلوئنسرها
        </h1>
        <p className="mt-2 text-sm text-muted">
          بر اساس دسته، شهر و بازه فالوور فیلتر کنید و برای کمپین دعوت بفرستید.
        </p>
      </section>

      <section className="mb-6 rounded-2xl border border-border bg-surface-elevated px-4 py-4 sm:px-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-muted">دسته</span>
            <select
              className="input-brand py-2.5 text-sm"
              value={category}
              onChange={(e) => setCategory(e.target.value as BrandCategory | '')}
            >
              <option value="">همه</option>
              {BRAND_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>

          <IranCitySelect
            variant="filter"
            optional
            showLabels
            province={province}
            city={city}
            onChange={({ province: nextProvince, city: nextCity }) => {
              setProvince(nextProvince)
              setCity(nextCity)
            }}
          />

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-muted">فالوور</span>
            <select
              className="input-brand py-2.5 text-sm"
              value={followerRange}
              onChange={(e) =>
                setFollowerRange(e.target.value as FollowerRange | '')
              }
            >
              <option value="">همه</option>
              {FOLLOWER_RANGES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {hasFilters ? (
          <button
            type="button"
            onClick={() => {
              setCategory('')
              setProvince('')
              setCity('')
              setFollowerRange('')
            }}
            className="mt-3 text-xs font-semibold text-purple hover:text-purple-deep"
          >
            پاک کردن فیلترها
          </button>
        ) : null}
      </section>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <span className="size-8 animate-spin rounded-full border-2 border-purple border-t-transparent" />
        </div>
      ) : null}

      {isError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          بارگذاری اینفلوئنسرها ناموفق بود.
        </p>
      ) : null}

      {!isLoading && !isError && influencers?.length === 0 ? (
        <section className="rounded-2xl border border-border bg-surface-elevated px-6 py-14 text-center">
          <h2 className="text-lg font-extrabold text-navy">نتیجه‌ای پیدا نشد</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-muted">
            {hasFilters
              ? 'فیلترها را تغییر دهید یا پاک کنید.'
              : 'هنوز اینفلوئنسر تکمیل‌پروفایلی ثبت نشده است.'}
          </p>
        </section>
      ) : null}

      {influencers && influencers.length > 0 ? (
        <div className={isFetching ? 'opacity-70' : ''}>
          <p className="mb-3 text-xs font-semibold text-muted">
            {influencers.length.toLocaleString('fa-IR')} اینفلوئنسر
          </p>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {influencers.map((influencer) => (
              <InfluencerCardView key={influencer.id} influencer={influencer} />
            ))}
          </div>
        </div>
      ) : null}
    </>
  )
}
