import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Navigate } from 'react-router-dom'
import { z } from 'zod'
import { getApiErrorMessage } from '../api/client'
import { AuthLayout } from '../components/AuthLayout'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useMe, useUpdateProfile } from '../hooks/useAuth'
import { getAccessToken, isProfileComplete } from '../lib/auth-storage'

const schema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'نام حداقل ۲ کاراکتر باشد')
    .max(80, 'نام حداکثر ۸۰ کاراکتر باشد'),
})

type FormValues = z.infer<typeof schema>

export function OnboardingPage() {
  const token = getAccessToken()
  const { data: user, isLoading, isError } = useMe(Boolean(token))
  const update = useUpdateProfile()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: { name: user?.name ?? '' },
  })

  if (!token) {
    return <Navigate to="/login" replace />
  }

  if (!isLoading && user && isProfileComplete(user)) {
    return <Navigate to="/app" replace />
  }

  if (isError) {
    return <Navigate to="/login" replace />
  }

  const onSubmit = handleSubmit((values) => {
    update.mutate({ name: values.name.trim() })
  })

  return (
    <AuthLayout
      title="تکمیل پروفایل"
      subtitle="نام نمایشی خود را وارد کنید تا وارد پنل شوید."
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        <Input
          label="نام"
          autoComplete="name"
          placeholder="مثلاً سارا محمدی یا برند شما"
          error={errors.name?.message}
          {...register('name')}
        />

        <p className="text-xs leading-6 text-muted">
          نقش، دسته‌بندی و شهر به‌زودی از سمت API اضافه می‌شوند.
        </p>

        {update.isError ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600">
            {getApiErrorMessage(update.error, 'ذخیره پروفایل ناموفق بود')}
          </p>
        ) : null}

        <Button type="submit" loading={update.isPending || isLoading}>
          ورود به داشبورد
        </Button>
      </form>
    </AuthLayout>
  )
}
