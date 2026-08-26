import { api } from './client'
import type { AppNotification, UnreadCountResponse } from '../types/api'

export async function listNotifications(): Promise<AppNotification[]> {
  const { data } = await api.get<AppNotification[]>('/v1/notifications')
  return data
}

export async function getUnreadCount(): Promise<UnreadCountResponse> {
  const { data } = await api.get<UnreadCountResponse>(
    '/v1/notifications/unread-count',
  )
  return data
}

export async function markNotificationRead(
  id: string,
): Promise<AppNotification> {
  const { data } = await api.patch<AppNotification>(
    `/v1/notifications/${id}/read`,
  )
  return data
}

export async function markAllNotificationsRead(): Promise<void> {
  await api.post('/v1/notifications/read-all')
}
