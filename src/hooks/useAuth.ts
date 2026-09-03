import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { requestOtp, verifyOtp } from '../api/auth'
import { deleteMyPhoto, getMe, updateMe, uploadMyPhoto } from '../api/users'
import {
  clearAccessToken,
  clearLoginPhone,
  clearLoginRole,
  getAccessToken,
  getLoginRole,
  isProfileComplete,
  postAuthPath,
  setAccessToken,
  setLoginPhone,
  setLoginRole,
} from '../lib/auth-storage'
import { normalizeIranPhone } from '../lib/phone'
import type { UpdateProfileBody, UserRole } from '../types/api'

export const meQueryKey = ['users', 'me'] as const

export function useMe(enabled = true) {
  return useQuery({
    queryKey: meQueryKey,
    queryFn: getMe,
    enabled: enabled && Boolean(getAccessToken()),
    staleTime: 60_000,
    retry: false,
  })
}

export function useRequestOtp() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async ({ phone, role }: { phone: string; role: UserRole }) => {
      const normalized = normalizeIranPhone(phone)
      const result = await requestOtp({ phone: normalized })
      return { ...result, phone: normalized, role }
    },
    onSuccess: (data) => {
      setLoginPhone(data.phone)
      setLoginRole(data.role)
      navigate('/login/otp', {
        state: { phone: data.phone, role: data.role, expiresIn: data.expiresIn },
      })
    },
  })
}

export function useVerifyOtp() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      phone,
      code,
      role,
    }: {
      phone: string
      code: string
      role: UserRole
    }) => {
      return verifyOtp({ phone: normalizeIranPhone(phone), code, role })
    },
    onSuccess: (data) => {
      setAccessToken(data.accessToken)
      clearLoginPhone()
      clearLoginRole()
      queryClient.setQueryData(meQueryKey, {
        id: data.user.id,
        phone: data.user.phone,
        name: data.user.name,
        role: data.user.role,
        photoUrl: data.user.photoUrl,
        category: data.user.category,
        categories: data.user.categories ?? [],
        city: data.user.city,
        province: data.user.province,
        website: data.user.website,
        goal: data.user.goal,
        businessSize: data.user.businessSize,
        followerRange: data.user.followerRange,
        approvalStatus: data.user.approvalStatus ?? null,
        canAccessPanel: data.user.canAccessPanel,
        canSendOffers: data.user.canSendOffers,
        nextScreen: data.user.nextScreen,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })

      const needsOnboarding = data.isNewUser || !isProfileComplete(data.user)
      const path = needsOnboarding
        ? '/onboarding'
        : postAuthPath({ ...data.user, name: data.user.name })
      navigate(path, { replace: true })
    },
  })
}

export function useUpdateProfile(options?: { redirectTo?: string | null }) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const redirectTo = options?.redirectTo === undefined ? '/app' : options.redirectTo

  return useMutation({
    mutationFn: (body: UpdateProfileBody) => updateMe(body),
    onSuccess: (user) => {
      queryClient.setQueryData(meQueryKey, user)
      if (redirectTo) {
        const path = redirectTo === '/app' ? postAuthPath(user) : redirectTo
        navigate(path, { replace: true })
      }
    },
  })
}

export function useUploadPhoto() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (file: File) => uploadMyPhoto(file),
    onSuccess: (user) => {
      queryClient.setQueryData(meQueryKey, user)
    },
  })
}

export function useDeletePhoto() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => deleteMyPhoto(),
    onSuccess: (user) => {
      queryClient.setQueryData(meQueryKey, user)
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return () => {
    clearAccessToken()
    clearLoginPhone()
    clearLoginRole()
    void import('../lib/chat-socket').then((m) => m.disconnectChatSocket())
    queryClient.clear()
    navigate('/login', { replace: true })
  }
}

/** Prefer navigation state, then session storage. */
export function resolveLoginRole(stateRole?: UserRole | null): UserRole | null {
  if (stateRole === 'INFLUENCER' || stateRole === 'BRAND') return stateRole
  return getLoginRole()
}
