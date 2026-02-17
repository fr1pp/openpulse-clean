// Placeholder for Phase 3. Define the contract now, implement later.
export interface ServerToClientEvents {
  'vitals:update': (reading: {
    patientId: number
    heartRate: number | null
    bpSystolic: number | null
    bpDiastolic: number | null
    spo2: number | null
    temperature: number | null
    isAnomaly: boolean
    recordedAt: string
  }) => void
}

export interface ClientToServerEvents {
  'vitals:subscribe': (data: { patientId: number }) => void
  'vitals:unsubscribe': (data: { patientId: number }) => void
}
