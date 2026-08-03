import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { getAccessToken } from '../lib/auth-storage'

export function ProtectedRoute() {
  const token = getAccessToken()
  const location = useLocation()

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}

export function GuestRoute() {
  const token = getAccessToken()

  if (token) {
    // Incomplete profiles land on /onboarding via DashboardPage redirect.
    return <Navigate to="/app" replace />
  }

  return <Outlet />
}
