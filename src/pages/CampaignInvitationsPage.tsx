import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { InviteInfluencersModal } from '../components/InviteInfluencersModal'
import { Avatar } from '../components/ui/Avatar'
import { ConfirmModal } from '../components/ui/ConfirmModal'
import { useMe } from '../hooks/useAuth'
import { useCampaign } from '../hooks/useCampaigns'
import {
  useInvitations,
  useUpdateInvitationStatus,
} from '../hooks/useInvitations'
import {
  brandCategoriesLabel,
  followerRangeLabel,
  invitationStatusLabel,
  isCampaignAcceptingInvites,
} from '../lib/brand-options'
import { formatLocation } from '../lib/iran-locations'
import type { Invitation, InvitationStatus } from '../types/api'

function statusClass(status: InvitationStatus) {
  if (status === 'CANCELLED') return 'bg-slate-100 text-slate-600'
  return 'bg-amber-50 text-amber-700'
}

function CancelInvitationButton({ invitationId }: { invitationId: string }) {
  const update = useUpdateInvitationStatus(invitationId)
  const [confirmOpen, setConfirmOpen] = useState(false)
  return (
    <>
      <button
        type="button"
        disabled={update.isPending}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setConfirmOpen(true)
        }}
        className="shrink-0 text-xs font-bold text-red-600 transition hover:underline disabled:opacity-50"
      >
        لغو دعوت
      </button>
      <ConfirmModal
        open={confirmOpen}
        title="لغو دعوت؟"
        description="این دعوت لغو می‌شود و اینفلوئنسر دیگر آن را نمی‌بیند."
        confirmLabel="لغو دعوت"
        tone="danger"
        loading={update.isPending}
        onConfirm={() =>
          update.mutate(
            { status: 'CANCELLED' },
            { onSuccess: () => setConfirmOpen(false) },
          )
        }
        onClose={() => {
          if (!update.isPending) setConfirmOpen(false)
        }}
      />
    </>
  )
}

function InvitationRow({ invitation }: { invitation: Invitation }) {
  const influencer = invitation.influencer

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface-elevated px-4 py-4 sm:px-5">
      <Link
        to={`/app/influencers/${influencer.id}`}
        className="flex min-w-0 flex-1 items-center gap-3"
      >
        <Avatar src={influencer.photoUrl} name={influencer.name} size="md" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-extrabold text-navy">
              {influencer.name ?? '—'}
            </p>
            <span
              className={`shrink-0 rounded-lg px-2 py-1 text-[11px] font-bold ${statusClass(invitation.status)}`}
            >
              {invitationStatusLabel(invitation.status)}
            </span>
          </div>
          <p className="mt-1 truncate text-xs text-muted">
            {brandCategoriesLabel(influencer.categories, influencer.category) ??
              '—'}{' '}
            · {formatLocation(influencer.city, influencer.province) ?? '—'}
            {influencer.followerRange
              ? ` · ${followerRangeLabel(influencer.followerRange)}`
              : ''}
          </p>
        </div>
      </Link>
      {invitation.status === 'PENDING' ? (
        <CancelInvitationButton invitationId={invitation.id} />
      ) : null}
    </div>
  )
}

export function CampaignInvitationsPage() {
  const { id } = useParams<{ id: string }>()
  const { data: user } = useMe()
  const [inviteOpen, setInviteOpen] = useState(false)
  const { data: campaign, isLoading: campaignLoading, isError: campaignError } =
    useCampaign(id, Boolean(id) && user?.role === 'BRAND')
  const { data: invitations, isLoading, isError } = useInvitations(
    id,
    Boolean(id) && user?.role === 'BRAND',
  )

  if (!user) return null
  if (user.role !== 'BRAND') {
    return <Navigate to="/app/campaigns" replace />
  }
  if (!id) return null

  if (campaignLoading || isLoading) {
    return (
      <div className="flex justify-center py-24">
        <span className="size-8 animate-spin rounded-full border-2 border-purple border-t-transparent" />
      </div>
    )
  }

  if (campaignError || !campaign) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-red-600">کمپین پیدا نشد.</p>
        <Link
          to="/app/campaigns"
          className="mt-4 inline-block text-sm font-semibold text-purple"
        >
          بازگشت به کمپین‌ها
        </Link>
      </div>
    )
  }

  return (
    <div>
      <section className="mb-6 sm:mb-8">
        <Link
          to={`/app/campaigns/${campaign.id}`}
          className="mb-3 inline-block text-sm font-medium text-muted transition hover:text-purple"
        >
          ← بازگشت به کمپین
        </Link>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="mb-1 text-sm font-medium text-purple">دعوت‌ها</p>
            <h1 className="text-2xl font-extrabold text-navy sm:text-3xl">
              دعوت‌های این کمپین
            </h1>
            <p className="mt-2 truncate text-sm text-muted">{campaign.title}</p>
          </div>
          {isCampaignAcceptingInvites(campaign.status) ? (
            <button
              type="button"
              onClick={() => setInviteOpen(true)}
              className="btn-primary inline-flex shrink-0 items-center justify-center rounded-xl px-4 py-2.5 text-sm font-bold"
            >
              دعوت جدید
            </button>
          ) : null}
        </div>
      </section>

      {isError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          بارگذاری دعوت‌ها ناموفق بود.
        </p>
      ) : null}

      {!isError && invitations?.length === 0 ? (
        <section className="card-elevated rounded-2xl px-6 py-14 text-center">
          <h2 className="text-lg font-extrabold text-navy">هنوز دعوتی نیست</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-muted">
            اینفلوئنسرهای مناسب را دعوت کنید تا پیشنهاد قیمت بفرستند.
          </p>
          {isCampaignAcceptingInvites(campaign.status) ? (
            <button
              type="button"
              onClick={() => setInviteOpen(true)}
              className="btn-primary mt-6 inline-flex rounded-xl px-5 py-3 text-sm font-bold"
            >
              دعوت اینفلوئنسر
            </button>
          ) : null}
        </section>
      ) : null}

      {invitations && invitations.length > 0 ? (
        <div className="flex flex-col gap-3">
          {invitations.map((invitation) => (
            <InvitationRow key={invitation.id} invitation={invitation} />
          ))}
        </div>
      ) : null}

      <InviteInfluencersModal
        campaignId={campaign.id}
        campaignTitle={campaign.title}
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
      />
    </div>
  )
}
