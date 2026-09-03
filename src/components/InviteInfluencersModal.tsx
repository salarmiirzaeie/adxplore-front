import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { getApiErrorMessage } from '../api/client'
import { useBulkCreateInvitations } from '../hooks/useInvitations'
import { useInfluencers } from '../hooks/useInfluencers'
import {
  BRAND_CATEGORIES,
  FOLLOWER_RANGES,
  brandCategoriesLabel,
  followerRangeLabel,
} from '../lib/brand-options'
import { formatLocation } from '../lib/iran-locations'
import type {
  BrandCategory,
  FollowerRange,
  ListInfluencersParams,
} from '../types/api'
import { IranCitySelect } from './IranCitySelect'
import { Avatar } from './ui/Avatar'
import { Button } from './ui/Button'
import { ConfirmModal } from './ui/ConfirmModal'

interface InviteInfluencersModalProps {
  campaignId: string
  campaignTitle: string
  open: boolean
  onClose: () => void
}

export function InviteInfluencersModal({
  campaignId,
  campaignTitle,
  open,
  onClose,
}: InviteInfluencersModalProps) {
  const [category, setCategory] = useState<BrandCategory | ''>('')
  const [province, setProvince] = useState('')
  const [city, setCity] = useState('')
  const [followerRange, setFollowerRange] = useState<FollowerRange | ''>('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [confirmOpen, setConfirmOpen] = useState(false)

  const params = useMemo<ListInfluencersParams>(() => {
    const next: ListInfluencersParams = {}
    if (category) next.category = category
    if (city) next.city = city
    if (province) next.province = province
    if (followerRange) next.followerRange = followerRange
    return next
  }, [category, city, province, followerRange])

  const { data: influencers, isLoading, isError } = useInfluencers(params, open)
  const bulk = useBulkCreateInvitations()

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  if (!open) return null

  const close = () => {
    setSelected(new Set())
    setConfirmOpen(false)
    bulk.reset()
    onClose()
  }

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const send = () => {
    bulk.mutate(
      {
        campaignId,
        influencerIds: [...selected],
      },
      {
        onSuccess: () => close(),
      },
    )
  }

  const modal = createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="invite-modal-title"
    >
      <button
        type="button"
        aria-label="بستن"
        className="absolute inset-0 bg-ink/50 backdrop-blur-[2px]"
        onClick={close}
      />
      <div className="relative z-10 flex max-h-[90dvh] w-full max-w-2xl flex-col rounded-t-3xl border border-border bg-surface-elevated shadow-2xl animate-fade-slide-in sm:rounded-3xl">
        <div className="border-b border-border px-5 py-4 sm:px-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-purple">دعوت اینفلوئنسر</p>
              <h2
                id="invite-modal-title"
                className="mt-1 text-lg font-extrabold text-navy"
              >
                {campaignTitle}
              </h2>
              <p className="mt-1 text-xs text-muted">
                افراد را انتخاب کنید و دعوت بفرستید.
              </p>
            </div>
            <button
              type="button"
              onClick={close}
              className="rounded-lg px-2 py-1 text-sm font-medium text-muted hover:bg-surface"
            >
              بستن
            </button>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <select
              className="input-brand py-2 text-sm"
              value={category}
              onChange={(e) => setCategory(e.target.value as BrandCategory | '')}
            >
              <option value="">همه دسته‌ها</option>
              {BRAND_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            <IranCitySelect
              variant="filter"
              optional
              province={province}
              city={city}
              onChange={({ province: nextProvince, city: nextCity }) => {
                setProvince(nextProvince)
                setCity(nextCity)
              }}
            />
            <select
              className="input-brand py-2 text-sm"
              value={followerRange}
              onChange={(e) =>
                setFollowerRange(e.target.value as FollowerRange | '')
              }
            >
              <option value="">همه بازه‌ها</option>
              {FOLLOWER_RANGES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <span className="size-8 animate-spin rounded-full border-2 border-purple border-t-transparent" />
            </div>
          ) : null}
          {isError ? (
            <p className="text-sm text-red-600">بارگذاری اینفلوئنسرها ناموفق بود.</p>
          ) : null}
          {!isLoading && influencers?.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted">
              اینفلوئنسری با این فیلتر پیدا نشد.
            </p>
          ) : null}
          <div className="flex flex-col gap-2">
            {influencers?.map((inf) => {
              const checked = selected.has(inf.id)
              return (
                <button
                  key={inf.id}
                  type="button"
                  onClick={() => toggle(inf.id)}
                  className={`flex items-center gap-3 rounded-xl border px-3 py-3 text-right transition ${
                    checked
                      ? 'border-purple bg-purple-soft/40'
                      : 'border-border hover:border-purple/30'
                  }`}
                >
                  <span
                    className={`flex size-5 shrink-0 items-center justify-center rounded-md border text-xs font-bold ${
                      checked
                        ? 'border-purple bg-purple text-white'
                        : 'border-border text-transparent'
                    }`}
                  >
                    ✓
                  </span>
                  <Avatar src={inf.photoUrl} name={inf.name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-navy">
                      {inf.name}
                    </p>
                    <p className="truncate text-xs text-muted">
                      {brandCategoriesLabel(inf.categories, inf.category)} ·{' '}
                      {formatLocation(inf.city, inf.province)} ·{' '}
                      {followerRangeLabel(inf.followerRange)}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <div className="border-t border-border px-5 py-4 sm:px-6">
          {bulk.isError ? (
            <p className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {getApiErrorMessage(bulk.error, 'ارسال دعوت ناموفق بود')}
            </p>
          ) : null}
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              loading={bulk.isPending}
              disabled={selected.size === 0}
              onClick={() => setConfirmOpen(true)}
            >
              ارسال دعوت ({selected.size.toLocaleString('fa-IR')})
            </Button>
            <Button variant="outline" onClick={close}>
              بعداً
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )

  return (
    <>
      {modal}
      <ConfirmModal
        open={confirmOpen}
        title="ارسال دعوت؟"
        description={`${selected.size.toLocaleString('fa-IR')} اینفلوئنسر به این کمپین دعوت می‌شوند.`}
        confirmLabel="ارسال دعوت"
        loading={bulk.isPending}
        error={
          bulk.isError
            ? getApiErrorMessage(bulk.error, 'ارسال دعوت ناموفق بود')
            : null
        }
        onConfirm={send}
        onClose={() => {
          if (!bulk.isPending) setConfirmOpen(false)
        }}
      />
    </>
  )
}
