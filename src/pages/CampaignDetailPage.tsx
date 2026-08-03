import { Link, Navigate, useParams } from 'react-router-dom'
import { getApiErrorMessage } from '../api/client'
import { CampaignImagesEditor } from '../components/CampaignImagesEditor'
import { Button } from '../components/ui/Button'
import { useMe } from '../hooks/useAuth'
import { useCampaign, useUpdateCampaign } from '../hooks/useCampaigns'
import {
  brandCategoryLabel,
  campaignStatusLabel,
  deliverableLabel,
  formatBudgetRange,
} from '../lib/brand-options'

function DetailRow({ label, value, dir }: { label: string; value: string; dir?: 'ltr' }) {
  return (
    <div className="border-b border-border py-4 last:border-b-0">
      <dt className="text-xs font-semibold text-muted">{label}</dt>
      <dd className="mt-1.5 text-sm font-bold text-navy whitespace-pre-wrap" dir={dir}>
        {value}
      </dd>
    </div>
  )
}

export function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: user } = useMe()
  const { data: campaign, isLoading, isError } = useCampaign(id, user?.role === 'BRAND')
  const update = useUpdateCampaign(id ?? '')

  if (!user) return null
  if (user.role !== 'BRAND') {
    return <Navigate to="/app/campaigns" replace />
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <span className="size-8 animate-spin rounded-full border-2 border-purple border-t-transparent" />
      </div>
    )
  }

  if (isError || !campaign) {
    return (
      <div className="mx-auto max-w-2xl py-16 text-center">
        <p className="text-sm text-red-600">کمپین پیدا نشد.</p>
        <Link to="/app/campaigns" className="mt-4 inline-block text-sm font-semibold text-purple">
          بازگشت به کمپین‌ها
        </Link>
      </div>
    )
  }

  const budget = formatBudgetRange(campaign.budgetMin, campaign.budgetMax) ?? '—'

  return (
    <div className="mx-auto max-w-2xl animate-fade-slide-in">
      <section className="mb-6 sm:mb-8">
        <Link
          to="/app/campaigns"
          className="mb-3 inline-block text-sm font-medium text-muted transition hover:text-purple"
        >
          ← بازگشت به کمپین‌ها
        </Link>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="mb-1 text-sm font-medium text-purple">
              {campaignStatusLabel(campaign.status)}
            </p>
            <h1 className="text-2xl font-extrabold text-navy sm:text-3xl">{campaign.title}</h1>
          </div>
        </div>
      </section>

      <section className="card-elevated mb-4 rounded-2xl px-5 py-2 sm:px-7">
        <dl>
          <DetailRow label="بریف" value={campaign.brief} />
          <DetailRow label="دسته" value={brandCategoryLabel(campaign.category) ?? '—'} />
          <DetailRow label="شهر" value={campaign.city} />
          <DetailRow
            label="نوع محتوا"
            value={deliverableLabel(campaign.deliverable) ?? '—'}
          />
          <DetailRow label="بودجه" value={budget} dir="ltr" />
        </dl>
      </section>

      <div className="mb-4">
        <CampaignImagesEditor
          campaignId={campaign.id}
          images={campaign.images ?? []}
        />
      </div>

      {update.isError ? (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600">
          {getApiErrorMessage(update.error, 'به‌روزرسانی کمپین ناموفق بود')}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        {campaign.status === 'DRAFT' ? (
          <Button
            loading={update.isPending}
            onClick={() => update.mutate({ status: 'OPEN' })}
          >
            فعال‌سازی کمپین
          </Button>
        ) : null}
        {campaign.status === 'OPEN' ? (
          <Button
            variant="outline"
            loading={update.isPending}
            onClick={() => update.mutate({ status: 'CLOSED' })}
          >
            بستن کمپین
          </Button>
        ) : null}
        {campaign.status === 'CLOSED' ? (
          <Button
            variant="outline"
            loading={update.isPending}
            onClick={() => update.mutate({ status: 'OPEN' })}
          >
            بازگشایی کمپین
          </Button>
        ) : null}
      </div>
    </div>
  )
}
