import { useMemo, useRef, useState } from 'react'
import { getApiErrorMessage } from '../api/client'
import {
  useDeleteCampaignImage,
  useReorderCampaignImages,
  useUploadCampaignImages,
} from '../hooks/useCampaigns'
import type { CampaignImage } from '../types/api'
import { ConfirmModal } from './ui/ConfirmModal'
import { FullscreenButton, ImageLightbox } from './ImageLightbox'
import { SortableImageGrid } from './SortableImageGrid'

const MAX_IMAGES = 8

interface CampaignImagesEditorProps {
  campaignId: string
  images: CampaignImage[]
}

export function CampaignImagesEditor({
  campaignId,
  images,
}: CampaignImagesEditorProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const upload = useUploadCampaignImages(campaignId)
  const remove = useDeleteCampaignImage(campaignId)
  const reorder = useReorderCampaignImages(campaignId)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const sorted = useMemo(
    () => [...images].sort((a, b) => a.sortOrder - b.sortOrder),
    [images],
  )
  const remaining = MAX_IMAGES - sorted.length
  const busy = upload.isPending || remove.isPending || reorder.isPending

  return (
    <section className="card-elevated rounded-2xl px-5 py-5 sm:px-7">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-extrabold text-navy">تصاویر کمپین</h2>
          <p className="mt-1 text-xs text-muted">
            تا {MAX_IMAGES} تصویر · JPEG، PNG یا WebP
            {sorted.length > 1 ? ' · برای تغییر ترتیب بکشید؛ در موبایل کمی نگه دارید' : ''}
          </p>
        </div>
        {remaining > 0 ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            className="rounded-xl border border-border bg-surface-elevated px-3 py-2 text-xs font-bold text-navy transition hover:border-purple/40 hover:bg-surface disabled:opacity-50"
          >
            {upload.isPending ? 'آپلود…' : 'افزودن تصویر'}
          </button>
        ) : null}
      </div>

      {sorted.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted">هنوز تصویری اضافه نشده است.</p>
      ) : (
        <SortableImageGrid
          items={sorted}
          getId={(img) => img.id}
          getUrl={(img) => img.url}
          disabled={busy}
          onReorder={(next) => reorder.mutate(next.map((img) => img.id))}
          renderItem={(img, index) => (
            <>
              <img
                src={img.url}
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
                disabled={busy}
                onClick={() => setPendingDeleteId(img.id)}
                className="absolute left-2 top-2 rounded-lg bg-ink/70 px-2 py-1 text-[10px] font-bold text-white opacity-100 transition hover:bg-red-600 sm:opacity-0 sm:group-hover:opacity-100"
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

      {upload.isError || remove.isError || reorder.isError ? (
        <p className="mt-3 text-xs text-red-500">
          {getApiErrorMessage(
            upload.error ?? remove.error ?? reorder.error,
            'عملیات ناموفق بود',
          )}
        </p>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []).slice(0, remaining)
          e.target.value = ''
          if (files.length) upload.mutate(files)
        }}
      />

      <ImageLightbox
        urls={sorted.map((img) => img.url)}
        index={lightboxIndex ?? 0}
        open={lightboxIndex != null}
        onClose={() => setLightboxIndex(null)}
        onIndexChange={setLightboxIndex}
      />

      <ConfirmModal
        open={pendingDeleteId != null}
        title="حذف تصویر؟"
        description="این تصویر از کمپین حذف می‌شود."
        confirmLabel="حذف"
        tone="danger"
        loading={remove.isPending}
        error={
          remove.isError
            ? getApiErrorMessage(remove.error, 'عملیات ناموفق بود')
            : null
        }
        onConfirm={() => {
          if (!pendingDeleteId) return
          remove.mutate(pendingDeleteId, {
            onSuccess: () => setPendingDeleteId(null),
          })
        }}
        onClose={() => {
          if (!remove.isPending) setPendingDeleteId(null)
        }}
      />
    </section>
  )
}
