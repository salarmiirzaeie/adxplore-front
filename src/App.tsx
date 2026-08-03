import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { GuestRoute, ProtectedRoute } from './components/ProtectedRoute'
import { CampaignDetailPage } from './pages/CampaignDetailPage'
import { CampaignsPage } from './pages/CampaignsPage'
import { CreateCampaignPage } from './pages/CreateCampaignPage'
import { DashboardPage } from './pages/DashboardPage'
import { EditProfilePage } from './pages/EditProfilePage'
import { InfluencerDetailPage } from './pages/InfluencerDetailPage'
import { InfluencersPage } from './pages/InfluencersPage'
import { LoginPage } from './pages/LoginPage'
import { OnboardingPage } from './pages/OnboardingPage'
import { OtpPage } from './pages/OtpPage'
import { ProfilePage } from './pages/ProfilePage'
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
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="campaigns" element={<CampaignsPage />} />
          <Route path="campaigns/new" element={<CreateCampaignPage />} />
          <Route path="campaigns/:id" element={<CampaignDetailPage />} />
          <Route path="influencers" element={<InfluencersPage />} />
          <Route path="influencers/:id" element={<InfluencerDetailPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="profile/edit" element={<EditProfilePage />} />
        </Route>
      </Route>

      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  )
}
