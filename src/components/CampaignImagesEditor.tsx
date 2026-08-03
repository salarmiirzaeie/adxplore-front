import { useRef } from 'react'
import { getApiErrorMessage } from '../api/client'
import {
  useDeleteCampaignImage,
  useUploadCampaignImages,
} from '../hooks/useCampaigns'
import type { CampaignImage } from '../types/api'

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
  const remaining = MAX_IMAGES - images.length
  const busy = upload.isPending || remove.isPending

  return (
    <section className="card-elevated rounded-2xl px-5 py-5 sm:px-7">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-extrabold text-navy">تصاویر کمپین</h2>
          <p className="mt-1 text-xs text-muted">
            تا {MAX_IMAGES} تصویر · JPEG، PNG یا WebP
          </p>
        </div>
        {remaining > 0 ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            className="rounded-xl border border-border bg-white px-3 py-2 text-xs font-bold text-navy transition hover:border-purple/40 hover:bg-surface disabled:opacity-50"
          >
            {upload.isPending ? 'آپلود…' : 'افزودن تصویر'}
          </button>
        ) : null}
      </div>

      {images.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted">هنوز تصویری اضافه نشده است.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((img) => (
            <div
              key={img.id}
              className="group relative overflow-hidden rounded-xl border border-border bg-surface"
            >
              <img
                src={img.url}
                alt=""
                className="aspect-square w-full object-cover"
              />
              <button
                type="button"
                disabled={busy}
                onClick={() => remove.mutate(img.id)}
                className="absolute left-2 top-2 rounded-lg bg-ink/70 px-2 py-1 text-[10px] font-bold text-white opacity-100 transition hover:bg-red-600 sm:opacity-0 sm:group-hover:opacity-100"
              >
                حذف
              </button>
            </div>
          ))}
        </div>
      )}

      {upload.isError || remove.isError ? (
        <p className="mt-3 text-xs text-red-500">
          {getApiErrorMessage(upload.error ?? remove.error, 'عملیات ناموفق بود')}
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
    </section>
  )
}
