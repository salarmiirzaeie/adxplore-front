/** Matches AdXplore API Swagger schemas exactly. */

export type UserRole = 'INFLUENCER' | 'BRAND'

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
  createdAt: string
  updatedAt: string
}

export interface UpdateProfileBody {
  name?: string
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
