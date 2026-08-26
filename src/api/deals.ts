import { api } from './client'
import type {
  Deal,
  SubmitDeliverableBody,
  UpdateDealStatusBody,
} from '../types/api'

export async function listDeals(campaignId?: string): Promise<Deal[]> {
  const { data } = await api.get<Deal[]>('/v1/deals', {
    params: campaignId ? { campaignId } : undefined,
  })
  return data
}

export async function getDeal(id: string): Promise<Deal> {
  const { data } = await api.get<Deal>(`/v1/deals/${id}`)
  return data
}

export async function submitDeliverable(
  id: string,
  body: SubmitDeliverableBody,
): Promise<Deal> {
  const form = new FormData()
  form.append('contentUrl', body.contentUrl)
  if (body.note) form.append('note', body.note)
  if (body.proof) form.append('proof', body.proof)
  const { data } = await api.post<Deal>(`/v1/deals/${id}/deliverable`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function updateDealStatus(
  id: string,
  body: UpdateDealStatusBody,
): Promise<Deal> {
  const { data } = await api.patch<Deal>(`/v1/deals/${id}`, body)
  return data
}
