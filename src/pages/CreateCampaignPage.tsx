import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, Navigate } from 'react-router-dom'
import { getApiErrorMessage } from '../api/client'
import { CampaignFormFields } from '../components/CampaignFormFields'
import { Button } from '../components/ui/Button'
import { ConfirmModal } from '../components/ui/ConfirmModal'
import { FullscreenButton, ImageLightbox } from '../components/ImageLightbox'
import { SortableImageGrid } from '../components/SortableImageGrid'
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

type StagedImage = { id: string; file: File; url: string }

function stageFiles(files: File[]): StagedImage[] {
  return files.map((file) => ({
    id: crypto.randomUUID(),
    file,
    url: URL.createObjectURL(file),
  }))
}

function CreateCampaignForm({ user }: { user: UserProfile }) {
  const create = useCreateCampaign()
  const inputRef = useRef<HTMLInputElement>(null)
  const [images, setImages] = useState<StagedImage[]>([])
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const imagesRef = useRef(images)
  imagesRef.current = images

  useEffect(() => {
    return () => {
      for (const image of imagesRef.current) URL.revokeObjectURL(image.url)
    }
  }, [])

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

  const remaining = MAX_IMAGES - images.length
  const publish = watch('publish')

  const removeImage = (id: string) => {
    setImages((prev) => {
      const next = prev.filter((image) => image.id !== id)
      const removed = prev.find((image) => image.id === id)
      if (removed) URL.revokeObjectURL(removed.url)
      return next
    })
  }

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
                      {images.length > 1 ? ' · برای تغییر ترتیب بکشید؛ در موبایل کمی نگه دارید' : ''}
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

                {images.length === 0 ? (
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="rounded-xl border border-dashed border-border bg-surface px-4 py-8 text-sm font-semibold text-muted transition hover:border-purple/40 hover:text-navy"
                  >
                    برای افزودن تصویر کلیک کنید
                  </button>
                ) : (
                  <SortableImageGrid
                    items={images}
                    getId={(image) => image.id}
                    getUrl={(image) => image.url}
                    onReorder={setImages}
                    renderItem={(image, index) => (
                      <>
                        <img
                          src={image.url}
                          alt=""
                          draggable={false}
                          className="aspect-square w-full object-cover"
                        />
                        <FullscreenButton
                          className="right-2 top-2"
                          onClick={() => setLightboxIndex(index)}
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(image.id)}
                          className="absolute left-2 top-2 rounded-lg bg-ink/70 px-2 py-1 text-[10px] font-bold text-white"
                        >
                          حذف
                        </button>
                        {index === 0 ? (
                          <span className="absolute bottom-2 right-2 rounded-lg bg-ink/70 px-2 py-1 text-[10px] font-bold text-white">
                            کاور
                          </span>
                        ) : null}
                      </>
                    )}
                  />
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
                    setImages((prev) => {
                      const room = MAX_IMAGES - prev.length
                      if (room <= 0) return prev
                      return [...prev, ...stageFiles(next.slice(0, room))]
                    })
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

      <ImageLightbox
        urls={images.map((image) => image.url)}
        index={lightboxIndex ?? 0}
        open={lightboxIndex != null}
        onClose={() => setLightboxIndex(null)}
        onIndexChange={setLightboxIndex}
      />

      <ConfirmModal
        open={confirmOpen}
        title="ذخیره کمپین؟"
        description={
          publish
            ? 'کمپین ساخته و فوراً فعال می‌شود تا بلاگرها آن را ببینند.'
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
          create.mutate({
            body: toCreateCampaignBody(getValues()),
            files: images.map((image) => image.file),
          })
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
