import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Navigate, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getApiErrorMessage } from '../api/client'
import { confirmInstagramDmSent, getInstagramApproval } from '../api/users'
import { AuthLayout } from '../components/AuthLayout'
import { Button } from '../components/ui/Button'
import { meQueryKey, useLogout, useMe } from '../hooks/useAuth'
import { getAccessToken, postAuthPath } from '../lib/auth-storage'
import { copyText } from '../lib/clipboard'
import { openInstagram } from '../lib/open-instagram'

const instagramApprovalQueryKey = ['users', 'instagram-approval'] as const

const instagramMark = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
    <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.75" />
    <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.75" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
  </svg>
)

const copyIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
    <rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.75" />
    <path
      d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
      stroke="currentColor"
      strokeWidth="1.75"
    />
  </svg>
)

const checkIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M5 12.5l4.2 4.2L19 7"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export function InstagramApprovalPage() {
  const token = getAccessToken()
  const { data: user, isLoading: userLoading, isError: userError } = useMe(
    Boolean(token),
  )
  const logout = useLogout()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [copied, setCopied] = useState<'message' | 'code' | null>(null)
  const [copyError, setCopyError] = useState(false)

  const approval = useQuery({
    queryKey: instagramApprovalQueryKey,
    queryFn: getInstagramApproval,
    enabled: Boolean(token) && user?.role === 'INFLUENCER',
    refetchInterval: (query) => {
      const data = query.state.data
      if (!data || data.canAccessPanel) return false
      return (data.pollIntervalSeconds || 15) * 1000
    },
  })

  const confirmSent = useMutation({
    mutationFn: confirmInstagramDmSent,
    onSuccess: (data) => {
      queryClient.setQueryData(instagramApprovalQueryKey, data)
      if (user) {
        queryClient.setQueryData(meQueryKey, {
          ...user,
          canAccessPanel: true,
          canSendOffers: false,
          nextScreen: 'PANEL' as const,
          approvalStatus: user.approvalStatus ?? 'PENDING',
        })
      }
      navigate('/app', { replace: true })
    },
  })

  useEffect(() => {
    if (!copied) return
    const t = window.setTimeout(() => setCopied(null), 2000)
    return () => window.clearTimeout(t)
  }, [copied])

  if (!token) {
    return <Navigate to="/login" replace />
  }

  if (userError) {
    return <Navigate to="/login" replace />
  }

  if (!userLoading && user) {
    if (postAuthPath(user) === '/onboarding') {
      return <Navigate to="/onboarding" replace />
    }
    if (user.approvalStatus === 'APPROVED') {
      return <Navigate to="/app" replace />
    }
  }

  if (userLoading || !user || approval.isLoading || !approval.data) {
    return (
      <AuthLayout title="تأیید اینستاگرام" subtitle="در حال آماده‌سازی کد تأیید…">
        <div className="flex justify-center py-10">
          <span className="size-8 animate-spin rounded-full border-2 border-purple border-t-transparent" />
        </div>
      </AuthLayout>
    )
  }

  if (approval.isError) {
    return (
      <AuthLayout title="تأیید اینستاگرام" subtitle="نتوانستیم اطلاعات تأیید را بگیریم.">
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600">
          {getApiErrorMessage(approval.error, 'لطفاً دوباره تلاش کنید')}
        </p>
        <Button type="button" onClick={() => void approval.refetch()}>
          تلاش دوباره
        </Button>
      </AuthLayout>
    )
  }

  const data = approval.data
  const waiting = data.uiStatus === 'WAITING_REVIEW'
  const rejected = data.uiStatus === 'REJECTED'

  async function handleCopy(kind: 'message' | 'code', text: string) {
    const ok = await copyText(text)
    if (!ok) {
      setCopyError(true)
      return
    }
    setCopyError(false)
    setCopied(kind)
  }

  async function handleOpenDm() {
    if (data.dmMessage) {
      await handleCopy('message', data.dmMessage)
    }
    openInstagram(data.actions.openDm)
  }

  return (
    <AuthLayout
      title={data.copy.headline}
      subtitle={data.copy.subtitle}
      step="تأیید اینستاگرام"
      wide
    >
      {rejected ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm leading-6 text-red-600">
          {data.rejectionReason ||
            'درخواست رد شد. دوباره فالو کنید و همان کد را دایرکت بفرستید.'}
        </div>
      ) : null}

      {waiting ? (
        <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm leading-6 text-emerald-700">
          <p className="font-bold">دایرکت شما ثبت شد</p>
          <p className="mt-1">
            می‌توانید وارد پنل شوید و کمپین‌ها را ببینید. ارسال پیشنهاد بعد از
            تأیید ادمین فعال می‌شود.
          </p>
        </div>
      ) : null}

      <ol className="mb-5 flex flex-col gap-3">
        {data.steps.map((step, index) => (
          <li
            key={step.id}
            className={`rounded-xl border px-3.5 py-3 ${
              step.done
                ? 'border-emerald-200 bg-emerald-50/70'
                : 'border-border bg-surface'
            }`}
          >
            <p className="flex items-center gap-2 text-sm font-extrabold text-navy">
              <span
                className={`flex size-6 items-center justify-center rounded-full text-[11px] ${
                  step.done
                    ? 'bg-emerald-700 text-white'
                    : 'bg-purple-soft text-purple-deep'
                }`}
              >
                {step.done ? checkIcon : index + 1}
              </span>
              {step.title}
            </p>
            <p className="mt-1.5 text-xs leading-6 text-muted">{step.body}</p>
          </li>
        ))}
      </ol>

      {data.dmMessage ? (
        <div className="mb-4 rounded-xl border border-border bg-surface px-3.5 py-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-xs font-bold text-muted">پیام دایرکت</p>
            {data.verifyCode ? (
              <button
                type="button"
                dir="ltr"
                onClick={() => void handleCopy('code', data.verifyCode!)}
                className="rounded-lg bg-purple-soft px-2 py-0.5 font-display text-xs font-bold tracking-wide text-purple-deep"
              >
                {copied === 'code' ? 'کپی شد' : data.verifyCode}
              </button>
            ) : null}
          </div>
          <pre
            dir="rtl"
            className="whitespace-pre-wrap text-sm leading-7 text-navy"
          >
            {data.dmMessage}
          </pre>
        </div>
      ) : null}

      {copyError ? (
        <p className="mb-3 text-xs text-red-600">
          کپی انجام نشد. متن را دستی انتخاب و کپی کنید.
        </p>
      ) : null}

      <div className="flex flex-col gap-2.5">
        {data.actions.copyMessage ? (
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              void handleCopy('message', data.actions.copyMessage!.text)
            }
          >
            {copied === 'message' ? (
              <>
                {checkIcon}
                کپی شد
              </>
            ) : (
              <>
                {copyIcon}
                {data.actions.copyMessage.label}
              </>
            )}
          </Button>
        ) : null}

        <Button
          type="button"
          variant="soft"
          onClick={() => openInstagram(data.actions.follow)}
        >
          {instagramMark}
          {data.actions.follow.label}
        </Button>

        <Button type="button" onClick={() => void handleOpenDm()}>
          {instagramMark}
          {data.actions.openDm.label}
        </Button>

        {waiting || data.canAccessPanel ? (
          <Button type="button" onClick={() => navigate('/app', { replace: true })}>
            ورود به پنل
          </Button>
        ) : null}

        {data.actions.confirmSent.enabled ? (
          <Button
            type="button"
            variant="outline"
            loading={confirmSent.isPending}
            onClick={() => confirmSent.mutate()}
          >
            {data.actions.confirmSent.label}
          </Button>
        ) : null}

        {confirmSent.isError ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600">
            {getApiErrorMessage(confirmSent.error, 'ثبت ارسال پیام ناموفق بود')}
          </p>
        ) : null}
      </div>

      <p className="mt-4 text-center text-xs leading-6 text-muted">
        {data.copy.waitingHint}
      </p>

      <button
        type="button"
        onClick={logout}
        className="mt-5 w-full text-center text-sm font-medium text-muted transition hover:text-red-600"
      >
        خروج از حساب
      </button>
    </AuthLayout>
  )
}
