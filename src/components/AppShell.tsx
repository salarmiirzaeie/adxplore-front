import { type ReactNode, useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Logo } from './brand/Logo'
import { LogoutButton } from './LogoutButton'
import { SupportFab } from './SupportFab'
import { Avatar } from './ui/Avatar'
import { useMe } from '../hooks/useAuth'
import { useUnreadCount } from '../hooks/useNotifications'
import { useTheme } from '../hooks/useTheme'
import { useMyWallet } from '../hooks/useWallets'
import { formatPhoneDisplay } from '../lib/phone'

interface AppShellProps {
  children: ReactNode
}

type NavItem = {
  to: string
  label: string
  tabLabel: string
  end?: boolean
  icon: ReactNode
}

const messagesNavIcon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M6 5h12a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3h-4.5L9 20v-2H6a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3z"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinejoin="round"
    />
    <circle cx="9" cy="11.5" r="1" fill="currentColor" />
    <circle cx="12" cy="11.5" r="1" fill="currentColor" />
    <circle cx="15" cy="11.5" r="1" fill="currentColor" />
  </svg>
)

const invitationsNavIcon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
    <circle cx="9" cy="8" r="3.25" stroke="currentColor" strokeWidth="1.75" />
    <path
      d="M4 19.5c0-2.5 2.5-4.5 5-4.5s5 2 5 4.5"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
    />
    <path
      d="M19 8.5v5M16.5 11h5"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
    />
  </svg>
)

const brandNav: NavItem[] = [
  {
    to: '/app',
    label: 'داشبورد',
    tabLabel: 'داشبورد',
    end: true,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
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
    label: 'کمپین‌های من',
    tabLabel: 'کمپین',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
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
    to: '/app/influencers',
    label: 'بلاگرها',
    tabLabel: 'کشف',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.75" />
        <circle cx="16.5" cy="9.5" r="2.25" stroke="currentColor" strokeWidth="1.75" />
        <path
          d="M3.5 19c1.2-2.8 3.4-4.2 5.5-4.2s4.3 1.4 5.5 4.2"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
        <path
          d="M14 15.2c1.1-.5 2.4-.7 3.7-.2 1.5.6 2.5 1.9 3.1 3.5"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    to: '/app/messages',
    label: 'پیام‌ها',
    tabLabel: 'پیام',
    icon: messagesNavIcon,
  },
  {
    to: '/app/profile',
    label: 'پروفایل',
    tabLabel: 'پروفایل',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
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
]

const influencerNav: NavItem[] = [
  {
    to: '/app',
    label: 'داشبورد',
    tabLabel: 'خانه',
    end: true,
    icon: brandNav[0].icon,
  },
  {
    to: '/app/campaigns',
    label: 'کمپین‌ها',
    tabLabel: 'کمپین',
    icon: brandNav[1].icon,
  },
  {
    to: '/app/invitations',
    label: 'دعوت‌ها',
    tabLabel: 'دعوت',
    icon: invitationsNavIcon,
  },
  {
    to: '/app/messages',
    label: 'پیام‌ها',
    tabLabel: 'پیام',
    icon: messagesNavIcon,
  },
  {
    to: '/app/profile',
    label: 'پروفایل',
    tabLabel: 'پروفایل',
    icon: brandNav[brandNav.length - 1].icon,
  },
]

function useMessagesRoute() {
  const { pathname } = useLocation()
  return pathname.startsWith('/app/messages')
}

function useChatThreadRoute() {
  const { pathname } = useLocation()
  return /^\/app\/messages\/[^/]+$/.test(pathname)
}

function useRoleNav() {
  const { data: user } = useMe()
  return user?.role === 'INFLUENCER' ? influencerNav : brandNav
}

const SIDEBAR_COLLAPSED_KEY = 'adxplore-sidebar-collapsed'

function readSidebarCollapsed() {
  try {
    return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === '1'
  } catch {
    return false
  }
}

function SidebarCollapseToggle({
  collapsed,
  onToggle,
}: {
  collapsed: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-border text-navy-muted transition hover:bg-surface hover:text-navy"
      aria-label={collapsed ? 'باز کردن منو' : 'جمع کردن منو'}
      title={collapsed ? 'باز کردن منو' : 'جمع کردن منو'}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        {collapsed ? (
          <path
            d="M14 6l-6 6 6 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <path
            d="M10 6l6 6-6 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
    </button>
  )
}

function SidebarNav({ collapsed }: { collapsed: boolean }) {
  const items = useRoleNav()

  return (
    <nav
      className={`flex flex-1 flex-col gap-1 ${collapsed ? 'px-2' : 'px-3'}`}
      aria-label="منوی پنل"
    >
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          title={collapsed ? item.label : undefined}
          className={({ isActive }) =>
            `flex items-center rounded-xl text-sm font-semibold transition-colors ${
              collapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2.5'
            } ${
              isActive
                ? 'bg-purple-soft/70 text-purple-deep'
                : 'text-navy-muted hover:bg-surface hover:text-navy'
            }`
          }
        >
          <span className="shrink-0">{item.icon}</span>
          {!collapsed ? <span className="truncate">{item.label}</span> : null}
        </NavLink>
      ))}
    </nav>
  )
}

function MobileTabBar() {
  const items = useRoleNav()

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface-elevated/95 backdrop-blur-xl lg:hidden"
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
      aria-label="منوی اصلی"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-1 pt-1.5">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 text-[10px] font-bold transition-colors ${
                isActive ? 'text-purple' : 'text-navy-muted'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={isActive ? 'text-purple' : 'opacity-80'}>
                  {item.icon}
                </span>
                <span className="truncate">{item.tabLabel}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

function SidebarBody({
  collapsed,
  onToggleCollapse,
}: {
  collapsed: boolean
  onToggleCollapse: () => void
}) {
  const { data: user } = useMe()
  const displayName = user?.name?.trim() || 'کاربر ادکسپلور'

  return (
    <div className="flex h-full flex-col">
      <div
        className={`border-b border-border ${collapsed ? 'px-2 py-3' : 'px-4 py-5'}`}
      >
        <div
          className={`flex items-center ${
            collapsed ? 'flex-col gap-2' : 'justify-between gap-2'
          }`}
        >
          {collapsed ? (
            <Logo variant="icon" className="h-9 w-9" />
          ) : (
            <Logo showEnglish />
          )}
          <SidebarCollapseToggle
            collapsed={collapsed}
            onToggle={onToggleCollapse}
          />
        </div>
      </div>

      <div className="py-4">
        <SidebarNav collapsed={collapsed} />
      </div>

      <div className={`mt-auto border-t border-border ${collapsed ? 'p-2' : 'p-4'}`}>
        <div
          className={`mb-3 rounded-xl bg-surface ${
            collapsed ? 'flex justify-center px-2 py-2' : 'px-3 py-3'
          }`}
          title={collapsed ? displayName : undefined}
        >
          <div
            className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}
          >
            <Avatar src={user?.photoUrl} name={displayName} size="sm" />
            {!collapsed ? (
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-navy">{displayName}</p>
                {user ? (
                  <p className="mt-1 text-xs text-muted" dir="ltr">
                    {formatPhoneDisplay(user.phone)}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
        <LogoutButton collapsed={collapsed} />
      </div>
    </div>
  )
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isLight = theme === 'light'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex size-10 items-center justify-center rounded-xl border border-border text-navy transition hover:bg-surface"
      aria-label={isLight ? 'فعال‌سازی حالت تیره' : 'فعال‌سازی حالت روشن'}
      title={isLight ? 'حالت تیره' : 'حالت روشن'}
    >
      {isLight ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M12 3a6.4 6.4 0 0 0 9 9 9 9 0 1 1-9-9z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="4.25" stroke="currentColor" strokeWidth="1.75" />
          <path
            d="M12 3.5v1.5M12 19v1.5M4.9 4.9l1.1 1.1M18 18l1.1 1.1M3.5 12H5M19 12h1.5M4.9 19.1L6 18M18 6l1.1-1.1"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </svg>
      )}
    </button>
  )
}

function WalletButton() {
  const { pathname } = useLocation()
  const isActive = pathname.startsWith('/app/wallet')
  const { data: wallet, isLoading } = useMyWallet()
  const amount = wallet?.availableToman
  const label =
    amount == null
      ? 'کیف پول'
      : `${amount.toLocaleString('fa-IR')} تومان`

  return (
    <Link
      to="/app/wallet"
      className={`inline-flex h-10 items-center gap-2 rounded-xl border px-2.5 transition sm:px-3 ${
        isActive
          ? 'border-purple/40 bg-purple-soft/70 text-purple-deep'
          : 'border-border bg-surface text-navy hover:bg-surface/80'
      }`}
      aria-label={label}
      title="کیف پول"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6.5A2.5 2.5 0 0 1 4 16.5v-9z"
          stroke="currentColor"
          strokeWidth="1.75"
        />
        <path
          d="M16 12.5h4V9h-4a1.5 1.5 0 0 0 0 3z"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
        <circle cx="18.25" cy="10.75" r="1.1" fill="var(--purple)" />
      </svg>
      {isLoading && amount == null ? (
        <span className="h-3 w-16 animate-pulse rounded bg-border" />
      ) : (
        <span className="text-sm font-bold whitespace-nowrap">
          {amount == null ? '—' : amount.toLocaleString('fa-IR')}
          <span
            className={`ms-1 text-xs font-semibold ${
              isActive ? 'text-purple-deep/70' : 'text-muted'
            }`}
          >
            تومان
          </span>
        </span>
      )}
    </Link>
  )
}

function NotificationBell() {
  const { data } = useUnreadCount()
  const count = data?.count ?? 0
  const { pathname } = useLocation()
  const isActive = pathname.startsWith('/app/notifications')

  return (
    <Link
      to="/app/notifications"
      className={`relative inline-flex size-10 items-center justify-center rounded-xl border transition hover:bg-surface ${
        isActive
          ? 'border-purple/40 bg-purple-soft/70 text-purple-deep'
          : 'border-border text-navy'
      }`}
      aria-label="اعلان‌ها"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M6 9a6 6 0 1 1 12 0c0 3.5 1.5 5 1.5 5H4.5S6 12.5 6 9z"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
        <path
          d="M10 19a2 2 0 0 0 4 0"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      </svg>
      {count > 0 ? (
        <span className="absolute -top-1 -left-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-purple px-1 text-[10px] font-bold text-white">
          {count > 9 ? '۹+' : count.toLocaleString('fa-IR')}
        </span>
      ) : null}
    </Link>
  )
}

export function AppShell({ children }: AppShellProps) {
  const { data: user } = useMe()
  const isMessagesRoute = useMessagesRoute()
  const isChatThreadRoute = useChatThreadRoute()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(readSidebarCollapsed)

  useEffect(() => {
    try {
      localStorage.setItem(
        SIDEBAR_COLLAPSED_KEY,
        sidebarCollapsed ? '1' : '0',
      )
    } catch {
      /* ignore */
    }
  }, [sidebarCollapsed])

  useEffect(() => {
    if (!isChatThreadRoute) return
    const mq = window.matchMedia('(max-width: 1023px)')
    if (!mq.matches) return

    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [isChatThreadRoute])

  return (
    <div
      className={`flex bg-surface ${
        isMessagesRoute
          ? 'h-dvh overflow-hidden'
          : 'min-h-dvh max-lg:h-dvh max-lg:overflow-hidden'
      }`}
    >
      <aside
        className={`sticky top-0 hidden h-dvh shrink-0 border-l border-border bg-surface-elevated transition-[width] duration-200 ease-out lg:block ${
          sidebarCollapsed
            ? 'w-[var(--sidebar-width-collapsed)]'
            : 'w-[var(--sidebar-width)]'
        }`}
      >
        <SidebarBody
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
        />
      </aside>

      <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <header
          className={`sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border bg-surface-elevated/90 px-4 backdrop-blur-xl sm:h-16 sm:px-6 ${
            isChatThreadRoute ? 'hidden lg:flex' : ''
          }`}
        >
          <div className="lg:hidden">
            <Logo variant="icon" className="h-8 w-8" />
          </div>

          <div className="ms-auto flex items-center gap-2 sm:gap-3">
            <WalletButton />
            <NotificationBell />
            <ThemeToggle />
            <div className="hidden text-left sm:block">
              <p className="text-sm font-bold text-navy">{user?.name || '…'}</p>
              {user ? (
                <p className="text-xs text-muted" dir="ltr">
                  {formatPhoneDisplay(user.phone)}
                </p>
              ) : null}
            </div>
          </div>
        </header>

        <main
          className={`flex min-h-0 flex-1 flex-col ${
            isChatThreadRoute
              ? 'overflow-hidden p-0'
              : isMessagesRoute
                ? 'overflow-hidden p-0 pb-[calc(5.25rem+env(safe-area-inset-bottom))] lg:pb-0'
                : 'max-lg:overflow-y-auto max-lg:overscroll-contain px-4 py-6 pb-[calc(5.25rem+env(safe-area-inset-bottom))] sm:px-6 sm:py-8 lg:px-8 lg:pb-8'
          }`}
        >
          {children}
        </main>
      </div>

      {!isChatThreadRoute ? <MobileTabBar /> : null}
      <SupportFab hidden={isChatThreadRoute} />
    </div>
  )
}
