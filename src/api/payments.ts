import { api } from './client'
import type { Payment, PaymentRequestResult, PaymentStatusResult } from '../types/api'

export async function requestDealPayment(dealId: string) {
  const { data } = await api.post<PaymentRequestResult>(
    `/v1/payments/deals/${dealId}/request`,
  )
  return data
}

export async function getDealPaymentStatus(dealId: string) {
  const { data } = await api.get<PaymentStatusResult>(
    `/v1/payments/deals/${dealId}/status`,
  )
  return data
}

export async function getDealPayment(dealId: string) {
  const { data } = await api.get<Payment>(`/v1/payments/deals/${dealId}`)
  return data
}
