import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, Navigate } from 'react-router-dom'
import { getApiErrorMessage } from '../api/client'
import { CampaignFormFields } from '../components/CampaignFormFields'
import { Button } from '../components/ui/Button'
import { ConfirmModal } from '../components/ui/ConfirmModal'
import { useMe } from '../hooks/useAuth'
import { useCreateCampaign } from '../hooks/useCampaigns'
import { normalizeCategories } from '../lib/brand-options'
import {
  campaignFormSchema,
  toCreateCampaignBody,
  type CampaignFormValues,
} from '../lib/campaign-form'
import type { UserProfile } from '../types/api'

const MAX_IMAGES = 8

function CreateCampaignForm({ user }: { user: UserProfile }) {
  const create = useCreateCampaign()
  const inputRef = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<File[]>([])
  const [confirmOpen, setConfirmOpen] = useState(false)

  const previews = useMemo(
    () => files.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [files],
  )

  useEffect(() => {
    return () => {
      for (const preview of previews) URL.revokeObjectURL(preview.url)
    }
  }, [previews])

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    getValues,
    formState: { errors },
  } = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignFormSchema),
    defaultValues: {
      title: '',
      brief: '',
      categories: normalizeCategories(user.categories, user.category),
      province: user.province ?? '',
      city: user.city ?? '',
      deliverables: [],
      budgetMin: '',
      budgetMax: '',
      publish: false,
    },
  })

  const onSubmit = handleSubmit(() => setConfirmOpen(true))

  const remaining = MAX_IMAGES - files.length
  const publish = watch('publish')

  return (
    <div>
      <section className="mb-6 sm:mb-8">
        <Link
          to="/app/campaigns"
          className="mb-3 inline-block text-sm font-medium text-muted transition hover:text-purple"
        >
          ← بازگشت به کمپین‌ها
        </Link>
        <h1 className="text-2xl font-extrabold text-navy sm:text-3xl">ساخت کمپین</h1>
        <p className="mt-2 text-sm text-muted">
          جزئیات کمپین را وارد کنید. می‌توانید به‌صورت پیش‌نویس ذخیره یا فوراً فعال کنید.
        </p>
      </section>

      <section className="card-elevated rounded-2xl px-5 py-6 sm:px-7 sm:py-8">
        <form onSubmit={onSubmit} className="flex flex-col gap-5">
          <CampaignFormFields
            register={register}
            control={control}
            errors={errors}
            watch={watch}
            setValue={setValue}
            afterBrief={
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-navy">تصاویر کمپین</p>
                    <p className="mt-1 text-xs text-muted">
                      اختیاری · تا {MAX_IMAGES} تصویر · JPEG، PNG یا WebP
                    </p>
                  </div>
                  {remaining > 0 ? (
                    <button
                      type="button"
                      onClick={() => inputRef.current?.click()}
                      className="rounded-xl border border-border bg-surface-elevated px-3 py-2 text-xs font-bold text-navy transition hover:border-purple/40 hover:bg-surface"
                    >
                      افزودن تصویر
                    </button>
                  ) : null}
                </div>

                {previews.length === 0 ? (
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="rounded-xl border border-dashed border-border bg-surface px-4 py-8 text-sm font-semibold text-muted transition hover:border-purple/40 hover:text-navy"
                  >
                    برای افزودن تصویر کلیک کنید
                  </button>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {previews.map(({ file, url }, index) => (
                      <div
                        key={`${file.name}-${index}`}
                        className="group relative overflow-hidden rounded-xl border border-border bg-surface"
                      >
                        <img src={url} alt="" className="aspect-square w-full object-cover" />
                        <button
                          type="button"
                          onClick={() =>
                            setFiles((prev) => prev.filter((_, i) => i !== index))
                          }
                          className="absolute left-2 top-2 rounded-lg bg-ink/70 px-2 py-1 text-[10px] font-bold text-white"
                        >
                          حذف
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <input
                  ref={inputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const next = Array.from(e.target.files ?? [])
                    e.target.value = ''
                    if (!next.length) return
                    setFiles((prev) => [...prev, ...next].slice(0, MAX_IMAGES))
                  }}
                />
              </div>
            }
          />

          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3">
            <input
              type="checkbox"
              className="size-4 accent-[var(--purple)]"
              {...register('publish')}
            />
            <span className="text-sm font-semibold text-navy">
              پس از ساخت، کمپین را فعال کن (OPEN)
            </span>
          </label>

          {create.isError ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600">
              {getApiErrorMessage(create.error, 'ساخت کمپین ناموفق بود')}
            </p>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row-reverse">
            <Button type="submit" loading={create.isPending}>
              ذخیره کمپین
            </Button>
            <Link
              to="/app/campaigns"
              className="inline-flex w-full items-center justify-center rounded-xl border border-border px-4 py-3.5 text-sm font-bold text-navy transition hover:bg-surface"
            >
              انصراف
            </Link>
          </div>
        </form>
      </section>

      <ConfirmModal
        open={confirmOpen}
        title="ذخیره کمپین؟"
        description={
          publish
            ? 'کمپین ساخته و فوراً فعال می‌شود تا اینفلوئنسرها آن را ببینند.'
            : 'کمپین به‌صورت پیش‌نویس ذخیره می‌شود و بعداً می‌توانید آن را فعال کنید.'
        }
        confirmLabel="ذخیره کمپین"
        loading={create.isPending}
        error={
          create.isError
            ? getApiErrorMessage(create.error, 'ساخت کمپین ناموفق بود')
            : null
        }
        onConfirm={() =>
          create.mutate({ body: toCreateCampaignBody(getValues()), files })
        }
        onClose={() => {
          if (!create.isPending) setConfirmOpen(false)
        }}
      />
    </div>
  )
}

export function CreateCampaignPage() {
  const { data: user } = useMe()

  if (!user) return null
  if (user.role !== 'BRAND') {
    return <Navigate to="/app/campaigns" replace />
  }

  return <CreateCampaignForm user={user} />
}
