import type { VitalReadingPayload } from '@openpulse/shared'
import { VitalBadge } from '@/components/dashboard/VitalBadge'
import { formatVitalValue, formatBP } from '@/lib/vitals-format'
import {
  evaluateHeartRate,
  evaluateBPSystolic,
  evaluateSpO2,
  evaluateTemperature,
} from '@/lib/thresholds'

export interface VitalStripProps {
  latest: VitalReadingPayload | null
}

/**
 * Compact row of 4 small vital value badges.
 * Placed between breadcrumb and chart grid for at-a-glance status.
 */
export function VitalStrip({ latest }: VitalStripProps) {
  const hr = latest?.heartRate ?? null
  const sys = latest?.bpSystolic ?? null
  const dia = latest?.bpDiastolic ?? null
  const spo2 = latest?.spo2 ?? null
  const temp = latest?.temperature ?? null

  return (
    <div className="flex flex-wrap items-center gap-2">
      <VitalBadge
        label={formatVitalValue('heartRate', hr)}
        threshold={evaluateHeartRate(hr)}
        size="sm"
      />
      <VitalBadge
        label={formatBP(sys, dia)}
        threshold={evaluateBPSystolic(sys)}
        size="sm"
      />
      <VitalBadge
        label={formatVitalValue('spo2', spo2)}
        threshold={evaluateSpO2(spo2)}
        size="sm"
      />
      <VitalBadge
        label={formatVitalValue('temperature', temp)}
        threshold={evaluateTemperature(temp)}
        size="sm"
      />
    </div>
  )
}
