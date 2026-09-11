import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  browseCampaigns,
  createCampaign,
  deleteCampaignImage,
  getCampaign,
  listCampaigns,
  reorderCampaignImages,
  updateCampaign,
  uploadCampaignImages,
} from '../api/campaigns'
import { isCampaignAcceptingInvites } from '../lib/brand-options'
import { getAccessToken } from '../lib/auth-storage'
import type {
  BrowseCampaignsParams,
  Campaign,
  CreateCampaignBody,
  UpdateCampaignBody,
} from '../types/api'

export const campaignsQueryKey = ['campaigns'] as const
export const browseCampaignsQueryKey = ['campaigns', 'browse'] as const

export function campaignQueryKey(id: string) {
  return ['campaigns', id] as const
}

export function useCampaigns(enabled = true) {
  return useQuery({
    queryKey: campaignsQueryKey,
    queryFn: listCampaigns,
    enabled: enabled && Boolean(getAccessToken()),
    staleTime: 30_000,
  })
}

export function useBrowseCampaigns(
  params: BrowseCampaignsParams = {},
  enabled = true,
) {
  return useQuery({
    queryKey: [...browseCampaignsQueryKey, params],
    queryFn: () => browseCampaigns(params),
    enabled: enabled && Boolean(getAccessToken()),
    staleTime: 30_000,
  })
}

export function useCampaign(id: string | undefined, enabled = true) {
  return useQuery({
    queryKey: campaignQueryKey(id ?? ''),
    queryFn: () => getCampaign(id!),
    enabled: enabled && Boolean(id) && Boolean(getAccessToken()),
    staleTime: 30_000,
    retry: false,
  })
}

export function useCreateCampaign() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async ({
      body,
      files,
    }: {
      body: CreateCampaignBody
      files?: File[]
    }) => {
      const campaign = await createCampaign(body)
      if (files?.length) {
        return uploadCampaignImages(campaign.id, files)
      }
      return campaign
    },
    onSuccess: (campaign) => {
      queryClient.invalidateQueries({ queryKey: campaignsQueryKey })
      queryClient.setQueryData(campaignQueryKey(campaign.id), campaign)
      const invite = isCampaignAcceptingInvites(campaign.status)
        ? '?invite=1'
        : ''
      navigate(`/app/campaigns/${campaign.id}${invite}`, { replace: true })
    },
  })
}

export function useUpdateCampaign(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: UpdateCampaignBody) => updateCampaign(id, body),
    onSuccess: (campaign) => {
      queryClient.setQueryData(campaignQueryKey(id), campaign)
      queryClient.invalidateQueries({ queryKey: campaignsQueryKey })
    },
  })
}

export function useUploadCampaignImages(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (files: File[]) => uploadCampaignImages(id, files),
    onSuccess: (campaign) => {
      queryClient.setQueryData(campaignQueryKey(id), campaign)
      queryClient.invalidateQueries({ queryKey: campaignsQueryKey })
    },
  })
}

export function useDeleteCampaignImage(campaignId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (imageId: string) => deleteCampaignImage(campaignId, imageId),
    onSuccess: (campaign) => {
      queryClient.setQueryData(campaignQueryKey(campaignId), campaign)
      queryClient.invalidateQueries({ queryKey: campaignsQueryKey })
    },
  })
}

export function useReorderCampaignImages(campaignId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (imageIds: string[]) =>
      reorderCampaignImages(campaignId, imageIds),
    onMutate: async (imageIds) => {
      await queryClient.cancelQueries({ queryKey: campaignQueryKey(campaignId) })
      const previous = queryClient.getQueryData<Campaign>(
        campaignQueryKey(campaignId),
      )
      if (previous) {
        const byId = new Map(previous.images.map((img) => [img.id, img]))
        queryClient.setQueryData<Campaign>(campaignQueryKey(campaignId), {
          ...previous,
          images: imageIds.flatMap((id, sortOrder) => {
            const img = byId.get(id)
            return img ? [{ ...img, sortOrder }] : []
          }),
        })
      }
      return { previous }
    },
    onError: (_error, _imageIds, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          campaignQueryKey(campaignId),
          context.previous,
        )
      }
    },
    onSuccess: (campaign) => {
      queryClient.setQueryData(campaignQueryKey(campaignId), campaign)
      queryClient.invalidateQueries({ queryKey: campaignsQueryKey })
    },
  })
}
