import { Link } from 'react-router-dom'
import { useMe } from '../hooks/useAuth'
import { formatPhoneDisplay } from '../lib/phone'

export function DashboardPage() {
  const { data: user } = useMe()

  if (!user) return null

  const isBrand = user.role === 'BRAND'

  return (
    <div className="mx-auto max-w-4xl animate-fade-slide-in">
      <section className="mb-8">
        <p className="mb-1 text-sm font-medium text-purple">داشبورد</p>
        <h1 className="text-2xl font-extrabold text-navy sm:text-3xl">
          سلام، {user.name}
        </h1>
        <p className="mt-2 text-sm text-muted">
          <span dir="ltr" className="inline-block tabular-nums">
            {formatPhoneDisplay(user.phone)}
          </span>
          <span className="mx-2 text-border">·</span>
          <span>{isBrand ? 'برند' : 'اینفلوئنسر'}</span>
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
        <h2 className="text-xl font-extrabold text-navy">
          {isBrand ? 'کمپین‌های شما' : 'پیشنهادها به‌زودی'}
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-muted">
          {isBrand
            ? 'کمپین بسازید، وضعیت آن را مدیریت کنید و به‌زودی به اینفلوئنسرها پیشنهاد دهید.'
            : 'به‌زودی می‌توانید کمپین‌های باز را ببینید و پیشنهاد دریافت کنید.'}
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {isBrand ? (
            <>
              <Link
                to="/app/campaigns/new"
                className="btn-primary inline-flex rounded-xl px-5 py-3 text-sm font-bold"
              >
                ساخت کمپین
              </Link>
              <Link
                to="/app/influencers"
                className="inline-flex rounded-xl border border-border px-5 py-3 text-sm font-semibold text-navy transition hover:bg-surface"
              >
                پیدا کردن اینفلوئنسر
              </Link>
            </>
          ) : (
            <button
              type="button"
              disabled
              className="cursor-not-allowed rounded-xl border border-border px-5 py-3 text-sm font-semibold text-muted opacity-70"
            >
              پیشنهادها به‌زودی
            </button>
          )}
        </div>
      </section>
    </div>
  )
}
