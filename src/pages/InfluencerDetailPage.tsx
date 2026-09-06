import { Link, Navigate, useParams } from 'react-router-dom'
import { Avatar } from '../components/ui/Avatar'
import { useMe } from '../hooks/useAuth'
import { useInfluencer } from '../hooks/useInfluencers'
import {
  brandCategoriesLabel,
  followerRangeLabel,
} from '../lib/brand-options'
import { formatLocation } from '../lib/iran-locations'
import { AudienceProofGallery } from '../components/AudienceProofGallery'

function StatCard({ label, value, dir }: { label: string; value: string; dir?: 'ltr' }) {
  return (
    <div className="rounded-2xl border border-border bg-surface-elevated px-5 py-4">
      <p className="text-xs font-semibold text-muted">{label}</p>
      <p className="mt-2 text-base font-extrabold text-navy" dir={dir}>
        {value}
      </p>
    </div>
  )
}

export function InfluencerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: user } = useMe()
  const { data: influencer, isLoading, isError } = useInfluencer(
    id,
    user?.role === 'BRAND',
  )

  if (!user) return null
  if (user.role !== 'BRAND') {
    return <Navigate to="/app" replace />
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <span className="size-8 animate-spin rounded-full border-2 border-purple border-t-transparent" />
      </div>
    )
  }

  if (isError || !influencer) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-red-600">بلاگر پیدا نشد.</p>
        <Link
          to="/app/influencers"
          className="mt-4 inline-block text-sm font-semibold text-purple"
        >
          بازگشت به لیست
        </Link>
      </div>
    )
  }

  return (
    <>
      <Link
        to="/app/influencers"
        className="mb-4 inline-block text-sm font-medium text-muted transition hover:text-purple"
      >
        ← بازگشت به بلاگرها
      </Link>

      <section className="mb-6 rounded-2xl border border-border bg-surface-elevated p-6 sm:p-8">
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
          <Avatar src={influencer.photoUrl} name={influencer.name} size="xl" />
          <div className="min-w-0 flex-1 text-center sm:text-right">
            <h1 className="text-2xl font-extrabold text-navy sm:text-3xl">
              {influencer.name}
            </h1>
            <p className="mt-2 text-sm font-semibold text-muted" dir="ltr">
              {influencer.website}
            </p>
            <p className="mt-3 text-sm text-muted">
              {brandCategoriesLabel(influencer.categories, influencer.category)} ·{' '}
              {formatLocation(influencer.city, influencer.province)}
            </p>
            {influencer.bio ? (
              <p className="mt-4 text-sm leading-7 text-navy whitespace-pre-wrap">
                {influencer.bio}
              </p>
            ) : null}
          </div>
          <span className="shrink-0 rounded-xl bg-purple-soft/60 px-4 py-2 text-sm font-bold text-purple-deep">
            {followerRangeLabel(influencer.followerRange)}
          </span>
        </div>
      </section>

      {influencer.audienceProofs?.length ? (
        <div className="mb-6">
          <AudienceProofGallery proofs={influencer.audienceProofs} />
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard
            label="دسته‌بندی"
            value={brandCategoriesLabel(influencer.categories, influencer.category) ?? '—'}
          />
          <StatCard
            label="شهر"
            value={formatLocation(influencer.city, influencer.province) ?? '—'}
          />
          <StatCard
            label="بازه فالوور"
            value={followerRangeLabel(influencer.followerRange) ?? '—'}
            dir="ltr"
          />
        </div>

        <section className="rounded-2xl border border-border bg-surface-elevated p-6 lg:sticky lg:top-24 lg:self-start">
          <h2 className="text-base font-extrabold text-navy">دعوت به کمپین</h2>
          <p className="mt-2 text-sm leading-7 text-muted">
            یک کمپین فعال انتخاب کنید و برای این بلاگر دعوت بفرستید.
          </p>
          <Link
            to={`/app/invitations/new?influencerId=${influencer.id}`}
            className="btn-primary mt-5 inline-flex w-full items-center justify-center rounded-xl px-4 py-3.5 text-sm font-bold"
          >
            انتخاب کمپین و ارسال دعوت
          </Link>
        </section>
      </div>
    </>
  )
}
