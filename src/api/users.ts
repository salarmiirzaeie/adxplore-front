import { api } from './client'
import type { UpdateProfileBody, UserProfile } from '../types/api'

export async function getMe(): Promise<UserProfile> {
  const { data } = await api.get<UserProfile>('/v1/users/me')
  return data
}

export async function updateMe(body: UpdateProfileBody): Promise<UserProfile> {
  const { data } = await api.patch<UserProfile>('/v1/users/me', body)
  return data
}
