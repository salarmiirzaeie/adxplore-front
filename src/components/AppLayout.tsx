import { Navigate, Outlet } from 'react-router-dom'
import { AppShell } from './AppShell'
import { useMe } from '../hooks/useAuth'
import { isProfileComplete } from '../lib/auth-storage'

export function AppLayout() {
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
        <Outlet />
      )}
    </AppShell>
  )
}
