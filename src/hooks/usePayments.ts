import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getDealPayment,
  getDealPaymentStatus,
  requestDealPayment,
} from '../api/payments'
import { getAccessToken } from '../lib/auth-storage'
import { dealsQueryKey, dealQueryKey } from './useDeals'

export function paymentStatusKey(dealId: string) {
  return ['payments', 'status', dealId] as const
}

export function useDealPayment(dealId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['payments', dealId ?? ''],
    queryFn: () => getDealPayment(dealId!),
    enabled: enabled && Boolean(dealId) && Boolean(getAccessToken()),
    staleTime: 15_000,
    retry: false,
  })
}

export function useDealPaymentStatus(dealId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: paymentStatusKey(dealId ?? ''),
    queryFn: () => getDealPaymentStatus(dealId!),
    enabled: enabled && Boolean(dealId) && Boolean(getAccessToken()),
    staleTime: 5_000,
    refetchInterval: enabled ? 4_000 : false,
  })
}

export function useRequestDealPayment(dealId: string) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: () => requestDealPayment(dealId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: dealsQueryKey })
      qc.invalidateQueries({ queryKey: dealQueryKey(dealId) })
      qc.invalidateQueries({ queryKey: paymentStatusKey(dealId) })
      qc.invalidateQueries({ queryKey: ['conversations'] })
    },
  })
}
