export interface PatientBaseline {
  heartRate: { mean: number; stdDev: number }
  systolic: { mean: number; stdDev: number }
  diastolic: { mean: number; stdDev: number }
  spo2: { mean: number; stdDev: number }
  temperature: { mean: number; stdDev: number }
}

export type Gender = 'male' | 'female' | 'other'
