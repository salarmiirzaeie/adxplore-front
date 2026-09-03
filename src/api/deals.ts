import { api } from './client'
import type {
  Deal,
  SubmitDeliverableBody,
  UpdateDealStatusBody,
} from '../types/api'

const MEDIA_TIMEOUT_MS = 180_000

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
  form.append('kind', body.kind)
  if (body.contentUrl) form.append('contentUrl', body.contentUrl)
  if (body.note) form.append('note', body.note)
  if (body.file) form.append('file', body.file)
  if (body.proof) form.append('proof', body.proof)
  const { data } = await api.post<Deal>(`/v1/deals/${id}/deliverable`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: MEDIA_TIMEOUT_MS,
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
