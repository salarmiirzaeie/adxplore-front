import axios from 'axios'
import { api } from './client'

export async function registerPushToken(token: string) {
  try {
    await api.put('/v1/push-tokens', { token, platform: 'WEB' })
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) return
    throw error
  }
}
