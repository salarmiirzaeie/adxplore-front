import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getUnreadCount,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../api/notifications'
import { getAccessToken } from '../lib/auth-storage'

export const notificationsQueryKey = ['notifications'] as const
export const unreadCountQueryKey = ['notifications', 'unread-count'] as const

export function useNotifications(enabled = true) {
  return useQuery({
    queryKey: notificationsQueryKey,
    queryFn: listNotifications,
    enabled: enabled && Boolean(getAccessToken()),
    staleTime: 15_000,
    refetchInterval: 60_000,
  })
}

export function useUnreadCount(enabled = true) {
  return useQuery({
    queryKey: unreadCountQueryKey,
    queryFn: getUnreadCount,
    enabled: enabled && Boolean(getAccessToken()),
    staleTime: 15_000,
    refetchInterval: 30_000,
  })
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsQueryKey })
      queryClient.invalidateQueries({ queryKey: unreadCountQueryKey })
    },
  })
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsQueryKey })
      queryClient.invalidateQueries({ queryKey: unreadCountQueryKey })
    },
  })
}
