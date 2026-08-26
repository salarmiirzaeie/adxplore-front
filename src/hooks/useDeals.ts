import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getDeal,
  listDeals,
  submitDeliverable,
  updateDealStatus,
} from '../api/deals'
import { getAccessToken } from '../lib/auth-storage'
import type { SubmitDeliverableBody, UpdateDealStatusBody } from '../types/api'

export const dealsQueryKey = ['deals'] as const

export function dealQueryKey(id: string) {
  return ['deals', id] as const
}

export function useDeals(campaignId?: string, enabled = true) {
  return useQuery({
    queryKey: [...dealsQueryKey, campaignId ?? 'all'],
    queryFn: () => listDeals(campaignId),
    enabled: enabled && Boolean(getAccessToken()),
    staleTime: 30_000,
  })
}

export function useDeal(id: string | undefined, enabled = true) {
  return useQuery({
    queryKey: dealQueryKey(id ?? ''),
    queryFn: () => getDeal(id!),
    enabled: enabled && Boolean(id) && Boolean(getAccessToken()),
    staleTime: 30_000,
    retry: false,
  })
}

export function useSubmitDeliverable(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: SubmitDeliverableBody) => submitDeliverable(id, body),
    onSuccess: (deal) => {
      queryClient.setQueryData(dealQueryKey(id), deal)
      queryClient.invalidateQueries({ queryKey: dealsQueryKey })
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })
}

export function useUpdateDealStatus(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: UpdateDealStatusBody) => updateDealStatus(id, body),
    onSuccess: (deal) => {
      queryClient.setQueryData(dealQueryKey(id), deal)
      queryClient.invalidateQueries({ queryKey: dealsQueryKey })
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      queryClient.invalidateQueries({ queryKey: ['offers'] })
    },
  })
}
