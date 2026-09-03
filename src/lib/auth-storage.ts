import type { UserRole } from '../types/api'

const TOKEN_KEY = 'adxplore_access_token'
const PHONE_KEY = 'adxplore_login_phone'
const ROLE_KEY = 'adxplore_login_role'

let memoryToken: string | null = null

export function getAccessToken(): string | null {
  if (memoryToken) return memoryToken
  try {
    memoryToken = localStorage.getItem(TOKEN_KEY)
  } catch {
    memoryToken = null
  }
  return memoryToken
}

export function setAccessToken(token: string): void {
  memoryToken = token
  try {
    localStorage.setItem(TOKEN_KEY, token)
  } catch {
    /* ignore quota / private mode */
  }
}

export function clearAccessToken(): void {
  memoryToken = null
  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* ignore */
  }
}

export function setLoginPhone(phone: string): void {
  try {
    sessionStorage.setItem(PHONE_KEY, phone)
  } catch {
    /* ignore */
  }
}

export function getLoginPhone(): string | null {
  try {
    return sessionStorage.getItem(PHONE_KEY)
  } catch {
    return null
  }
}

export function clearLoginPhone(): void {
  try {
    sessionStorage.removeItem(PHONE_KEY)
  } catch {
    /* ignore */
  }
}

export function setLoginRole(role: UserRole): void {
  try {
    sessionStorage.setItem(ROLE_KEY, role)
  } catch {
    /* ignore */
  }
}

export function getLoginRole(): UserRole | null {
  try {
    const role = sessionStorage.getItem(ROLE_KEY)
    if (role === 'INFLUENCER' || role === 'BRAND') return role
    return null
  } catch {
    return null
  }
}

export function clearLoginRole(): void {
  try {
    sessionStorage.removeItem(ROLE_KEY)
  } catch {
    /* ignore */
  }
}

export function isProfileComplete(user: {
  name: string | null
  role: UserRole
  category?: string | null
  categories?: string[] | null
  city?: string | null
  province?: string | null
  website?: string | null
  followerRange?: string | null
}): boolean {
  if (!user.name?.trim()) return false
  const hasCategory =
    Boolean(user.category) || Boolean(user.categories && user.categories.length > 0)
  if (user.role === 'BRAND') {
    return Boolean(hasCategory && user.city?.trim() && user.province?.trim())
  }
  if (user.role === 'INFLUENCER') {
    return Boolean(
      hasCategory &&
        user.city?.trim() &&
        user.province?.trim() &&
        user.website?.trim() &&
        user.followerRange,
    )
  }
  return true
}

export function postAuthPath(user: {
  role: UserRole
  nextScreen?: 'ONBOARDING' | 'INSTAGRAM_APPROVAL' | 'PANEL' | null
  canAccessPanel?: boolean
  name: string | null
  category?: string | null
  categories?: string[] | null
  city?: string | null
  province?: string | null
  website?: string | null
  followerRange?: string | null
}): string {
  if (user.nextScreen === 'ONBOARDING') return '/onboarding'
  if (user.nextScreen === 'INSTAGRAM_APPROVAL') return '/instagram-approval'
  if (user.nextScreen === 'PANEL') return '/app'

  if (!isProfileComplete(user)) return '/onboarding'
  if (user.role === 'INFLUENCER' && user.canAccessPanel === false) {
    return '/instagram-approval'
  }
  return '/app'
}

export function canSendOffers(user: {
  role: UserRole
  canSendOffers?: boolean
  approvalStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | null
}): boolean {
  if (user.role !== 'INFLUENCER') return true
  if (user.canSendOffers === true) return true
  return user.approvalStatus === 'APPROVED'
}
