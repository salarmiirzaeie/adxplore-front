import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { GuestRoute, ProtectedRoute } from './components/ProtectedRoute'
import { CampaignDetailPage } from './pages/CampaignDetailPage'
import { CampaignInvitationsPage } from './pages/CampaignInvitationsPage'
import { CampaignOffersPage } from './pages/CampaignOffersPage'
import { CampaignsPage } from './pages/CampaignsPage'
import { CreateCampaignPage } from './pages/CreateCampaignPage'
import { EditCampaignPage } from './pages/EditCampaignPage'
import { CreateInvitationPage } from './pages/CreateInvitationPage'
import { CreateOfferPage } from './pages/CreateOfferPage'
import { DashboardPage } from './pages/DashboardPage'
import { DealDetailPage } from './pages/DealDetailPage'
import { EditProfilePage } from './pages/EditProfilePage'
import { InfluencerDetailPage } from './pages/InfluencerDetailPage'
import { InfluencersPage } from './pages/InfluencersPage'
import { InvitationsPage } from './pages/InvitationsPage'
import {
  DealsListRedirect,
  InvitationToCampaignRedirect,
} from './pages/LegacyRedirects'
import { LoginPage } from './pages/LoginPage'
import { MessagesPage } from './pages/MessagesPage'
import { NotificationsPage } from './pages/NotificationsPage'
import { OfferDetailPage } from './pages/OfferDetailPage'
import { OffersPage } from './pages/OffersPage'
import { OnboardingPage } from './pages/OnboardingPage'
import { InstagramApprovalPage } from './pages/InstagramApprovalPage'
import { OtpPage } from './pages/OtpPage'
import { PaymentResultPage } from './pages/PaymentResultPage'
import { ProfilePage } from './pages/ProfilePage'
import { PublicProfilePage } from './pages/PublicProfilePage'
import { WalletPage } from './pages/WalletPage'
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
        <Route path="/instagram-approval" element={<InstagramApprovalPage />} />
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="campaigns" element={<CampaignsPage />} />
          <Route path="campaigns/new" element={<CreateCampaignPage />} />
          <Route path="campaigns/:id/edit" element={<EditCampaignPage />} />
          <Route
            path="campaigns/:id/invitations"
            element={<CampaignInvitationsPage />}
          />
          <Route
            path="campaigns/:id/offers"
            element={<CampaignOffersPage />}
          />
          <Route path="campaigns/:id" element={<CampaignDetailPage />} />
          <Route path="influencers" element={<InfluencersPage />} />
          <Route path="influencers/:id" element={<InfluencerDetailPage />} />
          <Route path="invitations" element={<InvitationsPage />} />
          <Route path="invitations/new" element={<CreateInvitationPage />} />
          <Route
            path="invitations/:id"
            element={<InvitationToCampaignRedirect />}
          />
          <Route path="messages" element={<MessagesPage />} />
          <Route path="messages/:offerId" element={<MessagesPage />} />
          <Route path="offers" element={<OffersPage />} />
          <Route path="offers/new" element={<CreateOfferPage />} />
          <Route path="offers/:id" element={<OfferDetailPage />} />
          <Route path="deals" element={<DealsListRedirect />} />
          <Route path="deals/:id" element={<DealDetailPage />} />
          <Route path="payments/result" element={<PaymentResultPage />} />
          <Route path="wallet" element={<WalletPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="profile/edit" element={<EditProfilePage />} />
          <Route path="profiles/:id" element={<PublicProfilePage />} />
        </Route>
      </Route>

      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  )
}
