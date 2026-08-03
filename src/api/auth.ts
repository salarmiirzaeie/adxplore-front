import { api } from './client'
import type {
  RequestOtpBody,
  RequestOtpResponse,
  VerifyOtpBody,
  VerifyOtpResponse,
} from '../types/api'

export async function requestOtp(body: RequestOtpBody): Promise<RequestOtpResponse> {
  const { data } = await api.post<RequestOtpResponse>('/v1/auth/otp/request', body)
  return data
}

export async function verifyOtp(body: VerifyOtpBody): Promise<VerifyOtpResponse> {
  const { data } = await api.post<VerifyOtpResponse>('/v1/auth/otp/verify', body)
  return data
}
