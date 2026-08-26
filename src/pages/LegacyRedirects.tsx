import { Link, Navigate, useParams } from 'react-router-dom'
import { useInvitation } from '../hooks/useInvitations'

/** Old `/app/deals` list → offers pipeline. */
export function DealsListRedirect() {
  return <Navigate to="/app/offers" replace />
}

/** Old `/app/invitations/:id` → campaign detail. */
export function InvitationToCampaignRedirect() {
  const { id } = useParams<{ id: string }>()
  const { data: invitation, isLoading, isError } = useInvitation(id)

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <span className="size-8 animate-spin rounded-full border-2 border-purple border-t-transparent" />
      </div>
    )
  }

  if (isError || !invitation) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-red-600">دعوت پیدا نشد.</p>
        <Link
          to="/app/invitations"
          className="mt-4 inline-block text-sm font-semibold text-purple"
        >
          بازگشت به دعوت‌ها
        </Link>
      </div>
    )
  }

  return <Navigate to={`/app/campaigns/${invitation.campaignId}`} replace />
}
