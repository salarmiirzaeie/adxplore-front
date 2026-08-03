import { useQuery } from '@tanstack/react-query'
import { getInfluencer, listInfluencers } from '../api/influencers'
import { getAccessToken } from '../lib/auth-storage'
import type { ListInfluencersParams } from '../types/api'

export const influencersQueryKey = ['influencers'] as const

export function influencersListKey(params: ListInfluencersParams) {
  return [...influencersQueryKey, 'list', params] as const
}

export function influencerQueryKey(id: string) {
  return [...influencersQueryKey, id] as const
}

export function useInfluencers(params: ListInfluencersParams = {}, enabled = true) {
  return useQuery({
    queryKey: influencersListKey(params),
    queryFn: () => listInfluencers(params),
    enabled: enabled && Boolean(getAccessToken()),
    staleTime: 30_000,
  })
}

export function useInfluencer(id: string | undefined, enabled = true) {
  return useQuery({
    queryKey: influencerQueryKey(id ?? ''),
    queryFn: () => getInfluencer(id!),
    enabled: enabled && Boolean(id) && Boolean(getAccessToken()),
    staleTime: 30_000,
    retry: false,
  })
}
