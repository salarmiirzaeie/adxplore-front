import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { AppShell } from './AppShell'
import { PageContainer } from './ui/PageContainer'
import { useMe } from '../hooks/useAuth'
import { usePushNotifications } from '../hooks/usePushNotifications'
import { isProfileComplete, postAuthPath } from '../lib/auth-storage'

export function AppLayout() {
  const { data: user, isLoading, isError } = useMe()
  const { pathname } = useLocation()
  const isMessagesRoute = pathname.startsWith('/app/messages')
  usePushNotifications(Boolean(user))

  if (isError) {
    return <Navigate to="/login" replace />
  }

  if (!isLoading && user && !isProfileComplete(user)) {
    return <Navigate to="/onboarding" replace />
  }

  if (!isLoading && user && postAuthPath(user) === '/instagram-approval') {
    return <Navigate to="/instagram-approval" replace />
  }

  return (
    <AppShell>
      {isLoading || !user ? (
        <div className="flex flex-col items-center gap-3 py-24 text-muted">
          <span className="size-8 animate-spin rounded-full border-2 border-purple border-t-transparent" />
          <span className="text-sm">در حال بارگذاری…</span>
        </div>
      ) : (
        <PageContainer
          animate={!isMessagesRoute}
          className={
            isMessagesRoute
              ? 'flex h-full min-h-0 flex-1 flex-col overflow-hidden'
              : undefined
          }
        >
          <Outlet />
        </PageContainer>
      )}
    </AppShell>
  )
}
