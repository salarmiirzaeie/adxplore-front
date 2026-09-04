import { api } from './client'
import type { CreateSupportTicketBody, SupportTicket } from '../types/api'

export async function createSupportTicket(
  body: CreateSupportTicketBody,
): Promise<SupportTicket> {
  const { data } = await api.post<SupportTicket>('/v1/support', body)
  return data
}
