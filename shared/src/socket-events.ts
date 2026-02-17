// Socket.io typed events for real-time vital sign streaming and simulator control

export interface VitalReadingPayload {
  patientId: number
  heartRate: number | null
  bpSystolic: number | null
  bpDiastolic: number | null
  spo2: number | null
  temperature: number | null
  isAnomaly: boolean
  recordedAt: string
}

export interface SimulatorStatusPayload {
  running: boolean
  speed: number
  simulatedTime: string
  patientCount: number
}

export interface SimulatorEventPayload {
  type: string
  patientId: number
  patientName: string
  message: string
  timestamp: string
}

export interface ServerToClientEvents {
  'vitals:update': (reading: VitalReadingPayload) => void
  'vitals:batch': (readings: VitalReadingPayload[]) => void
  'simulator:status': (status: SimulatorStatusPayload) => void
  'simulator:event': (event: SimulatorEventPayload) => void
}

export interface ClientToServerEvents {
  'vitals:subscribe': (data: { patientId: number }) => void
  'vitals:unsubscribe': (data: { patientId: number }) => void
}
