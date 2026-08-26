import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  createInvitation,
  createInvitationsBulk,
  getInvitation,
  listInvitations,
  updateInvitationStatus,
} from '../api/invitations'
import { getAccessToken } from '../lib/auth-storage'
import type {
  BulkCreateInvitationsBody,
  CreateInvitationBody,
  UpdateInvitationStatusBody,
} from '../types/api'

export const invitationsQueryKey = ['invitations'] as const

export function invitationQueryKey(id: string) {
  return ['invitations', id] as const
}

export function useInvitations(campaignId?: string, enabled = true) {
  return useQuery({
    queryKey: [...invitationsQueryKey, campaignId ?? 'all'],
    queryFn: () => listInvitations(campaignId),
    enabled: enabled && Boolean(getAccessToken()),
    staleTime: 30_000,
  })
}

export function useInvitation(id: string | undefined, enabled = true) {
  return useQuery({
    queryKey: invitationQueryKey(id ?? ''),
    queryFn: () => getInvitation(id!),
    enabled: enabled && Boolean(id) && Boolean(getAccessToken()),
    staleTime: 30_000,
    retry: false,
  })
}

export function useCreateInvitation() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (body: CreateInvitationBody) => createInvitation(body),
    onSuccess: (invitation) => {
      queryClient.invalidateQueries({ queryKey: invitationsQueryKey })
      queryClient.setQueryData(invitationQueryKey(invitation.id), invitation)
      navigate(`/app/campaigns/${invitation.campaignId}`, { replace: true })
    },
  })
}

export function useBulkCreateInvitations() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: BulkCreateInvitationsBody) => createInvitationsBulk(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invitationsQueryKey })
    },
  })
}

export function useUpdateInvitationStatus(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: UpdateInvitationStatusBody) =>
      updateInvitationStatus(id, body),
    onSuccess: (invitation) => {
      queryClient.setQueryData(invitationQueryKey(id), invitation)
      queryClient.invalidateQueries({ queryKey: invitationsQueryKey })
    },
  })
}
