import { api } from './client'
import type {
  BulkCreateInvitationsBody,
  BulkCreateInvitationsResult,
  CreateInvitationBody,
  Invitation,
  UpdateInvitationStatusBody,
} from '../types/api'

export async function listInvitations(
  campaignId?: string,
): Promise<Invitation[]> {
  const { data } = await api.get<Invitation[]>('/v1/invitations', {
    params: campaignId ? { campaignId } : undefined,
  })
  return data
}

export async function getInvitation(id: string): Promise<Invitation> {
  const { data } = await api.get<Invitation>(`/v1/invitations/${id}`)
  return data
}

export async function createInvitation(
  body: CreateInvitationBody,
): Promise<Invitation> {
  const { data } = await api.post<Invitation>('/v1/invitations', body)
  return data
}

export async function createInvitationsBulk(
  body: BulkCreateInvitationsBody,
): Promise<BulkCreateInvitationsResult> {
  const { data } = await api.post<BulkCreateInvitationsResult>(
    '/v1/invitations/bulk',
    body,
  )
  return data
}

export async function updateInvitationStatus(
  id: string,
  body: UpdateInvitationStatusBody,
): Promise<Invitation> {
  const { data } = await api.patch<Invitation>(`/v1/invitations/${id}`, body)
  return data
}
