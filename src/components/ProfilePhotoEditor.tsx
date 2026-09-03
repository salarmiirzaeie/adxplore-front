import { useRef, useState } from 'react'
import { getApiErrorMessage } from '../api/client'
import { useDeletePhoto, useUploadPhoto } from '../hooks/useAuth'
import { Avatar } from './ui/Avatar'
import { ConfirmModal } from './ui/ConfirmModal'

interface ProfilePhotoEditorProps {
  photoUrl?: string | null
  name?: string | null
  optional?: boolean
  compact?: boolean
}

export function ProfilePhotoEditor({
  photoUrl,
  name,
  optional = false,
  compact = false,
}: ProfilePhotoEditorProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const upload = useUploadPhoto()
  const remove = useDeletePhoto()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const busy = upload.isPending || remove.isPending

  return (
    <div
      className={`flex flex-col items-center gap-3 ${
        compact ? '' : 'sm:flex-row sm:items-center'
      }`}
    >
      <Avatar src={photoUrl} name={name} size={compact ? 'lg' : 'xl'} />
      <div className={`flex flex-col gap-2 ${compact ? 'items-center text-center' : 'items-center sm:items-start'}`}>
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-navy">عکس پروفایل</p>
          {optional ? <span className="text-xs text-muted">اختیاری</span> : null}
        </div>
        <p className="text-xs text-muted">JPEG، PNG یا WebP · حداکثر ۵ مگابایت</p>
        <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            className="rounded-xl border border-border bg-surface-elevated px-3 py-2 text-xs font-bold text-navy transition hover:border-purple/40 hover:bg-surface disabled:opacity-50"
          >
            {upload.isPending ? 'در حال آپلود…' : photoUrl ? 'تغییر عکس' : 'انتخاب عکس'}
          </button>
          {photoUrl ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => setConfirmOpen(true)}
              className="rounded-xl border border-red-200 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
            >
              حذف
            </button>
          ) : null}
        </div>
        {(upload.isError || remove.isError) && (
          <p className="text-xs text-red-500">
            {getApiErrorMessage(upload.error ?? remove.error, 'آپلود ناموفق بود')}
          </p>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            e.target.value = ''
            if (file) upload.mutate(file)
          }}
        />
      </div>
      <ConfirmModal
        open={confirmOpen}
        title="حذف عکس پروفایل؟"
        description="عکس پروفایل شما حذف می‌شود."
        confirmLabel="حذف"
        tone="danger"
        loading={remove.isPending}
        error={
          remove.isError
            ? getApiErrorMessage(remove.error, 'آپلود ناموفق بود')
            : null
        }
        onConfirm={() =>
          remove.mutate(undefined, { onSuccess: () => setConfirmOpen(false) })
        }
        onClose={() => {
          if (!remove.isPending) setConfirmOpen(false)
        }}
      />
    </div>
  )
}
