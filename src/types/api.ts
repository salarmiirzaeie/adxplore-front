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

export type CampaignStatus = 'DRAFT' | 'OPEN' | 'CLOSED'

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
  city: string | null
  website: string | null
  goal: BrandGoal | null
  businessSize: BusinessSize | null
  followerRange: FollowerRange | null
}

export interface VerifyOtpResponse {
  accessToken: string
  tokenType: string
  expiresIn: string
  isNewUser: boolean
  user: AuthUser
}

export interface UserProfile {
  id: string
  phone: string
  name: string | null
  role: UserRole
  photoUrl: string | null
  category: BrandCategory | null
  city: string | null
  website: string | null
  goal: BrandGoal | null
  businessSize: BusinessSize | null
  followerRange: FollowerRange | null
  createdAt: string
  updatedAt: string
}

export interface UpdateProfileBody {
  name?: string
  category?: BrandCategory
  city?: string
  website?: string | null
  goal?: BrandGoal | null
  businessSize?: BusinessSize | null
  followerRange?: FollowerRange | null
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
  city: string
  deliverable: DeliverableType
  budgetMin: number | null
  budgetMax: number | null
  status: CampaignStatus
  images: CampaignImage[]
  createdAt: string
  updatedAt: string
}

export interface CreateCampaignBody {
  title: string
  brief: string
  category: BrandCategory
  city: string
  deliverable: DeliverableType
  budgetMin?: number
  budgetMax?: number
  status?: CampaignStatus
}

export interface UpdateCampaignBody {
  title?: string
  brief?: string
  category?: BrandCategory
  city?: string
  deliverable?: DeliverableType
  budgetMin?: number
  budgetMax?: number
  status?: CampaignStatus
}

export interface InfluencerCard {
  id: string
  name: string
  website: string
  photoUrl: string | null
  category: BrandCategory
  city: string
  followerRange: FollowerRange
}

export interface ListInfluencersParams {
  category?: BrandCategory
  city?: string
  followerRange?: FollowerRange
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
