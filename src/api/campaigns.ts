import { api } from './client'
import type {
  Campaign,
  CreateCampaignBody,
  UpdateCampaignBody,
} from '../types/api'

export async function listCampaigns(): Promise<Campaign[]> {
  const { data } = await api.get<Campaign[]>('/v1/campaigns')
  return data
}

export async function getCampaign(id: string): Promise<Campaign> {
  const { data } = await api.get<Campaign>(`/v1/campaigns/${id}`)
  return data
}

export async function createCampaign(body: CreateCampaignBody): Promise<Campaign> {
  const { data } = await api.post<Campaign>('/v1/campaigns', body)
  return data
}

export async function updateCampaign(
  id: string,
  body: UpdateCampaignBody,
): Promise<Campaign> {
  const { data } = await api.patch<Campaign>(`/v1/campaigns/${id}`, body)
  return data
}

export async function uploadCampaignImages(
  id: string,
  files: File[],
): Promise<Campaign> {
  const form = new FormData()
  for (const file of files) form.append('files', file)
  const { data } = await api.post<Campaign>(`/v1/campaigns/${id}/images`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function deleteCampaignImage(
  campaignId: string,
  imageId: string,
): Promise<Campaign> {
  const { data } = await api.delete<Campaign>(
    `/v1/campaigns/${campaignId}/images/${imageId}`,
  )
  return data
}
