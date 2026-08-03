import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  createCampaign,
  getCampaign,
  listCampaigns,
  updateCampaign,
} from '../api/campaigns'
import { getAccessToken } from '../lib/auth-storage'
import type { CreateCampaignBody, UpdateCampaignBody } from '../types/api'

export const campaignsQueryKey = ['campaigns'] as const

export function campaignQueryKey(id: string) {
  return ['campaigns', id] as const
}

export function useCampaigns(enabled = true) {
  return useQuery({
    queryKey: campaignsQueryKey,
    queryFn: listCampaigns,
    enabled: enabled && Boolean(getAccessToken()),
    staleTime: 30_000,
  })
}

export function useCampaign(id: string | undefined, enabled = true) {
  return useQuery({
    queryKey: campaignQueryKey(id ?? ''),
    queryFn: () => getCampaign(id!),
    enabled: enabled && Boolean(id) && Boolean(getAccessToken()),
    staleTime: 30_000,
    retry: false,
  })
}

export function useCreateCampaign() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (body: CreateCampaignBody) => createCampaign(body),
    onSuccess: (campaign) => {
      queryClient.invalidateQueries({ queryKey: campaignsQueryKey })
      navigate(`/app/campaigns/${campaign.id}`, { replace: true })
    },
  })
}

export function useUpdateCampaign(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: UpdateCampaignBody) => updateCampaign(id, body),
    onSuccess: (campaign) => {
      queryClient.setQueryData(campaignQueryKey(id), campaign)
      queryClient.invalidateQueries({ queryKey: campaignsQueryKey })
    },
  })
}
