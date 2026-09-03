import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Button } from './Button'

interface ConfirmModalProps {
  open: boolean
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  tone?: 'primary' | 'danger'
  loading?: boolean
  error?: string | null
  onConfirm: () => void
  onClose: () => void
}

export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = 'تأیید',
  cancelLabel = 'انصراف',
  tone = 'primary',
  loading = false,
  error,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  const titleId = useId()
  const descId = useId()
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    if (!open) return

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      e.stopImmediatePropagation()
      if (!loading) onCloseRef.current()
    }

    window.addEventListener('keydown', onKey, true)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey, true)
      document.body.style.overflow = prev
    }
  }, [open, loading])

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-200 flex items-end justify-center p-0 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
    >
      <button
        type="button"
        aria-label="بستن"
        disabled={loading}
        className="absolute inset-0 bg-ink/50 backdrop-blur-[2px] disabled:cursor-not-allowed"
        onClick={() => {
          if (!loading) onClose()
        }}
      />
      <div className="relative z-10 w-full max-w-md rounded-t-3xl border border-border bg-surface-elevated p-5 shadow-2xl animate-fade-slide-in sm:rounded-3xl sm:p-6">
        <h2 id={titleId} className="text-lg font-extrabold text-navy">
          {title}
        </h2>
        {description ? (
          <p id={descId} className="mt-2 text-sm leading-7 text-muted">
            {description}
          </p>
        ) : null}
        {error ? (
          <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        ) : null}
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant={tone}
            loading={loading}
            autoFocus
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={onClose}
          >
            {cancelLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
