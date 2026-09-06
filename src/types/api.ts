/** Matches AdXplore API Swagger schemas exactly. */

export type UserRole = 'INFLUENCER' | 'BRAND'

export type BrandCategory =
  | 'BEAUTY'
  | 'FASHION'
  | 'FOOD'
  | 'HEALTH'
  | 'TECH'
  | 'EDUCATION'
  | 'TRAVEL'
  | 'SPORTS'
  | 'HOME'
  | 'FINANCE'
  | 'ENTERTAINMENT'
  | 'OTHER'

export type BrandGoal = 'AWARENESS' | 'SALES' | 'CONTENT' | 'LAUNCH'

export type BusinessSize = 'SOLO' | 'SME' | 'AGENCY' | 'ENTERPRISE'

export type FollowerRange =
  | 'UNDER_1K'
  | 'FROM_1K_5K'
  | 'FROM_5K_10K'
  | 'FROM_10K_50K'
  | 'FROM_50K_100K'
  | 'FROM_100K_500K'
  | 'OVER_500K'

export type InfluencerApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export type NextScreen = 'ONBOARDING' | 'INSTAGRAM_APPROVAL' | 'PANEL'

export type CampaignStatus = 'DRAFT' | 'PENDING_REVIEW' | 'OPEN' | 'CLOSED'

export type DeliverableType = 'STORY' | 'POST' | 'REEL'

export interface RequestOtpBody {
  phone: string
}

export interface RequestOtpResponse {
  ok: boolean
  message: string
  expiresIn: number
}

export interface VerifyOtpBody {
  phone: string
  code: string
  role: UserRole
}

export interface AuthUser {
  id: string
  phone: string
  name: string | null
  role: UserRole
  photoUrl: string | null
  category: BrandCategory | null
  categories: BrandCategory[]
  city: string | null
  province: string | null
  website: string | null
  bio: string | null
  goal: BrandGoal | null
  businessSize: BusinessSize | null
  followerRange: FollowerRange | null
  audienceProofs?: AudienceProof[]
  approvalStatus?: InfluencerApprovalStatus | null
  canAccessPanel?: boolean
  canSendOffers?: boolean
  nextScreen?: NextScreen
}

export interface VerifyOtpResponse {
  accessToken: string
  tokenType: string
  expiresIn: string
  isNewUser: boolean
  user: AuthUser
}

export interface AudienceProof {
  id: string
  url: string
  sortOrder: number
}

export interface UserProfile {
  id: string
  phone: string
  name: string | null
  role: UserRole
  photoUrl: string | null
  category: BrandCategory | null
  categories: BrandCategory[]
  city: string | null
  province: string | null
  website: string | null
  bio: string | null
  goal: BrandGoal | null
  businessSize: BusinessSize | null
  followerRange: FollowerRange | null
  audienceProofs?: AudienceProof[]
  approvalStatus?: InfluencerApprovalStatus | null
  canAccessPanel?: boolean
  canSendOffers?: boolean
  nextScreen?: NextScreen
  createdAt: string
  updatedAt: string
}

export interface PublicProfile {
  id: string
  name: string | null
  role: UserRole
  photoUrl: string | null
  category: BrandCategory | null
  categories: BrandCategory[]
  city: string | null
  province: string | null
  website: string | null
  bio: string | null
  goal: BrandGoal | null
  businessSize: BusinessSize | null
  followerRange: FollowerRange | null
  audienceProofs?: AudienceProof[]
}

export interface UpdateProfileBody {
  name?: string
  category?: BrandCategory
  categories?: BrandCategory[]
  city?: string
  province?: string
  website?: string | null
  bio?: string | null
  goal?: BrandGoal | null
  businessSize?: BusinessSize | null
  followerRange?: FollowerRange | null
}

export type InstagramApprovalUiStatus =
  | 'ONBOARDING'
  | 'ACTION_REQUIRED'
  | 'WAITING_REVIEW'
  | 'APPROVED'
  | 'REJECTED'

export interface InstagramActionLink {
  label: string
  url: string
  appUrl: string
  androidIntent: string
}

export interface InstagramCopyAction {
  label: string
  text: string
}

export interface InstagramApprovalResponse {
  approvalStatus: InfluencerApprovalStatus | null
  uiStatus: InstagramApprovalUiStatus
  onboardingComplete: boolean
  canAccessPanel: boolean
  canSendOffers: boolean
  verifyCode: string | null
  dmMessage: string | null
  influencerInstagram: string | null
  rejectionReason: string | null
  markedSentAt: string | null
  approvedAt: string | null
  pollIntervalSeconds: number
  page: {
    username: string
    profileUrl: string
    followUrl: string
    dmUrl: string
    appProfileUrl: string
    appDmUrl: string
    androidProfileIntent: string
    androidDmIntent: string
  }
  copy: {
    headline: string
    subtitle: string
    waitingHint: string
  }
  actions: {
    copyMessage: InstagramCopyAction | null
    copyCode: InstagramCopyAction | null
    follow: InstagramActionLink
    openDm: InstagramActionLink
    confirmSent: { label: string; enabled: boolean }
  }
  steps: Array<{
    id: string
    title: string
    body: string
    action: string
    done: boolean
  }>
}

export interface CampaignImage {
  id: string
  url: string
  sortOrder: number
}

export interface Campaign {
  id: string
  brandId: string
  title: string
  brief: string
  category: BrandCategory
  categories: BrandCategory[]
  city: string
  province: string | null
  deliverable: DeliverableType
  deliverables: DeliverableType[]
  budgetMin: number | null
  budgetMax: number | null
  status: CampaignStatus
  rejectionReason?: string | null
  rejectedAt?: string | null
  images: CampaignImage[]
  brand?: OfferParty
  createdAt: string
  updatedAt: string
}

export interface BrowseCampaignsParams {
  category?: BrandCategory
  city?: string
  province?: string
  q?: string
  forMe?: boolean
  invited?: boolean
}

export interface CreateCampaignBody {
  title: string
  brief: string
  category?: BrandCategory
  categories: BrandCategory[]
  city: string
  province?: string | null
  deliverable?: DeliverableType
  deliverables: DeliverableType[]
  budgetMin?: number
  budgetMax?: number
  status?: CampaignStatus
}

export interface UpdateCampaignBody {
  title?: string
  brief?: string
  category?: BrandCategory
  categories?: BrandCategory[]
  city?: string
  province?: string | null
  deliverable?: DeliverableType
  deliverables?: DeliverableType[]
  budgetMin?: number | null
  budgetMax?: number | null
  status?: CampaignStatus
}

export interface InfluencerCard {
  id: string
  name: string
  website: string
  photoUrl: string | null
  category: BrandCategory
  categories: BrandCategory[]
  city: string
  province: string | null
  followerRange: FollowerRange
  bio: string | null
  audienceProofs?: AudienceProof[]
}

export interface ListInfluencersParams {
  category?: BrandCategory
  city?: string
  province?: string
  followerRange?: FollowerRange
}

export type InvitationStatus = 'PENDING' | 'CANCELLED'

export type OfferStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED'

export type NotificationType =
  | 'INVITATION_RECEIVED'
  | 'OFFER_RECEIVED'
  | 'OFFER_UPDATED'
  | 'OFFER_ACCEPTED'
  | 'OFFER_REJECTED'
  | 'OFFER_CANCELLED'
  | 'OFFER_REOPENED'
  | 'DEAL_STARTED'
  | 'DELIVERABLE_SUBMITTED'
  | 'REVISION_REQUESTED'
  | 'DEAL_COMPLETED'
  | 'DEAL_CANCELLED'
  | 'DEAL_REACTIVATED'
  | 'CHAT_MESSAGE'
  | 'INFLUENCER_APPROVED'
  | 'INFLUENCER_REJECTED'
  | 'CAMPAIGN_REJECTED'

export type MessageKind = 'TEXT' | 'SYSTEM' | 'DELIVERABLE' | 'IMAGE' | 'VIDEO'

export type DealContentKind = 'LINK' | 'IMAGE' | 'VIDEO'

export interface ChatMessageMetadata {
  event?: string
  dealId?: string
  contentKind?: DealContentKind
  contentUrl?: string
  note?: string | null
  proofUrl?: string | null
  brandFeedback?: string | null
  mediaUrl?: string
  mimeType?: string
  fee?: number
  message?: string | null
  deadline?: string | null
  previousFee?: number
  previousMessage?: string | null
  previousDeadline?: string | null
  cancelledById?: string
}

export interface ChatMessage {
  id: string
  conversationId: string
  senderId: string
  kind: MessageKind
  body: string
  metadata: ChatMessageMetadata | null
  createdAt: string
  readAt: string | null
}

export interface Conversation {
  id: string
  offerId: string
  campaignId: string
  brandId: string
  influencerId: string
  campaignTitle: string | null
  peerId?: string | null
  peerName: string | null
  peerPhotoUrl: string | null
  peerBio?: string | null
  lastMessage: ChatMessage | null
  unreadCount: number
  createdAt: string
  updatedAt: string
  offer?: ConversationOffer
}

export interface ConversationOffer {
  id: string
  fee: number
  message: string | null
  deadline: string | null
  status: OfferStatus
  canEdit: boolean
  canUndoReject?: boolean
  updatedAt: string
}

export interface SendChatMessageBody {
  body?: string
  file?: File
}

export type DealStatus =
  | 'PENDING_PAYMENT'
  | 'IN_PROGRESS'
  | 'DELIVERED'
  | 'REVISION_REQUESTED'
  | 'COMPLETED'
  | 'CANCELLED'

export type PaymentStatus =
  | 'PENDING'
  | 'HELD'
  | 'RELEASED'
  | 'FAILED'
  | 'REFUNDED'

export interface Deal {
  id: string
  offerId: string
  campaignId: string
  brandId: string
  influencerId: string
  fee: number
  status: DealStatus
  cancelledById?: string | null
  canReactivate?: boolean
  contentKind: DealContentKind | null
  contentUrl: string | null
  note: string | null
  proofUrl: string | null
  brandFeedback: string | null
  submittedAt: string | null
  completedAt: string | null
  campaign: OfferCampaign
  brand: OfferParty
  influencer: OfferParty
  createdAt: string
  updatedAt: string
}

export interface Payment {
  id: string
  dealId: string
  brandId: string
  influencerId: string
  amountToman: number
  amountRial: number
  description: string | null
  authority: string | null
  refId: string | null
  cardPan: string | null
  status: PaymentStatus
  errorMessage: string | null
  paidAt: string | null
  releasedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface PaymentRequestResult {
  success: boolean
  paymentId: string
  authority: string
  paymentUrl: string
  amountToman: number
  amountRial: number
  reused?: boolean
  sandbox?: boolean
  status: PaymentStatus
}

export interface PaymentStatusResult {
  success: boolean
  dealId: string
  offerId: string
  dealStatus: string
  paid: boolean
  paymentStatus: PaymentStatus | null
  refId: string | null
  amountToman: number | null
}

export type WalletTxType =
  | 'TOP_UP'
  | 'ESCROW_HOLD'
  | 'ESCROW_RELEASE'
  | 'ESCROW_REFUND'
  | 'DEAL_EARNING'
  | 'WITHDRAW_REQUEST'
  | 'WITHDRAW_DONE'
  | 'WITHDRAW_CANCEL'

export interface BankCard {
  holderName: string
  cardNumber: string
  cardMasked: string
  cardLast4: string
  sheba: string
  bankName: string
  updatedAt?: string
}

export interface Wallet {
  id: string
  userId: string
  availableToman: number
  heldToman: number
  totalToman: number
  hasBankCard?: boolean
  bankCard?: BankCard | null
  createdAt: string
  updatedAt: string
}

export interface WalletTransaction {
  id: string
  walletId: string
  type: WalletTxType
  amountToman: number
  availableAfter: number
  heldAfter: number
  dealId: string | null
  paymentId: string | null
  description: string | null
  bankCard?: BankCard | null
  createdAt: string
}

export interface UpsertBankCardBody {
  holderName: string
  cardNumber: string
  sheba: string
}

export interface SubmitDeliverableBody {
  kind: DealContentKind
  contentUrl?: string
  note?: string
  file?: File
  proof?: File
}

export interface UpdateDealStatusBody {
  status: 'COMPLETED' | 'REVISION_REQUESTED' | 'CANCELLED' | 'IN_PROGRESS'
  brandFeedback?: string
}

export interface OfferParty {
  id: string
  name: string | null
  photoUrl: string | null
  website: string | null
  category: BrandCategory | null
  categories: BrandCategory[]
  city: string | null
  province: string | null
  followerRange: FollowerRange | null
  bio: string | null
  audienceProofs?: AudienceProof[]
}

export interface InvitationCampaign {
  id: string
  title: string
  deliverable: DeliverableType
  deliverables: DeliverableType[]
  category: BrandCategory
  categories: BrandCategory[]
  city: string
  province: string | null
  status: CampaignStatus
  brief: string
  budgetMin: number | null
  budgetMax: number | null
}

export interface Invitation {
  id: string
  campaignId: string
  brandId: string
  influencerId: string
  message: string | null
  status: InvitationStatus
  campaign: InvitationCampaign
  brand: OfferParty
  influencer: OfferParty
  createdAt: string
  updatedAt: string
}

export interface CreateInvitationBody {
  campaignId: string
  influencerId: string
  message?: string
}

export interface BulkCreateInvitationsBody {
  campaignId: string
  influencerIds: string[]
  message?: string
}

export interface BulkCreateInvitationsResult {
  created: Invitation[]
  skippedCount: number
}

export interface UpdateInvitationStatusBody {
  status: 'CANCELLED'
}

export interface OfferCampaign {
  id: string
  title: string
  deliverable: DeliverableType
  deliverables: DeliverableType[]
  category: BrandCategory
  categories: BrandCategory[]
  city: string
  province: string | null
  status: CampaignStatus
  brief: string
  budgetMin: number | null
  budgetMax: number | null
}

export interface Offer {
  id: string
  campaignId: string
  brandId: string
  influencerId: string
  fee: number
  message: string | null
  deadline: string | null
  status: OfferStatus
  canEdit?: boolean
  canUndoReject?: boolean
  campaign: OfferCampaign
  brand: OfferParty
  influencer: OfferParty
  createdAt: string
  updatedAt: string
}

export interface CreateOfferBody {
  campaignId: string
  fee: number
  message?: string
  deadline?: string
}

export interface UpdateOfferStatusBody {
  status: 'ACCEPTED' | 'REJECTED' | 'CANCELLED' | 'PENDING'
}

export interface UpdateOfferTermsBody {
  fee?: number
  message?: string | null
  deadline?: string | null
}

export interface AppNotification {
  id: string
  userId: string
  type: NotificationType
  title: string
  body: string
  linkPath: string | null
  entityId: string | null
  readAt: string | null
  createdAt: string
}

export interface UnreadCountResponse {
  count: number
}

export interface CreateSupportTicketBody {
  phone: string
  subject: string
  message: string
}

export type SupportTicketStatus = 'NEW' | 'READ' | 'RESOLVED'

export interface SupportTicket {
  id: string
  userId: string
  phone: string
  subject: string
  message: string
  status: SupportTicketStatus
  readAt: string | null
  resolvedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface HealthResponse {
  status: string
  service: string
}

export interface ApiErrorBody {
  statusCode?: number
  message?: string | string[]
  error?: string
}
