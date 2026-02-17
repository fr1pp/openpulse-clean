// Simulator types: scenario definitions, patient simulation state, dev panel API types

export type ScenarioId = 'bradycardia' | 'feverSpike' | 'desaturation' | 'hypertensiveCrisis'

export interface ScenarioDefinition {
  id: ScenarioId
  name: string
  description: string
  durationMs: number
  parameterOverrides: Record<string, { muShift?: number; sigmaMultiplier?: number; thetaMultiplier?: number }>
}

export interface PatientSimState {
  patientId: number
  patientName: string
  currentValues: {
    heartRate: number
    bpSystolic: number
    bpDiastolic: number
    spo2: number
    temperature: number
  }
  activeScenario: { id: ScenarioId; name: string; remainingMs: number } | null
  isAnomaly: boolean
}

export interface SimulatorStatus {
  running: boolean
  speed: number
  simulatedTime: string // ISO 8601
  patientCount: number
  patients: PatientSimState[]
}

export interface SimulatorEvent {
  type: 'threshold_entered' | 'threshold_exited' | 'anomaly_started' | 'anomaly_resolved' | 'scenario_started' | 'scenario_ended'
  patientId: number
  patientName: string
  message: string
  timestamp: string
}

// API request/response types for dev panel
export interface ApplyScenarioRequest {
  patientId: number
  scenarioId: ScenarioId
}

export interface SetSpeedRequest {
  speed: number
}

export interface ResetPatientRequest {
  patientId: number
}
