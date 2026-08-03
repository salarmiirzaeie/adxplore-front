import { Navigate } from 'react-router-dom'
import { AppShell } from '../components/AppShell'
import { useMe } from '../hooks/useAuth'
import { isProfileComplete } from '../lib/auth-storage'
import { formatPhoneDisplay } from '../lib/phone'

export function DashboardPage() {
  const { data: user, isLoading, isError } = useMe()

  if (isError) {
    return <Navigate to="/login" replace />
  }

  if (!isLoading && user && !isProfileComplete(user)) {
    return <Navigate to="/onboarding" replace />
  }

  return (
    <AppShell>
      {isLoading || !user ? (
        <div className="flex flex-col items-center gap-3 py-24 text-muted">
          <span className="size-8 animate-spin rounded-full border-2 border-purple border-t-transparent" />
          <span className="text-sm">در حال بارگذاری…</span>
        </div>
      ) : (
        <div className="mx-auto max-w-4xl animate-fade-slide-in">
          <section className="mb-8">
            <p className="mb-1 text-sm font-medium text-purple">داشبورد</p>
            <h1 className="text-2xl font-extrabold text-navy sm:text-3xl">
              سلام، {user.name}
            </h1>
            <p className="mt-2 text-sm text-muted" dir="ltr">
              {formatPhoneDisplay(user.phone)}
            </p>
          </section>

          <section className="card-elevated rounded-2xl px-6 py-12 text-center sm:px-10">
            <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-purple-soft text-purple">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M4 7h16M4 12h10M4 17h14"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <h2 className="text-xl font-extrabold text-navy">کمپین‌ها به‌زودی</h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-muted">
              به‌زودی می‌توانید کمپین بسازید، اینفلوئنسر پیدا کنید و پیشنهادها را از همین پنل مدیریت کنید.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                type="button"
                disabled
                className="btn-primary cursor-not-allowed rounded-xl px-5 py-3 text-sm font-bold opacity-50"
              >
                ساخت کمپین
              </button>
              <button
                type="button"
                disabled
                className="cursor-not-allowed rounded-xl border border-border px-5 py-3 text-sm font-semibold text-muted opacity-70"
              >
                پیشنهادها به‌زودی
              </button>
            </div>
          </section>
        </div>
      )}
    </AppShell>
  )
}
