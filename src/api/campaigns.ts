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
