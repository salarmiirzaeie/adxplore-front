import { Link, Navigate, useParams } from 'react-router-dom'
import { Avatar } from '../components/ui/Avatar'
import { useMe, usePublicProfile } from '../hooks/useAuth'
import {
  brandCategoriesLabel,
  brandGoalLabel,
  businessSizeLabel,
  followerRangeLabel,
} from '../lib/brand-options'
import { formatLocation } from '../lib/iran-locations'
import type { PublicProfile } from '../types/api'

function Field({
  label,
  value,
  dir,
}: {
  label: string
  value: string | null | undefined
  dir?: 'ltr' | 'rtl'
}) {
  return (
    <div className="border-b border-border py-4 last:border-b-0">
      <dt className="text-xs font-semibold text-muted">{label}</dt>
      <dd
        className={`mt-1.5 text-sm font-bold text-navy whitespace-pre-wrap ${
          !value ? 'font-medium text-muted' : ''
        }`}
        dir={dir}
      >
        {value || '—'}
      </dd>
    </div>
  )
}

function ProfileBody({ profile }: { profile: PublicProfile }) {
  const isBrand = profile.role === 'BRAND'
  return (
    <dl>
      <Field
        label={isBrand ? 'نام صاحب کسب و کار' : 'نام نمایشی'}
        value={profile.name}
      />
      <Field
        label={isBrand ? 'اینستاگرام / وب‌سایت' : 'اینستاگرام'}
        value={profile.website}
        dir="ltr"
      />
      <Field
        label={isBrand ? 'درباره صاحب کسب و کار' : 'درباره بلاگر'}
        value={profile.bio}
      />
      <Field
        label={isBrand ? 'دسته فعالیت' : 'دسته‌بندی محتوا'}
        value={brandCategoriesLabel(profile.categories, profile.category)}
      />
      <Field
        label="شهر"
        value={formatLocation(profile.city, profile.province)}
      />
      {isBrand ? (
        <>
          <Field label="هدف اصلی" value={brandGoalLabel(profile.goal)} />
          <Field
            label="اندازه کسب‌وکار"
            value={businessSizeLabel(profile.businessSize)}
          />
        </>
      ) : (
        <Field
          label="بازه فالوور"
          value={followerRangeLabel(profile.followerRange)}
        />
      )}
    </dl>
  )
}

export function PublicProfilePage() {
  const { id } = useParams<{ id: string }>()
  const { data: me } = useMe()
  const { data: profile, isLoading, isError } = usePublicProfile(id)

  if (!me) return null
  if (id && me.id === id) {
    return <Navigate to="/app/profile" replace />
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <span className="size-8 animate-spin rounded-full border-2 border-purple border-t-transparent" />
      </div>
    )
  }

  if (isError || !profile) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-red-600">پروفایل پیدا نشد.</p>
        <Link
          to="/app"
          className="mt-4 inline-block text-sm font-semibold text-purple"
        >
          بازگشت
        </Link>
      </div>
    )
  }

  const isBrand = profile.role === 'BRAND'
  const canInvite = me.role === 'BRAND' && profile.role === 'INFLUENCER'

  return (
    <div>
      <section className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-4">
          <Avatar src={profile.photoUrl} name={profile.name} size="lg" />
          <div>
            <p className="mb-1 text-sm font-medium text-purple">
              {isBrand ? 'پروفایل صاحب کسب و کار' : 'پروفایل بلاگر'}
            </p>
            <h1 className="text-2xl font-extrabold text-navy sm:text-3xl">
              {profile.name ?? (isBrand ? 'صاحب کسب و کار' : 'بلاگر')}
            </h1>
            {profile.website ? (
              <p className="mt-2 text-sm font-semibold text-muted" dir="ltr">
                {profile.website}
              </p>
            ) : null}
          </div>
        </div>
        {canInvite ? (
          <Link
            to={`/app/invitations/new?influencerId=${profile.id}`}
            className="btn-primary inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-bold"
          >
            دعوت به کمپین
          </Link>
        ) : null}
      </section>

      <section className="card-elevated rounded-2xl px-5 py-2 sm:px-7">
        <ProfileBody profile={profile} />
      </section>
    </div>
  )
}
