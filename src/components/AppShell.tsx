import { useState, type ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { Logo } from './brand/Logo'
import { useLogout, useMe } from '../hooks/useAuth'
import { formatPhoneDisplay } from '../lib/phone'

interface AppShellProps {
  children: ReactNode
}

const navItems = [
  {
    to: '/app',
    label: 'داشبورد',
    end: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M4 10.5L12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5z"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    to: '/app/campaigns',
    label: 'کمپین‌ها',
    disabled: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M4 7h16M4 12h10M4 17h14"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    to: '/app/offers',
    label: 'پیشنهادها',
    disabled: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M12 3l2.4 4.9L20 9l-4 3.9.9 5.4L12 15.9 7.1 18.3 8 12.9 4 9l5.6-1.1L12 3z"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    to: '/app/profile',
    label: 'پروفایل',
    disabled: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.75" />
        <path
          d="M5 19.5c1.5-3 4-4.5 7-4.5s5.5 1.5 7 4.5"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
] as const

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-1 flex-col gap-1 px-3" aria-label="منوی پنل">
      {navItems.map((item) =>
        'disabled' in item && item.disabled ? (
          <span
            key={item.to}
            className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400"
            title="به‌زودی"
          >
            <span className="opacity-50">{item.icon}</span>
            <span className="flex-1">{item.label}</span>
            <span className="rounded-md bg-surface px-1.5 py-0.5 text-[10px] font-bold text-muted">
              به‌زودی
            </span>
          </span>
        ) : (
          <NavLink
            key={item.to}
            to={item.to}
            end={'end' in item ? item.end : false}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                isActive
                  ? 'bg-purple-soft/70 text-purple-deep'
                  : 'text-navy-muted hover:bg-surface hover:text-navy'
              }`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ),
      )}
    </nav>
  )
}

function SidebarBody({
  onNavigate,
  showBrand = true,
}: {
  onNavigate?: () => void
  showBrand?: boolean
}) {
  const { data: user } = useMe()
  const logout = useLogout()
  const displayName = user?.name?.trim() || 'کاربر ادکسپلور'

  return (
    <div className="flex h-full flex-col">
      {showBrand ? (
        <div className="border-b border-border px-4 py-5">
          <Logo showEnglish />
        </div>
      ) : null}

      <div className="py-4">
        <SidebarNav onNavigate={onNavigate} />
      </div>

      <div className="mt-auto border-t border-border p-4">
        <div className="mb-3 rounded-xl bg-surface px-3 py-3">
          <p className="truncate text-sm font-bold text-navy">{displayName}</p>
          {user ? (
            <p className="mt-1 text-xs text-muted" dir="ltr">
              {formatPhoneDisplay(user.phone)}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-border px-3 py-2.5 text-sm font-semibold text-navy-muted transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
        >
          خروج از حساب
        </button>
      </div>
    </div>
  )
}

export function AppShell({ children }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { data: user } = useMe()

  return (
    <div className="flex min-h-dvh bg-surface">
      {/* First flex child sits on the right in RTL */}
      <aside className="sticky top-0 hidden h-dvh w-[var(--sidebar-width)] shrink-0 border-l border-border bg-surface-elevated lg:block">
        <SidebarBody />
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="بستن منو"
            className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 right-0 flex w-[min(18rem,88vw)] flex-col bg-surface-elevated shadow-2xl animate-fade-slide-in">
            <div className="flex items-center justify-between border-b border-border px-4 py-4">
              <Logo showEnglish={false} />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-2 py-1 text-sm font-medium text-muted hover:bg-surface"
              >
                بستن
              </button>
            </div>
            <SidebarBody showBrand={false} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b border-border bg-surface-elevated/90 px-4 backdrop-blur-xl sm:h-16 sm:px-6">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-semibold text-navy lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="باز کردن منو"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M4 7h16M4 12h16M4 17h16"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            </svg>
            منو
          </button>

          <div className="lg:hidden">
            <Logo variant="icon" className="h-8 w-8" />
          </div>

          <div className="ms-auto hidden text-left sm:block">
            <p className="text-sm font-bold text-navy">{user?.name || '…'}</p>
            {user ? (
              <p className="text-xs text-muted" dir="ltr">
                {formatPhoneDisplay(user.phone)}
              </p>
            ) : null}
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">{children}</main>
      </div>
    </div>
  )
}
