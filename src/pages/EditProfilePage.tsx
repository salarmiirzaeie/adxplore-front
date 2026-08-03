import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { getApiErrorMessage } from '../api/client'
import {
  BrandProfileForm,
  toBrandProfileFormValues,
} from '../components/BrandProfileForm'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useMe, useUpdateProfile } from '../hooks/useAuth'

const influencerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'نام حداقل ۲ کاراکتر باشد')
    .max(80, 'نام حداکثر ۸۰ کاراکتر باشد'),
})

type InfluencerValues = z.infer<typeof influencerSchema>

export function EditProfilePage() {
  const { data: user } = useMe()
  const navigate = useNavigate()
  const update = useUpdateProfile({ redirectTo: '/app/profile' })

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<InfluencerValues>({
    resolver: zodResolver(influencerSchema),
    values: { name: user?.name ?? '' },
  })

  if (!user) return null

  const onInfluencerSubmit = handleSubmit((values) => {
    update.mutate({ name: values.name.trim() })
  })

  return (
    <div className="mx-auto max-w-2xl animate-fade-slide-in">
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
            ? 'اطلاعات برند را به‌روز کنید. نام، دسته و شهر الزامی هستند.'
            : 'نام نمایشی خود را ویرایش کنید.'}
        </p>
      </section>

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
          <form onSubmit={onInfluencerSubmit} className="flex max-w-lg flex-col gap-5">
            <Input
              label="نام نمایشی"
              autoComplete="name"
              error={errors.name?.message}
              {...register('name')}
            />

            {update.isError ? (
              <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600">
                {getApiErrorMessage(update.error, 'ذخیره پروفایل ناموفق بود')}
              </p>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row-reverse">
              <Button type="submit" loading={update.isPending} disabled={!isDirty}>
                ذخیره تغییرات
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/app/profile')}
                disabled={update.isPending}
              >
                انصراف
              </Button>
            </div>
          </form>
        )}
      </section>
    </div>
  )
}
