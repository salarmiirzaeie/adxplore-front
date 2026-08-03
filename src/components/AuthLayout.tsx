import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Logo } from './brand/Logo'

interface AuthLayoutProps {
  children: ReactNode
  title: string
  subtitle?: ReactNode
  backTo?: string
  backLabel?: string
  step?: string
}

export function AuthLayout({
  children,
  title,
  subtitle,
  backTo,
  backLabel = 'بازگشت',
  step,
}: AuthLayoutProps) {
  return (
    <div className="bg-brand-hero bg-brand-mesh relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-10 sm:px-6">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-purple/20 blur-[100px]"
      />
      <div
        aria-hidden
        className="animate-pulse-glow pointer-events-none absolute -right-16 bottom-8 h-56 w-56 rounded-full bg-purple-deep/30 blur-[80px]"
      />

      <div className="relative z-10 w-full max-w-[420px] animate-fade-slide-in">
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo theme="light" />
          <p className="mt-4 text-sm text-slate-300/80">پنل برند و اینفلوئنسر</p>
        </div>

        <div className="card-glass rounded-2xl p-6 sm:p-8">
          {step ? (
            <p className="mb-3 text-xs font-bold tracking-wide text-purple">{step}</p>
          ) : null}

          <div className="mb-6 flex items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-extrabold text-navy sm:text-2xl">{title}</h1>
              {subtitle ? (
                <p className="mt-2 text-sm leading-7 text-muted">{subtitle}</p>
              ) : null}
            </div>
            {backTo ? (
              <Link
                to={backTo}
                className="shrink-0 rounded-lg px-2 py-1 text-xs font-medium text-muted transition hover:bg-surface hover:text-purple"
              >
                {backLabel}
              </Link>
            ) : null}
          </div>

          {children}
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          با ورود، شرایط استفاده ادکسپلور را می‌پذیرید
        </p>
      </div>
    </div>
  )
}
