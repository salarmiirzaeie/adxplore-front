import { api } from './client'
import type { InfluencerCard, ListInfluencersParams } from '../types/api'

export async function listInfluencers(
  params: ListInfluencersParams = {},
): Promise<InfluencerCard[]> {
  const { data } = await api.get<InfluencerCard[]>('/v1/influencers', { params })
  return data
}

export async function getInfluencer(id: string): Promise<InfluencerCard> {
  const { data } = await api.get<InfluencerCard>(`/v1/influencers/${id}`)
  return data
}
