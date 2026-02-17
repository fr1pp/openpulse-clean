import type { Server, Socket } from 'socket.io'
import { eq } from 'drizzle-orm'
import type {
  ServerToClientEvents,
  ClientToServerEvents,
} from '@openpulse/shared'
import type { AuthPayload } from '../middleware/auth.js'
import { getDb } from '../db/connection.js'
import { patients } from '../db/schema.js'

type TypedServer = Server<ClientToServerEvents, ServerToClientEvents>
type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents>

/**
 * Handle a new socket connection.
 *
 * Room strategy (avoids duplicate-delivery pitfall):
 * - Healthcare pros join every individual patient room (`patient:{id}`)
 *   so they receive all updates without a separate "all-patients" room.
 * - Patients join only their own room (`patient:{sub}`).
 */
export function handleConnection(io: TypedServer, socket: TypedSocket): void {
  const user = socket.data.user as AuthPayload

  if (user.role === 'healthcare_pro') {
    // Join all active patient rooms
    const db = getDb()
    const activePatients = db
      .select({ id: patients.id })
      .from(patients)
      .where(eq(patients.isActive, true))
      .all()

    for (const patient of activePatients) {
      socket.join(`patient:${patient.id}`)
    }

    console.log(
      `[Socket] Healthcare pro ${user.sub} connected, joined ${activePatients.length} patient rooms`,
    )
  } else if (user.role === 'patient') {
    // Patient joins only their own room
    socket.join(`patient:${user.sub}`)
    console.log(`[Socket] Patient ${user.sub} connected, joined own room`)
  }

  // Allow healthcare pros to subscribe/unsubscribe from specific patient rooms
  socket.on('vitals:subscribe', ({ patientId }) => {
    if (user.role === 'healthcare_pro') {
      socket.join(`patient:${patientId}`)
    }
    // Patients MUST NOT subscribe to other patient rooms (hard security requirement)
  })

  socket.on('vitals:unsubscribe', ({ patientId }) => {
    if (user.role === 'healthcare_pro') {
      socket.leave(`patient:${patientId}`)
    }
  })

  socket.on('disconnect', (reason) => {
    console.log(
      `[Socket] ${user.role} ${user.sub} disconnected: ${reason}`,
    )
  })
}
