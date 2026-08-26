import { Link, Navigate } from 'react-router-dom'
import { Avatar } from '../components/ui/Avatar'
import { useMe } from '../hooks/useAuth'
import { useInvitations } from '../hooks/useInvitations'
import {
  deliverableLabel,
  invitationStatusLabel,
} from '../lib/brand-options'
import type { Invitation, InvitationStatus } from '../types/api'

function statusClass(status: InvitationStatus) {
  if (status === 'CANCELLED') return 'bg-slate-100 text-slate-600'
  return 'bg-amber-50 text-amber-700'
}

function InvitationRow({ invitation }: { invitation: Invitation }) {
  const party = invitation.brand

  return (
    <Link
      to={`/app/campaigns/${invitation.campaignId}`}
      className="flex items-center gap-4 rounded-2xl border border-border bg-white px-5 py-4 transition hover:border-purple/25 hover:bg-surface sm:px-6 sm:py-5"
    >
      <Avatar src={party.photoUrl} name={party.name} size="md" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-base font-extrabold text-navy">
            {party.name ?? '—'}
          </p>
          <span
            className={`shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-bold ${statusClass(invitation.status)}`}
          >
            {invitationStatusLabel(invitation.status)}
          </span>
        </div>
        <p className="mt-1 truncate text-sm font-semibold text-navy/80">
          {invitation.campaign.title}
        </p>
        <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold text-navy-muted">
          <span className="rounded-lg bg-surface px-2.5 py-1">
            {deliverableLabel(invitation.campaign.deliverable)}
          </span>
          <span className="rounded-lg bg-surface px-2.5 py-1">
            {invitation.campaign.city}
          </span>
        </div>
        {invitation.message ? (
          <p className="mt-2 line-clamp-2 text-xs leading-6 text-muted">
            {invitation.message}
          </p>
        ) : null}
      </div>
      <div className="hidden shrink-0 text-left sm:block">
        <p className="text-xs font-bold text-purple">مشاهده کمپین</p>
        <p className="mt-1 text-[10px] text-muted">ارسال پیشنهاد</p>
      </div>
    </Link>
  )
}

export function InvitationsPage() {
  const { data: user } = useMe()
  const { data: invitations, isLoading, isError } = useInvitations(
    undefined,
    user?.role === 'INFLUENCER',
  )

  if (!user) return null
  if (user.role !== 'INFLUENCER') {
    return <Navigate to="/app/campaigns" replace />
  }

  return (
    <>
      <section className="mb-6 sm:mb-8">
        <p className="mb-1 text-sm font-medium text-purple">دعوت‌ها</p>
        <h1 className="text-2xl font-extrabold text-navy sm:text-3xl">
          دعوت‌های دریافتی
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          برندهایی که شما را به کمپین دعوت کرده‌اند — روی هر مورد بزنید، کمپین را
          ببینید و پیشنهاد بفرستید.
        </p>
      </section>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <span className="size-8 animate-spin rounded-full border-2 border-purple border-t-transparent" />
        </div>
      ) : null}

      {isError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          بارگذاری دعوت‌ها ناموفق بود.
        </p>
      ) : null}

      {!isLoading && !isError && invitations?.length === 0 ? (
        <section className="rounded-2xl border border-border bg-white px-6 py-14 text-center">
          <h2 className="text-lg font-extrabold text-navy">هنوز دعوتی نیست</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-muted">
            وقتی برندی شما را دعوت کند اینجا می‌آید. می‌توانید از کمپین‌های باز هم
            پیشنهاد بفرستید.
          </p>
          <Link
            to="/app/campaigns"
            className="btn-primary mt-6 inline-flex rounded-xl px-5 py-3 text-sm font-bold"
          >
            مشاهده کمپین‌ها
          </Link>
        </section>
      ) : null}

      {invitations && invitations.length > 0 ? (
        <div className="flex flex-col gap-3">
          {invitations.map((invitation) => (
            <InvitationRow key={invitation.id} invitation={invitation} />
          ))}
        </div>
      ) : null}
    </>
  )
}
