import { api } from './client'
import type {
  BankCard,
  UpsertBankCardBody,
  Wallet,
  WalletTransaction,
} from '../types/api'

export async function getMyWallet() {
  const { data } = await api.get<Wallet>('/v1/wallets/me')
  return data
}

export async function getMyWalletTransactions(take = 50) {
  const { data } = await api.get<WalletTransaction[]>(
    '/v1/wallets/me/transactions',
    { params: { take } },
  )
  return data
}

export async function upsertMyBankCard(body: UpsertBankCardBody) {
  const { data } = await api.put<BankCard>('/v1/wallets/me/bank-card', body)
  return data
}

export async function requestWalletWithdraw(amountToman: number) {
  const { data } = await api.post<{
    wallet: Wallet
    transaction: WalletTransaction
  }>('/v1/wallets/me/withdraw', { amountToman })
  return data
}
