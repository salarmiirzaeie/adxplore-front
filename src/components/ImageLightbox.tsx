import { useEffect, useId, useRef, type MouseEvent } from 'react'
import { createPortal } from 'react-dom'

function FullscreenIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M8 3H5a2 2 0 0 0-2 2v3" />
      <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
      <path d="M3 16v3a2 2 0 0 0 2 2h3" />
      <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
    </svg>
  )
}

export function FullscreenButton({
  onClick,
  className,
}: {
  onClick: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      aria-label="نمایش تمام‌صفحه"
      className={`absolute z-10 rounded-lg bg-ink/70 p-1.5 text-white transition hover:bg-ink/90 ${className ?? 'left-2 top-2'}`}
      onClick={(e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        e.stopPropagation()
        onClick()
      }}
    >
      <FullscreenIcon className="size-4" />
    </button>
  )
}

export function ImageLightbox({
  urls,
  index = 0,
  open,
  onClose,
  onIndexChange,
}: {
  urls: string[]
  index?: number
  open: boolean
  onClose: () => void
  onIndexChange?: (index: number) => void
}) {
  const titleId = useId()
  const onCloseRef = useRef(onClose)
  const onIndexChangeRef = useRef(onIndexChange)
  const urlsRef = useRef(urls)
  const indexRef = useRef(index)
  onCloseRef.current = onClose
  onIndexChangeRef.current = onIndexChange
  urlsRef.current = urls
  indexRef.current = index

  useEffect(() => {
    if (!open) return

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopImmediatePropagation()
        onCloseRef.current()
        return
      }
      const list = urlsRef.current
      if (list.length < 2) return
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        onIndexChangeRef.current?.((indexRef.current + 1) % list.length)
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        onIndexChangeRef.current?.((indexRef.current - 1 + list.length) % list.length)
      }
    }

    window.addEventListener('keydown', onKey, true)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey, true)
      document.body.style.overflow = prev
    }
  }, [open])

  if (!open || urls.length === 0) return null

  const safeIndex = Math.min(Math.max(index, 0), urls.length - 1)
  const current = urls[safeIndex]
  const hasMany = urls.length > 1 && Boolean(onIndexChange)

  return createPortal(
    <div
      className="fixed inset-0 z-200 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      dir="ltr"
    >
      <button
        type="button"
        aria-label="بستن"
        className="absolute inset-0 bg-ink/85 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <h2 id={titleId} className="sr-only">
        نمایش تصویر
      </h2>
      <button
        type="button"
        aria-label="بستن"
        className="absolute right-4 top-4 z-20 rounded-xl bg-white/10 p-2 text-white transition hover:bg-white/20"
        onClick={onClose}
      >
        <svg
          className="size-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      </button>
      {hasMany ? (
        <button
          type="button"
          aria-label="تصویر قبلی"
          className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20 sm:left-6"
          onClick={() => onIndexChange?.((safeIndex - 1 + urls.length) % urls.length)}
        >
          <svg
            className="size-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
      ) : null}
      <img
        src={current}
        alt=""
        className="relative z-10 max-h-[90dvh] max-w-[min(100%,72rem)] rounded-xl object-contain shadow-2xl"
      />
      {hasMany ? (
        <button
          type="button"
          aria-label="تصویر بعدی"
          className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20 sm:right-6"
          onClick={() => onIndexChange?.((safeIndex + 1) % urls.length)}
        >
          <svg
            className="size-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      ) : null}
    </div>,
    document.body,
  )
}
