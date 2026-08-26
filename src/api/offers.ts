import { api } from './client'
import type {
  CreateOfferBody,
  Offer,
  UpdateOfferStatusBody,
} from '../types/api'

export async function listOffers(campaignId?: string): Promise<Offer[]> {
  const { data } = await api.get<Offer[]>('/v1/offers', {
    params: campaignId ? { campaignId } : undefined,
  })
  return data
}

export async function getOffer(id: string): Promise<Offer> {
  const { data } = await api.get<Offer>(`/v1/offers/${id}`)
  return data
}

export async function createOffer(body: CreateOfferBody): Promise<Offer> {
  const { data } = await api.post<Offer>('/v1/offers', body)
  return data
}

export async function updateOfferStatus(
  id: string,
  body: UpdateOfferStatusBody,
): Promise<Offer> {
  const { data } = await api.patch<Offer>(`/v1/offers/${id}`, body)
  return data
}
