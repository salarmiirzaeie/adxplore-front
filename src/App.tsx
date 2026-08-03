import { Navigate, Route, Routes } from 'react-router-dom'
import { GuestRoute, ProtectedRoute } from './components/ProtectedRoute'
import { DashboardPage } from './pages/DashboardPage'
import { LoginPage } from './pages/LoginPage'
import { OnboardingPage } from './pages/OnboardingPage'
import { OtpPage } from './pages/OtpPage'
import { getAccessToken } from './lib/auth-storage'

function HomeRedirect() {
  return <Navigate to={getAccessToken() ? '/app' : '/login'} replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />

      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/login/otp" element={<OtpPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/app" element={<DashboardPage />} />
      </Route>

      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  )
}
