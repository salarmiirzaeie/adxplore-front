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
  category: BrandCategory | null
  city: string | null
  website: string | null
  goal: BrandGoal | null
  businessSize: BusinessSize | null
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
  category: BrandCategory | null
  city: string | null
  website: string | null
  goal: BrandGoal | null
  businessSize: BusinessSize | null
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
