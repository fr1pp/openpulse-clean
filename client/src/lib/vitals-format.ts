import type { VitalType } from '@openpulse/shared'

/**
 * Format a vital sign value for display.
 * Returns '--' for null values, never NaN.
 */
export function formatVitalValue(type: VitalType, value: number | null): string {
  if (value === null || value === undefined) return '--'

  switch (type) {
    case 'heartRate':
      return `${Math.round(value)} bpm`
    case 'bpSystolic':
    case 'bpDiastolic':
      return `${Math.round(value)}`
    case 'spo2':
      return `${value.toFixed(1)}%`
    case 'temperature':
      return `${value.toFixed(1)} \u00B0C`
  }
}

/**
 * Format blood pressure as "systolic/diastolic mmHg".
 * Handles null values gracefully.
 */
export function formatBP(systolic: number | null, diastolic: number | null): string {
  const sys = systolic !== null && systolic !== undefined ? Math.round(systolic) : '--'
  const dia = diastolic !== null && diastolic !== undefined ? Math.round(diastolic) : '--'
  return `${sys}/${dia} mmHg`
}

/** Abbreviated clinical label for a vital type. */
export function vitalLabel(type: VitalType): string {
  switch (type) {
    case 'heartRate':
      return 'HR'
    case 'bpSystolic':
      return 'BP'
    case 'bpDiastolic':
      return 'BP'
    case 'spo2':
      return 'SpO2'
    case 'temperature':
      return 'Temp'
  }
}

/** Unit string for a vital type. */
export function vitalUnit(type: VitalType): string {
  switch (type) {
    case 'heartRate':
      return 'bpm'
    case 'bpSystolic':
    case 'bpDiastolic':
      return 'mmHg'
    case 'spo2':
      return '%'
    case 'temperature':
      return '\u00B0C'
  }
}

/** Calculate age in years from an ISO date-of-birth string. */
export function calculateAge(dateOfBirth: string): number {
  return Math.floor((Date.now() - new Date(dateOfBirth).getTime()) / 31557600000)
}
