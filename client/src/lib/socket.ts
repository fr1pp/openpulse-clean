import { io, type Socket } from 'socket.io-client'
import type { ServerToClientEvents, ClientToServerEvents } from '@openpulse/shared'

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io({
  // No explicit URL -- Vite proxy handles /socket.io (already configured)
  withCredentials: true, // Send cookies with handshake
  autoConnect: false, // Connect manually after auth verification
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 30000,
  randomizationFactor: 0.5,
})
