import { useMutation } from '@tanstack/react-query'
import { createSupportTicket } from '../api/support'
import type { CreateSupportTicketBody } from '../types/api'

export function useCreateSupportTicket() {
  return useMutation({
    mutationFn: (body: CreateSupportTicketBody) => createSupportTicket(body),
  })
}
