import { Link } from 'react-router-dom'
import { useMe } from '../hooks/useAuth'
import { canSendOffers } from '../lib/auth-storage'
import {
  isInfluencerAdminApprovalRequired,
  isInstagramVerificationEnabled,
} from '../lib/feature-flags'

export function ApprovalWaitBanner() {
  const { data: user } = useMe()
  if (!user || user.role !== 'INFLUENCER') return null
  if (!isInfluencerAdminApprovalRequired()) return null
  if (canSendOffers(user)) return null

  return (
    <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3.5 text-sm leading-7 text-amber-800">
      <p className="font-extrabold">منتظر تأیید ادمین</p>
      <p className="mt-1">
        کمپین‌ها را می‌بینید، اما تا تأیید حساب نمی‌توانید پیشنهاد بفرستید.
      </p>
      {isInstagramVerificationEnabled() ? (
        <Link
          to="/instagram-approval"
          className="mt-1 inline-block font-bold text-amber-900 underline decoration-amber-400 underline-offset-4"
        >
          مشاهده کد دایرکت
        </Link>
      ) : null}
    </div>
  )
}
