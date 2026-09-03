import { useState } from 'react'
import type { CampaignImage } from '../types/api'

export function CampaignImageGallery({ images }: { images: CampaignImage[] }) {
  const sorted = [...images].sort((a, b) => a.sortOrder - b.sortOrder)
  const [active, setActive] = useState(0)
  if (sorted.length === 0) return null

  const current = sorted[active] ?? sorted[0]

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface-elevated">
      <img
        src={current.url}
        alt=""
        className="h-52 w-full object-cover sm:h-64"
      />
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
    </div>
  )
}
