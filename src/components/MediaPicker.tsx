import { useEffect, useRef, useState } from 'react'
import type { DealContentKind } from '../types/api'

const ACCEPT: Record<'IMAGE' | 'VIDEO', string> = {
  IMAGE: 'image/jpeg,image/png,image/webp',
  VIDEO: 'video/mp4,video/webm,video/quicktime',
}

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024)).toLocaleString('fa-IR')} کیلوبایت`
  }
  return `${(bytes / (1024 * 1024)).toLocaleString('fa-IR', {
    maximumFractionDigits: 1,
  })} مگابایت`
}

function ImageIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle cx="8.5" cy="9.5" r="1.4" fill="currentColor" />
      <path
        d="M3 16.5l5.2-4.2a1.5 1.5 0 0 1 1.9 0L16 17M13 14l1.6-1.4a1.5 1.5 0 0 1 2 0L21 16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function VideoIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="3"
        y="6"
        width="13"
        height="12"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M16 10.2l4.2-2.1A1 1 0 0 1 21.5 9v6a1 1 0 0 1-1.3.95L16 13.8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}

interface MediaPickerProps {
  kind: Extract<DealContentKind, 'IMAGE' | 'VIDEO'>
  file: File | null
  onChange: (file: File | null) => void
  compact?: boolean
}

export function MediaPicker({ kind, file, onChange, compact }: MediaPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const isVideo = kind === 'VIDEO'

  useEffect(() => {
    if (!file) {
      setPreview(null)
      return
    }
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const openPicker = () => inputRef.current?.click()

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT[kind]}
        className="hidden"
        onChange={(e) => {
          onChange(e.target.files?.[0] ?? null)
          e.target.value = ''
        }}
      />

      {file && preview ? (
        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          {isVideo ? (
            <video
              src={preview}
              controls
              playsInline
              className={`w-full bg-black object-contain ${compact ? 'max-h-40' : 'max-h-56'}`}
            />
          ) : (
            <img
              src={preview}
              alt=""
              className={`w-full object-cover ${compact ? 'max-h-40' : 'max-h-56'}`}
            />
          )}
          <div className="flex items-center gap-2 px-3 py-2">
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-navy">{file.name}</p>
              <p className="text-[10px] text-muted">{formatSize(file.size)}</p>
            </div>
            <button
              type="button"
              onClick={openPicker}
              className="shrink-0 rounded-lg px-2 py-1 text-[11px] font-bold text-purple hover:bg-purple-soft/40"
            >
              تغییر
            </button>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="shrink-0 rounded-lg px-2 py-1 text-[11px] font-bold text-red-600 hover:bg-red-50"
            >
              حذف
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={openPicker}
          className={`flex w-full flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface text-center text-muted transition hover:border-purple/50 hover:bg-purple-soft/20 hover:text-navy ${
            compact ? 'gap-1.5 px-3 py-5' : 'gap-2 px-4 py-8'
          }`}
        >
          <span className="text-purple">{isVideo ? <VideoIcon /> : <ImageIcon />}</span>
          <span className={`font-bold text-navy ${compact ? 'text-xs' : 'text-sm'}`}>
            {isVideo ? 'انتخاب ویدیو' : 'انتخاب تصویر'}
          </span>
          <span className="text-[11px] leading-5 text-muted">
            {isVideo
              ? 'MP4، WebM یا MOV · حداکثر ۵۰ مگابایت'
              : 'JPEG، PNG یا WebP · حداکثر ۵ مگابایت'}
          </span>
        </button>
      )}
    </div>
  )
}
