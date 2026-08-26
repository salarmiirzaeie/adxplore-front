import { io, type Socket } from 'socket.io-client'
import { getAccessToken } from '../lib/auth-storage'

let socket: Socket | null = null

function socketOrigin(): string {
  const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
  return base.replace(/\/v1\/?$/, '')
}

export function getChatSocket(): Socket {
  if (socket?.connected) return socket

  const token = getAccessToken()
  socket = io(`${socketOrigin()}/chat`, {
    autoConnect: false,
    auth: { token },
    transports: ['websocket', 'polling'],
  })

  return socket
}

export function connectChatSocket(): Socket {
  const s = getChatSocket()
  const token = getAccessToken()
  if (token) {
    s.auth = { token }
  }
  if (!s.connected) {
    s.connect()
  }
  return s
}

export function disconnectChatSocket(): void {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
