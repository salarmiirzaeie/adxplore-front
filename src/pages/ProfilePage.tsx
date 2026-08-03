import { Link } from 'react-router-dom'
import { useMe } from '../hooks/useAuth'
import {
  brandCategoryLabel,
  brandGoalLabel,
  businessSizeLabel,
  followerRangeLabel,
} from '../lib/brand-options'
import { formatPhoneDisplay } from '../lib/phone'
import type { UserProfile } from '../types/api'

function ProfileField({
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
        className={`mt-1.5 text-sm font-bold text-navy ${!value ? 'font-medium text-muted' : ''}`}
        dir={dir}
      >
        {value || '—'}
      </dd>
    </div>
  )
}

function BrandProfileView({ user }: { user: UserProfile }) {
  return (
    <dl>
      <ProfileField label="نام برند" value={user.name} />
      <ProfileField
        label="اینستاگرام / وب‌سایت"
        value={user.website}
        dir="ltr"
      />
      <ProfileField label="دسته فعالیت" value={brandCategoryLabel(user.category)} />
      <ProfileField label="شهر" value={user.city} />
      <ProfileField label="هدف اصلی" value={brandGoalLabel(user.goal)} />
      <ProfileField
        label="اندازه کسب‌وکار"
        value={businessSizeLabel(user.businessSize)}
      />
      <ProfileField
        label="شماره موبایل"
        value={formatPhoneDisplay(user.phone)}
        dir="ltr"
      />
    </dl>
  )
}

function InfluencerProfileView({ user }: { user: UserProfile }) {
  return (
    <dl>
      <ProfileField label="نام نمایشی" value={user.name} />
      <ProfileField label="اینستاگرام" value={user.website} dir="ltr" />
      <ProfileField
        label="دسته‌بندی محتوا"
        value={brandCategoryLabel(user.category)}
      />
      <ProfileField label="شهر" value={user.city} />
      <ProfileField
        label="بازه فالوور"
        value={followerRangeLabel(user.followerRange)}
      />
      <ProfileField
        label="شماره موبایل"
        value={formatPhoneDisplay(user.phone)}
        dir="ltr"
      />
    </dl>
  )
}

export function ProfilePage() {
  const { data: user } = useMe()

  if (!user) return null

  const isBrand = user.role === 'BRAND'

  return (
    <div className="mx-auto max-w-2xl animate-fade-slide-in">
      <section className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-sm font-medium text-purple">پروفایل</p>
          <h1 className="text-2xl font-extrabold text-navy sm:text-3xl">
            {isBrand ? 'پروفایل برند' : 'پروفایل اینفلوئنسر'}
          </h1>
          <p className="mt-2 text-sm text-muted">
            {isBrand
              ? 'اطلاعات برند شما برای پیشنهاد اینفلوئنسرها استفاده می‌شود.'
              : 'این اطلاعات برای پیشنهاد کمپین‌های مرتبط استفاده می‌شود.'}
          </p>
        </div>
        <Link
          to="/app/profile/edit"
          className="btn-primary inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-bold"
        >
          ویرایش پروفایل
        </Link>
      </section>

      <section className="card-elevated rounded-2xl px-5 py-2 sm:px-7">
        {isBrand ? (
          <BrandProfileView user={user} />
        ) : (
          <InfluencerProfileView user={user} />
        )}
      </section>
    </div>
  )
}
