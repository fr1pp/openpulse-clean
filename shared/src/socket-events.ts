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

/** Time range options for historical chart queries */
export type TimeRange = '1h' | '6h' | '24h' | '7d' | '30d'

/** Aggregation bucket sizes for server-side averaging */
export type AggregationBucket = '1m' | '5m' | '30m' | '2h'

/**
 * Unified response shape for both raw and aggregated historical readings.
 * Raw readings: avg fields contain actual values, min/max are undefined.
 * Aggregated readings: avg/min/max all populated.
 */
export interface HistoricalReading {
  recordedAt: string
  heartRate: number | null
  bpSystolic: number | null
  bpDiastolic: number | null
  spo2: number | null
  temperature: number | null
  // Min/max only present for aggregated data
  heartRateMin?: number | null
  heartRateMax?: number | null
  bpSystolicMin?: number | null
  bpSystolicMax?: number | null
  bpDiastolicMin?: number | null
  bpDiastolicMax?: number | null
  spo2Min?: number | null
  spo2Max?: number | null
  temperatureMin?: number | null
  temperatureMax?: number | null
}
