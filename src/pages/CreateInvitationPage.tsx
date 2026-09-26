import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { z } from 'zod'
import { getApiErrorMessage } from '../api/client'
import { Avatar } from '../components/ui/Avatar'
import { Button } from '../components/ui/Button'
import { ConfirmModal } from '../components/ui/ConfirmModal'
import { Select } from '../components/ui/Select'
import { Textarea } from '../components/ui/Textarea'
import { useMe } from '../hooks/useAuth'
import { useCampaigns } from '../hooks/useCampaigns'
import { useInfluencer } from '../hooks/useInfluencers'
import { useCreateInvitation } from '../hooks/useInvitations'
import { deliverablesLabel, isCampaignAcceptingInvites } from '../lib/brand-options'
import { isBrandInfluencerDiscoveryEnabled } from '../lib/feature-flags'

const schema = z.object({
  campaignId: z.string().min(1, 'کمپین را انتخاب کنید'),
  message: z.string().trim().max(1000, 'پیام حداکثر ۱۰۰۰ کاراکتر باشد'),
})

type FormValues = z.infer<typeof schema>

export function CreateInvitationPage() {
  const [params] = useSearchParams()
  const influencerId = params.get('influencerId') ?? ''
  const preselectedCampaignId = params.get('campaignId') ?? ''
  const { data: user } = useMe()
  const discoveryEnabled = isBrandInfluencerDiscoveryEnabled()
  const { data: influencer, isLoading: loadingInfluencer } = useInfluencer(
    influencerId || undefined,
    user?.role === 'BRAND' && Boolean(influencerId) && discoveryEnabled,
  )
  const { data: campaigns, isLoading: loadingCampaigns } = useCampaigns(
    user?.role === 'BRAND',
  )
  const create = useCreateInvitation()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const openCampaigns = useMemo(
    () => (campaigns ?? []).filter((c) => isCampaignAcceptingInvites(c.status)),
    [campaigns],
  )

  const {
    register,
    control,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      campaignId: preselectedCampaignId,
      message: '',
    },
  })

  if (!user) return null
  if (!discoveryEnabled) {
    return <Navigate to="/app" replace />
  }
  if (user.role !== 'BRAND') {
    return <Navigate to="/app/invitations" replace />
  }
  if (!influencerId) {
    return <Navigate to="/app/influencers" replace />
  }

  if (loadingInfluencer || loadingCampaigns) {
    return (
      <div className="flex justify-center py-24">
        <span className="size-8 animate-spin rounded-full border-2 border-purple border-t-transparent" />
      </div>
    )
  }

  if (!influencer) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-red-600">بلاگر پیدا نشد.</p>
        <Link
          to="/app/influencers"
          className="mt-4 inline-block text-sm font-semibold text-purple"
        >
          بازگشت به لیست
        </Link>
      </div>
    )
  }

  return (
    <div>
      <section className="mb-6 sm:mb-8">
        <Link
          to={`/app/influencers/${influencer.id}`}
          className="mb-3 inline-block text-sm font-medium text-muted transition hover:text-purple"
        >
          ← بازگشت به پروفایل
        </Link>
        <h1 className="text-2xl font-extrabold text-navy sm:text-3xl">
          دعوت به کمپین
        </h1>
        <div className="mt-4 flex items-center gap-3">
          <Avatar src={influencer.photoUrl} name={influencer.name} size="md" />
          <div>
            <p className="text-sm font-bold text-navy">{influencer.name}</p>
            <p className="text-xs font-semibold text-muted" dir="ltr">
              {influencer.website}
            </p>
          </div>
        </div>
      </section>

      {openCampaigns.length === 0 ? (
        <section className="card-elevated rounded-2xl px-6 py-10 text-center">
          <h2 className="text-lg font-extrabold text-navy">کمپین فعالی ندارید</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-7 text-muted">
            ابتدا یک کمپین بسازید و آن را فعال کنید، بعد بلاگر را دعوت کنید.
          </p>
          <Link
            to="/app/campaigns/new"
            className="btn-primary mt-6 inline-flex rounded-xl px-5 py-3 text-sm font-bold"
          >
            ساخت کمپین
          </Link>
        </section>
      ) : (
        <>
        <form
          className="card-elevated space-y-5 rounded-2xl px-5 py-6 sm:px-7"
          onSubmit={handleSubmit(() => setConfirmOpen(true))}
        >
          <Controller
            name="campaignId"
            control={control}
            render={({ field }) => (
              <Select
                label="کمپین"
                placeholder="انتخاب کمپین فعال"
                options={openCampaigns.map((c) => ({
                  value: c.id,
                  label: `${c.title} · ${deliverablesLabel(c.deliverables, c.deliverable)}`,
                }))}
                error={errors.campaignId?.message}
                {...field}
              />
            )}
          />

          <Textarea
            label="پیام دعوت (اختیاری)"
            rows={4}
            error={errors.message?.message}
            {...register('message')}
          />

          {create.isError ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600">
              {getApiErrorMessage(create.error, 'ارسال دعوت ناموفق بود')}
            </p>
          ) : null}

          <Button type="submit" loading={create.isPending}>
            ارسال دعوت
          </Button>
        </form>

        <ConfirmModal
          open={confirmOpen}
          title="ارسال دعوت؟"
          description={`${influencer.name ?? 'بلاگر'} به کمپین دعوت می‌شود.`}
          confirmLabel="ارسال دعوت"
          loading={create.isPending}
          error={
            create.isError
              ? getApiErrorMessage(create.error, 'ارسال دعوت ناموفق بود')
              : null
          }
          onConfirm={() => {
            const values = getValues()
            create.mutate({
              campaignId: values.campaignId,
              influencerId: influencer.id,
              message: values.message || undefined,
            })
          }}
          onClose={() => {
            if (!create.isPending) setConfirmOpen(false)
          }}
        />
        </>
      )}
    </div>
  )
}
