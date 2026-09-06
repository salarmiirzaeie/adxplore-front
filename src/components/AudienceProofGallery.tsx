import { useState } from 'react'
import type { AudienceProof } from '../types/api'

export function AudienceProofGallery({
  proofs,
  title = 'آنالیتیکس و مخاطب پیج',
  compact = false,
}: {
  proofs: AudienceProof[] | undefined
  title?: string
  compact?: boolean
}) {
  const sorted = [...(proofs ?? [])].sort((a, b) => a.sortOrder - b.sortOrder)
  const [active, setActive] = useState(0)
  if (sorted.length === 0) return null

  const current = sorted[active] ?? sorted[0]

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-surface-elevated">
      {compact ? null : (
        <div className="border-b border-border px-5 py-3">
          <h2 className="text-sm font-extrabold text-navy">{title}</h2>
          <p className="mt-1 text-xs text-muted">
            اسکرین‌شات اینسایت و مدارکی که بلاگر برای جلب اعتماد صاحب کسب‌وکار آپلود کرده است.
          </p>
        </div>
      )}
      <a href={current.url} target="_blank" rel="noreferrer">
        <img
          src={current.url}
          alt=""
          className={`w-full bg-surface object-contain ${compact ? 'max-h-56' : 'max-h-[28rem]'}`}
        />
      </a>
      {sorted.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto p-3">
          {sorted.map((img, index) => {
            const selected = index === active
            return (
              <button
                key={img.id}
                type="button"
                onClick={() => setActive(index)}
                className={`size-14 shrink-0 overflow-hidden rounded-xl border-2 transition ${
                  selected
                    ? 'border-purple'
                    : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img.url} alt="" className="size-full object-cover" />
              </button>
            )
          })}
        </div>
      ) : null}
    </section>
  )
}
