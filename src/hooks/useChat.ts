import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getConversationByOffer,
  listConversations,
  listMessages,
  markConversationRead,
  sendMessage,
} from '../api/chat'
import { getAccessToken } from '../lib/auth-storage'

export const conversationsKey = ['conversations'] as const

export function conversationByOfferKey(offerId: string) {
  return ['conversations', 'by-offer', offerId] as const
}

export function messagesKey(conversationId: string) {
  return ['conversations', conversationId, 'messages'] as const
}

export function useConversations(enabled = true) {
  return useQuery({
    queryKey: conversationsKey,
    queryFn: listConversations,
    enabled: enabled && Boolean(getAccessToken()),
    staleTime: 15_000,
  })
}

export function useConversationByOffer(offerId: string | undefined) {
  return useQuery({
    queryKey: conversationByOfferKey(offerId ?? ''),
    queryFn: () => getConversationByOffer(offerId!),
    enabled: Boolean(offerId) && Boolean(getAccessToken()),
    staleTime: 30_000,
  })
}

export function useMessages(conversationId: string | undefined) {
  return useQuery({
    queryKey: messagesKey(conversationId ?? ''),
    queryFn: () => listMessages(conversationId!),
    enabled: Boolean(conversationId) && Boolean(getAccessToken()),
    staleTime: 5_000,
  })
}

export function useSendMessage(conversationId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: string) => sendMessage(conversationId, { body }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: messagesKey(conversationId) })
      qc.invalidateQueries({ queryKey: conversationsKey })
    },
  })
}

export function useMarkConversationRead(conversationId: string | undefined) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => markConversationRead(conversationId!),
    onSuccess: () => {
      if (conversationId) {
        qc.invalidateQueries({ queryKey: conversationByOfferKey })
        qc.invalidateQueries({ queryKey: conversationsKey })
      }
    },
  })
}
