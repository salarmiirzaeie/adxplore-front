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

function isLatinHeavy(text: string): boolean {
  const latin = (text.match(/[A-Za-z]/g) ?? []).length
  const arabic = (text.match(/[\u0600-\u06FF]/g) ?? []).length
  return latin > 0 && latin >= arabic
}

function persianOrFallback(
  message: string | string[] | undefined,
  fallback: string,
): string {
  const parts = (Array.isArray(message) ? message : [message])
    .filter((item): item is string => typeof item === 'string' && Boolean(item.trim()))
    .map((item) => item.trim())
    .filter((item) => !isLatinHeavy(item))
  return parts.length > 0 ? parts.join('، ') : fallback
}

export function getApiErrorMessage(error: unknown, fallback = 'خطایی رخ داد'): string {
  if (!axios.isAxiosError(error)) {
    if (error instanceof Error) return persianOrFallback(error.message, fallback)
    return fallback
  }

  const data = error.response?.data as ApiErrorBody | undefined
  const fromApi = persianOrFallback(data?.message, '')
  if (fromApi) return fromApi

  if (error.response?.status === 429) {
    return 'لطفاً کمی صبر کنید و دوباره تلاش کنید'
  }
  if (error.code === 'ERR_NETWORK') {
    return 'اتصال به سرور برقرار نشد'
  }

  return fallback
}
