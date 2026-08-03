import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { requestOtp, verifyOtp } from '../api/auth'
import { getMe, updateMe } from '../api/users'
import {
  clearAccessToken,
  clearLoginPhone,
  getAccessToken,
  isProfileComplete,
  setAccessToken,
  setLoginPhone,
} from '../lib/auth-storage'
import { normalizeIranPhone } from '../lib/phone'
import type { UpdateProfileBody } from '../types/api'

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
    mutationFn: async (phone: string) => {
      const normalized = normalizeIranPhone(phone)
      const result = await requestOtp({ phone: normalized })
      return { ...result, phone: normalized }
    },
    onSuccess: (data) => {
      setLoginPhone(data.phone)
      navigate('/login/otp', { state: { phone: data.phone, expiresIn: data.expiresIn } })
    },
  })
}

export function useVerifyOtp() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ phone, code }: { phone: string; code: string }) => {
      return verifyOtp({ phone: normalizeIranPhone(phone), code })
    },
    onSuccess: (data) => {
      setAccessToken(data.accessToken)
      clearLoginPhone()
      queryClient.setQueryData(meQueryKey, {
        id: data.user.id,
        phone: data.user.phone,
        name: data.user.name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })

      const needsOnboarding = data.isNewUser || !isProfileComplete(data.user)
      navigate(needsOnboarding ? '/onboarding' : '/app', { replace: true })
    },
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (body: UpdateProfileBody) => updateMe(body),
    onSuccess: (user) => {
      queryClient.setQueryData(meQueryKey, user)
      navigate('/app', { replace: true })
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return () => {
    clearAccessToken()
    clearLoginPhone()
    queryClient.clear()
    navigate('/login', { replace: true })
  }
}
