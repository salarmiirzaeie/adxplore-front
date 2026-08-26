import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  createOffer,
  getOffer,
  listOffers,
  updateOfferStatus,
} from '../api/offers'
import { getAccessToken } from '../lib/auth-storage'
import type { CreateOfferBody, UpdateOfferStatusBody } from '../types/api'

export const offersQueryKey = ['offers'] as const

export function offerQueryKey(id: string) {
  return ['offers', id] as const
}

export function useOffers(campaignId?: string, enabled = true) {
  return useQuery({
    queryKey: [...offersQueryKey, campaignId ?? 'all'],
    queryFn: () => listOffers(campaignId),
    enabled: enabled && Boolean(getAccessToken()),
    staleTime: 30_000,
  })
}

export function useOffer(id: string | undefined, enabled = true) {
  return useQuery({
    queryKey: offerQueryKey(id ?? ''),
    queryFn: () => getOffer(id!),
    enabled: enabled && Boolean(id) && Boolean(getAccessToken()),
    staleTime: 30_000,
    retry: false,
  })
}

export function useCreateOffer() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (body: CreateOfferBody) => createOffer(body),
    onSuccess: (offer) => {
      queryClient.invalidateQueries({ queryKey: offersQueryKey })
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      queryClient.setQueryData(offerQueryKey(offer.id), offer)
      navigate(`/app/messages/${offer.id}`, { replace: true })
    },
  })
}

export function useUpdateOfferStatus(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: UpdateOfferStatusBody) => updateOfferStatus(id, body),
    onSuccess: (offer, body) => {
      queryClient.setQueryData(offerQueryKey(id), offer)
      queryClient.invalidateQueries({ queryKey: offersQueryKey })
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      queryClient.invalidateQueries({ queryKey: ['conversations', 'messages'] })
      if (body.status === 'ACCEPTED') {
        queryClient.invalidateQueries({ queryKey: ['deals'] })
      }
    },
  })
}
