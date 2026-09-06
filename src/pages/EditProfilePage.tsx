import { Link, useNavigate } from 'react-router-dom'
import {
  BrandProfileForm,
  toBrandProfileFormValues,
} from '../components/BrandProfileForm'
import {
  InfluencerProfileForm,
  toInfluencerProfileFormValues,
} from '../components/InfluencerProfileForm'
import { ProfilePhotoEditor } from '../components/ProfilePhotoEditor'
import { AudienceProofsEditor } from '../components/AudienceProofsEditor'
import { useMe, useUpdateProfile } from '../hooks/useAuth'

export function EditProfilePage() {
  const { data: user } = useMe()
  const navigate = useNavigate()
  const update = useUpdateProfile({ redirectTo: '/app/profile' })

  if (!user) return null

  return (
    <div>
      <section className="mb-6 sm:mb-8">
        <Link
          to="/app/profile"
          className="mb-3 inline-block text-sm font-medium text-muted transition hover:text-purple"
        >
          ← بازگشت به پروفایل
        </Link>
        <h1 className="text-2xl font-extrabold text-navy sm:text-3xl">
          ویرایش پروفایل
        </h1>
        <p className="mt-2 text-sm text-muted">
          {user.role === 'BRAND'
            ? 'اطلاعات صاحب کسب و کار را به‌روز کنید. نام، دسته و شهر الزامی هستند.'
            : 'اطلاعات بلاگر را به‌روز کنید. نام، اینستاگرام، معرفی، دسته، شهر و فالوور الزامی هستند.'}
        </p>
      </section>

      <section className="card-elevated mb-4 rounded-2xl px-5 py-5 sm:px-7">
        <ProfilePhotoEditor photoUrl={user.photoUrl} name={user.name} />
      </section>

      {user.role === 'INFLUENCER' ? (
        <section className="card-elevated mb-4 rounded-2xl px-5 py-5 sm:px-7">
          <AudienceProofsEditor proofs={user.audienceProofs ?? []} />
        </section>
      ) : null}

      <section className="card-elevated rounded-2xl px-5 py-6 sm:px-7 sm:py-8">
        {user.role === 'BRAND' ? (
          <BrandProfileForm
            defaults={toBrandProfileFormValues(user)}
            loading={update.isPending}
            error={update.isError ? update.error : undefined}
            onCancel={() => navigate('/app/profile')}
            onSubmit={(body) => update.mutate(body)}
          />
        ) : (
          <InfluencerProfileForm
            defaults={toInfluencerProfileFormValues(user)}
            loading={update.isPending}
            error={update.isError ? update.error : undefined}
            onCancel={() => navigate('/app/profile')}
            onSubmit={(body) => update.mutate(body)}
          />
        )}
      </section>
    </div>
  )
}
