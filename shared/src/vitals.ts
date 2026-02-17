export type VitalType = 'heartRate' | 'bpSystolic' | 'bpDiastolic' | 'spo2' | 'temperature'

export type ThresholdLevel = 'normal' | 'concerning' | 'critical'

export interface VitalThresholds {
  normal: [number, number]      // [min, max] inclusive
  concerning: [number, number]  // outside normal but not critical
  critical: [number, number]    // danger zone
}
