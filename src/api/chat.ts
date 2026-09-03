import { api } from './client'
import type { ChatMessage, Conversation, SendChatMessageBody } from '../types/api'

const MEDIA_TIMEOUT_MS = 180_000

export async function listConversations(): Promise<Conversation[]> {
  const { data } = await api.get<Conversation[]>('/v1/conversations')
  return data
}

export async function getConversationByOffer(
  offerId: string,
): Promise<Conversation> {
  const { data } = await api.get<Conversation>(
    `/v1/conversations/by-offer/${offerId}`,
  )
  return data
}

export async function getConversation(id: string): Promise<Conversation> {
  const { data } = await api.get<Conversation>(`/v1/conversations/${id}`)
  return data
}

export async function listMessages(
  conversationId: string,
): Promise<ChatMessage[]> {
  const { data } = await api.get<ChatMessage[]>(
    `/v1/conversations/${conversationId}/messages`,
  )
  return data
}

export async function sendMessage(
  conversationId: string,
  body: SendChatMessageBody,
): Promise<ChatMessage> {
  if (body.file) {
    const form = new FormData()
    if (body.body?.trim()) form.append('body', body.body.trim())
    form.append('file', body.file)
    const { data } = await api.post<ChatMessage>(
      `/v1/conversations/${conversationId}/messages`,
      form,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: MEDIA_TIMEOUT_MS,
      },
    )
    return data
  }

  const { data } = await api.post<ChatMessage>(
    `/v1/conversations/${conversationId}/messages`,
    { body: body.body ?? '' },
  )
  return data
}

export async function markConversationRead(
  conversationId: string,
): Promise<{ ok: boolean }> {
  const { data } = await api.post<{ ok: boolean }>(
    `/v1/conversations/${conversationId}/read`,
  )
  return data
}
