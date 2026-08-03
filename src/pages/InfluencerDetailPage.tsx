import { Link, Navigate, useParams } from 'react-router-dom'
import { Avatar } from '../components/ui/Avatar'
import { Button } from '../components/ui/Button'
import { useMe } from '../hooks/useAuth'
import { useInfluencer } from '../hooks/useInfluencers'
import {
  brandCategoryLabel,
  followerRangeLabel,
} from '../lib/brand-options'

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
      <div className="mx-auto max-w-2xl py-16 text-center">
        <p className="text-sm text-red-600">اینفلوئنسر پیدا نشد.</p>
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
    <div className="mx-auto max-w-2xl animate-fade-slide-in">
      <section className="mb-6 sm:mb-8">
        <Link
          to="/app/influencers"
          className="mb-3 inline-block text-sm font-medium text-muted transition hover:text-purple"
        >
          ← بازگشت به اینفلوئنسرها
        </Link>
        <div className="flex items-center gap-4">
          <Avatar src={influencer.photoUrl} name={influencer.name} size="xl" />
          <div>
            <h1 className="text-2xl font-extrabold text-navy sm:text-3xl">
              {influencer.name}
            </h1>
            <p className="mt-2 text-sm font-semibold text-muted" dir="ltr">
              {influencer.website}
            </p>
          </div>
        </div>
      </section>

      <section className="card-elevated mb-5 rounded-2xl px-5 py-2 sm:px-7">
        <div className="border-b border-border py-4">
          <p className="text-xs font-semibold text-muted">دسته‌بندی</p>
          <p className="mt-1.5 text-sm font-bold text-navy">
            {brandCategoryLabel(influencer.category)}
          </p>
        </div>
        <div className="border-b border-border py-4">
          <p className="text-xs font-semibold text-muted">شهر</p>
          <p className="mt-1.5 text-sm font-bold text-navy">{influencer.city}</p>
        </div>
        <div className="py-4">
          <p className="text-xs font-semibold text-muted">بازه فالوور</p>
          <p className="mt-1.5 text-sm font-bold text-navy" dir="ltr">
            {followerRangeLabel(influencer.followerRange)}
          </p>
        </div>
      </section>

      <Button type="button" disabled className="opacity-60">
        ارسال پیشنهاد · به‌زودی
      </Button>
      <p className="mt-3 text-center text-xs text-muted">
        پیشنهاد روی کمپین در مرحله بعد اضافه می‌شود.
      </p>
    </div>
  )
}
