import type { Server } from 'socket.io'
import type {
  VitalReadingPayload,
  SimulatorEventPayload,
  ServerToClientEvents,
  ClientToServerEvents,
} from '@openpulse/shared'

type TypedServer = Server<ClientToServerEvents, ServerToClientEvents>

/**
 * Accumulates vital readings and flushes them to Socket.io rooms
 * on a configurable interval (default 1 second).
 *
 * Each reading is emitted to the patient-specific room `patient:{id}`,
 * so healthcare pros (who join all patient rooms) receive all updates,
 * and patients only receive their own.
 *
 * Latest-per-patient semantics: if multiple readings arrive for the
 * same patient within one flush interval, only the latest is emitted.
 */
export class BatchEmitter {
  private buffer: Map<number, VitalReadingPayload> = new Map()
  private intervalId: ReturnType<typeof setInterval> | null = null

  constructor(
    private io: TypedServer,
    private flushIntervalMs = 1000,
  ) {}

  /** Add a reading to the buffer. Latest per patient wins. */
  enqueue(reading: VitalReadingPayload): void {
    this.buffer.set(reading.patientId, reading)
  }

  /** Start the periodic flush timer. */
  start(): void {
    if (this.intervalId) return
    this.intervalId = setInterval(() => this.flush(), this.flushIntervalMs)
  }

  /** Stop the periodic flush timer. */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }

  /**
   * Emit a simulator event to ALL connected sockets immediately.
   * These are not batched -- they are low-frequency informational events.
   */
  emitEvent(event: SimulatorEventPayload): void {
    this.io.emit('simulator:event', event)
  }

  /** Flush all buffered readings to their respective patient rooms. */
  private flush(): void {
    if (this.buffer.size === 0) return

    for (const [patientId, reading] of this.buffer) {
      this.io.to(`patient:${patientId}`).emit('vitals:update', reading)
    }

    this.buffer.clear()
  }
}
