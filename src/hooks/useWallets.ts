import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getMyWallet,
  getMyWalletTransactions,
  requestWalletWithdraw,
} from '../api/wallets'
import { getAccessToken } from '../lib/auth-storage'

export const walletQueryKey = ['wallet', 'me'] as const
export const walletTxQueryKey = ['wallet', 'transactions'] as const

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

export function useRequestWithdraw() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (amountToman: number) => requestWalletWithdraw(amountToman),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: walletQueryKey })
      qc.invalidateQueries({ queryKey: walletTxQueryKey })
    },
  })
}
