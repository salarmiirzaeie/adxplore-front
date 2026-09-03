import type { DealContentKind, MessageKind } from '../types/api'

export function MediaPreview({
  kind,
  url,
  alt,
  className,
}: {
  kind?: DealContentKind | MessageKind | null
  url: string | null | undefined
  alt?: string
  className?: string
}) {
  if (!url) return null

  if (kind === 'IMAGE') {
    return (
      <img
        src={url}
        alt={alt ?? ''}
        className={className ?? 'mt-3 max-h-64 w-full rounded-xl object-cover'}
      />
    )
  }

  if (kind === 'VIDEO') {
    return (
      <video
        src={url}
        controls
        playsInline
        className={className ?? 'mt-3 max-h-64 w-full rounded-xl bg-black'}
      />
    )
  }

  if (kind === 'LINK' || !kind) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="mt-3 block truncate text-sm font-bold text-purple hover:underline"
        dir="ltr"
      >
        {url}
      </a>
    )
  }

  return null
}

export function messageSnippet(kind: MessageKind | undefined, body: string) {
  if (kind === 'IMAGE') {
    return body && body !== 'تصویر' ? `تصویر · ${body}` : 'تصویر'
  }
  if (kind === 'VIDEO') {
    return body && body !== 'ویدیو' ? `ویدیو · ${body}` : 'ویدیو'
  }
  if (kind === 'DELIVERABLE') return 'تحویل محتوا'
  return body
}
