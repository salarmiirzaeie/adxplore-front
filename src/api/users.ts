import { api } from './client'
import type {
  InstagramApprovalResponse,
  UpdateProfileBody,
  UserProfile,
} from '../types/api'

export async function getMe(): Promise<UserProfile> {
  const { data } = await api.get<UserProfile>('/v1/users/me')
  return data
}

export async function updateMe(body: UpdateProfileBody): Promise<UserProfile> {
  const { data } = await api.patch<UserProfile>('/v1/users/me', body)
  return data
}

export async function uploadMyPhoto(file: File): Promise<UserProfile> {
  const form = new FormData()
  form.append('file', file)
  const { data } = await api.post<UserProfile>('/v1/users/me/photo', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function deleteMyPhoto(): Promise<UserProfile> {
  const { data } = await api.delete<UserProfile>('/v1/users/me/photo')
  return data
}

export async function getInstagramApproval(): Promise<InstagramApprovalResponse> {
  const { data } = await api.get<InstagramApprovalResponse>(
    '/v1/users/me/instagram-approval',
  )
  return data
}

export async function confirmInstagramDmSent(): Promise<InstagramApprovalResponse> {
  const { data } = await api.post<InstagramApprovalResponse>(
    '/v1/users/me/instagram-approval/confirm-sent',
  )
  return data
}
