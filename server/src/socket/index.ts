import type { Server as HttpServer } from 'http'
import { Server } from 'socket.io'
import { parse as parseCookie } from 'cookie'
import jwt from 'jsonwebtoken'
import type {
  ServerToClientEvents,
  ClientToServerEvents,
} from '@openpulse/shared'
import type { AuthPayload } from '../middleware/auth.js'
import { config } from '../lib/config.js'
import { handleConnection } from './handlers.js'

export type TypedServer = Server<ClientToServerEvents, ServerToClientEvents>

/**
 * Initialize Socket.io server with JWT cookie authentication and room management.
 *
 * Auth flow:
 * 1. Parse cookies from the handshake request headers
 * 2. Extract the `token` cookie (same httpOnly cookie used by Express auth)
 * 3. Verify JWT and attach decoded payload to `socket.data.user`
 * 4. On connection, delegate to handleConnection for room joining
 */
export function initSocketServer(httpServer: HttpServer): TypedServer {
  const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: {
      origin: process.env.NODE_ENV === 'production'
        ? process.env.CLIENT_URL
        : 'http://localhost:5173',
      credentials: true,
    },
  })

  // JWT auth middleware -- parse cookie manually for reliability
  // (io.engine.use(cookieParser()) may not always attach .cookies to
  // the Engine.IO request object, so we parse from the raw header)
  io.use((socket, next) => {
    const rawCookie = socket.request.headers.cookie
    if (!rawCookie) {
      return next(new Error('Authentication required'))
    }

    const cookies = parseCookie(rawCookie)
    const token = cookies.token
    if (!token) {
      return next(new Error('Authentication required'))
    }

    try {
      const decoded = jwt.verify(token, config.jwtSecret) as unknown as AuthPayload
      socket.data.user = decoded
      next()
    } catch {
      next(new Error('Invalid or expired token'))
    }
  })

  // Handle new connections
  io.on('connection', (socket) => {
    handleConnection(io, socket)
  })

  return io
}
