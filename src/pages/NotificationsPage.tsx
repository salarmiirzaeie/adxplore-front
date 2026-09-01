import { Link, useNavigate } from 'react-router-dom'
import { useMe } from '../hooks/useAuth'
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from '../hooks/useNotifications'
import type { AppNotification, NotificationType } from '../types/api'

function formatRelative(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  if (sameDay) {
    return d.toLocaleTimeString('fa-IR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }
  return d.toLocaleDateString('fa-IR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function notificationIcon(type: NotificationType) {
  if (type === 'CHAT_MESSAGE') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M4 6h16v12H4z" stroke="currentColor" strokeWidth="1.75" />
        <path d="M4 6l8 7 8-7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    )
  }
  if (type === 'INVITATION_RECEIVED') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M4 7h16v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7z" stroke="currentColor" strokeWidth="1.75" />
        <path d="M4 7l8 6 8-6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    )
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3l2.4 4.9L20 9l-4 3.9.9 5.4L12 15.9 7.1 18.3 8 12.9 4 9l5.6-1.1L12 3z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function NotificationRow({
  item,
  onOpen,
}: {
  item: AppNotification
  onOpen: (item: AppNotification) => void
}) {
  const unread = !item.readAt

  return (
    <button
      type="button"
      onClick={() => onOpen(item)}
      className={`flex w-full items-start gap-4 rounded-2xl border px-5 py-4 text-right transition hover:border-purple/25 sm:px-6 sm:py-5 ${
        unread
          ? 'border-purple/20 bg-purple-soft/25'
          : 'border-border bg-surface-elevated hover:bg-surface'
      }`}
    >
      <span
        className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${
          unread ? 'bg-purple text-white' : 'bg-surface text-purple'
        }`}
      >
        {notificationIcon(item.type)}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <p className="text-base font-extrabold text-navy">{item.title}</p>
          <span className="shrink-0 text-[11px] font-semibold text-muted">
            {formatRelative(item.createdAt)}
          </span>
        </div>
        <p className="mt-1.5 text-sm leading-7 text-muted">{item.body}</p>
      </div>
      {unread ? (
        <span className="mt-2 size-2.5 shrink-0 rounded-full bg-purple" />
      ) : null}
    </button>
  )
}

export function NotificationsPage() {
  const navigate = useNavigate()
  const { data: user } = useMe()
  const { data: items, isLoading, isError } = useNotifications(Boolean(user))
  const markRead = useMarkNotificationRead()
  const markAll = useMarkAllNotificationsRead()

  if (!user) return null

  const openItem = (item: AppNotification) => {
    if (!item.readAt) markRead.mutate(item.id)
    if (item.linkPath) navigate(item.linkPath)
  }

  const unreadCount = items?.filter((n) => !n.readAt).length ?? 0

  return (
    <>
      <section className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-sm font-medium text-purple">اعلان‌ها</p>
          <h1 className="text-2xl font-extrabold text-navy sm:text-3xl">
            صندوق اعلان‌ها
          </h1>
          {unreadCount > 0 ? (
            <p className="mt-2 text-sm text-muted">
              {unreadCount.toLocaleString('fa-IR')} اعلان خوانده‌نشده
            </p>
          ) : null}
        </div>
        {unreadCount > 0 ? (
          <button
            type="button"
            onClick={() => markAll.mutate()}
            disabled={markAll.isPending}
            className="shrink-0 rounded-xl border border-border bg-surface-elevated px-4 py-2.5 text-sm font-semibold text-purple transition hover:border-purple/30 disabled:opacity-50"
          >
            خواندن همه
          </button>
        ) : null}
      </section>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <span className="size-8 animate-spin rounded-full border-2 border-purple border-t-transparent" />
        </div>
      ) : null}

      {isError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          بارگذاری اعلان‌ها ناموفق بود.
        </p>
      ) : null}

      {!isLoading && !isError && items?.length === 0 ? (
        <section className="rounded-2xl border border-border bg-surface-elevated px-6 py-14 text-center">
          <h2 className="text-lg font-extrabold text-navy">اعلانی ندارید</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-muted">
            دعوت‌ها، پیشنهادها و پیام‌های جدید اینجا اعلام می‌شوند.
          </p>
          <Link
            to="/app"
            className="mt-6 inline-block text-sm font-semibold text-purple"
          >
            بازگشت به داشبورد
          </Link>
        </section>
      ) : null}

      {items && items.length > 0 ? (
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <NotificationRow key={item.id} item={item} onOpen={openItem} />
          ))}
        </div>
      ) : null}
    </>
  )
}
