import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { clearAccessToken, getAccessToken } from '../lib/auth-storage'
import type { ApiErrorBody } from '../types/api'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 30_000,
})

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>) => {
    if (error.response?.status === 401) {
      clearAccessToken()
      const path = window.location.pathname
      if (!path.startsWith('/login')) {
        window.location.assign('/login')
      }
    }
    return Promise.reject(error)
  },
)

export function getApiErrorMessage(error: unknown, fallback = 'خطایی رخ داد'): string {
  if (!axios.isAxiosError(error)) {
    if (error instanceof Error) return error.message
    return fallback
  }

  const data = error.response?.data as ApiErrorBody | undefined
  const msg = data?.message
  if (Array.isArray(msg)) return msg.join('، ')
  if (typeof msg === 'string' && msg.trim()) return msg

  if (error.response?.status === 429) {
    return 'لطفاً کمی صبر کنید و دوباره تلاش کنید'
  }
  if (error.code === 'ERR_NETWORK') {
    return 'اتصال به سرور برقرار نشد'
  }

  return fallback
}
