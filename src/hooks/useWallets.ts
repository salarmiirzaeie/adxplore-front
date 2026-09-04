import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'
import {
  getMyWallet,
  getMyWalletTransactions,
  requestWalletWithdraw,
  upsertMyBankCard,
} from '../api/wallets'
import { getAccessToken } from '../lib/auth-storage'
import type { UpsertBankCardBody } from '../types/api'

export const walletQueryKey = ['wallet', 'me'] as const
export const walletTxQueryKey = ['wallet', 'transactions'] as const

export function invalidateWalletQueries(qc: QueryClient) {
  void qc.invalidateQueries({ queryKey: walletQueryKey })
  void qc.invalidateQueries({ queryKey: walletTxQueryKey })
}

export function useMyWallet(enabled = true) {
  return useQuery({
    queryKey: walletQueryKey,
    queryFn: getMyWallet,
    enabled: enabled && Boolean(getAccessToken()),
    staleTime: 15_000,
  })
}

export function useWalletTransactions(enabled = true) {
  return useQuery({
    queryKey: walletTxQueryKey,
    queryFn: () => getMyWalletTransactions(50),
    enabled: enabled && Boolean(getAccessToken()),
    staleTime: 15_000,
  })
}

export function useUpsertBankCard() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: UpsertBankCardBody) => upsertMyBankCard(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: walletQueryKey })
    },
  })
}

export function useRequestWithdraw() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (amountToman: number) => requestWalletWithdraw(amountToman),
    onSuccess: () => {
      invalidateWalletQueries(qc)
    },
  })
}
