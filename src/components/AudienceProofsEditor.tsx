import { useRef, useState } from 'react'
import { getApiErrorMessage } from '../api/client'
import {
  useDeleteAudienceProof,
  useUploadAudienceProofs,
} from '../hooks/useAuth'
import type { AudienceProof } from '../types/api'
import { ConfirmModal } from './ui/ConfirmModal'

export const AUDIENCE_PROOF_MAX_IMAGES = 8

interface AudienceProofsEditorProps {
  proofs: AudienceProof[]
  compact?: boolean
}

export function AudienceProofsEditor({
  proofs,
  compact = false,
}: AudienceProofsEditorProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const upload = useUploadAudienceProofs()
  const remove = useDeleteAudienceProof()
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const remaining = AUDIENCE_PROOF_MAX_IMAGES - proofs.length
  const busy = upload.isPending || remove.isPending

  return (
    <section>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-navy">مدارک مخاطب و آنالیتیکس</p>
          <p className="mt-1 text-xs leading-6 text-muted">
            اسکرین‌شات اینسایت اینستاگرام، ترکیب سنی و جنسیتی، شهر مخاطب یا هر مدرکی
            که صاحب کسب‌وکار را قانع کند پیشنهادتان را بپذیرد.
            {compact ? ' اختیاری.' : ` تا ${AUDIENCE_PROOF_MAX_IMAGES} تصویر · JPEG، PNG یا WebP.`}
          </p>
        </div>
        {remaining > 0 ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            className="shrink-0 rounded-xl border border-border bg-surface-elevated px-3 py-2 text-xs font-bold text-navy transition hover:border-purple/40 hover:bg-surface disabled:opacity-50"
          >
            {upload.isPending ? 'آپلود…' : 'افزودن تصویر'}
          </button>
        ) : null}
      </div>

      {proofs.length === 0 ? (
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className={`flex w-full flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface text-center text-muted transition hover:border-purple/50 hover:bg-purple-soft/20 hover:text-navy ${
            compact ? 'gap-1.5 px-3 py-6' : 'gap-2 px-4 py-8'
          }`}
        >
          <span className={`font-bold text-navy ${compact ? 'text-xs' : 'text-sm'}`}>
            آپلود اسکرین‌شات آنالیتیکس
          </span>
          <span className="text-[11px] leading-5">
            JPEG، PNG یا WebP · حداکثر ۵ مگابایت · تا {AUDIENCE_PROOF_MAX_IMAGES} تصویر
          </span>
        </button>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {proofs.map((img) => (
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
                onClick={() => setPendingDeleteId(img.id)}
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

      <ConfirmModal
        open={pendingDeleteId != null}
        title="حذف تصویر؟"
        description="این مدرک از پروفایل شما حذف می‌شود و دیگر به صاحب کسب‌وکار نشان داده نمی‌شود."
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
