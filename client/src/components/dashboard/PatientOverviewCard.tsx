import { useQuery } from '@tanstack/react-query'
import type { PatientListItem } from '@/api/queries/patients'
import { vitalsKeys, fetchLatestVital, fetchRecentVitals } from '@/api/queries/vitals'
import { VitalSparkline } from '@/components/dashboard/VitalSparkline'
import {
  evaluateHeartRate,
  evaluateBPSystolic,
  evaluateSpO2,
  evaluateTemperature,
  worstOfFour,
} from '@/lib/thresholds'
import { formatVitalValue, formatBP, calculateAge } from '@/lib/vitals-format'
import { cn } from '@/lib/utils'

export interface PatientOverviewCardProps {
  patient: PatientListItem
  onClick: () => void
}

/** Map threshold level to a CSS hex color for sparkline stroke. Clinical colors intentionally hardcoded. */
function sparklineColor(level: string): string {
  switch (level) {
    case 'critical':
      return '#ef4444' // red-500 — clinical color
    case 'concerning':
      return '#f59e0b' // amber-500 — clinical color
    case 'normal':
      return '#10b981' // emerald-500 — clinical color
    default:
      return 'var(--color-muted-foreground, #9ca3af)'
  }
}

/** Worst-of-four status dot color class. */
function statusDotClass(level: string): string {
  switch (level) {
    case 'critical':
      return 'bg-red-500'
    case 'concerning':
      return 'bg-amber-500'
    case 'normal':
      return 'bg-emerald-500'
    default:
      return 'bg-border'
  }
}

/**
 * Patient overview card for the dashboard — single-column layout.
 * Shows patient name/age with 2x2 grid of vital labels, colored text values, and 70px sparklines.
 * Apple Health aesthetic: no left border accent, no background flash, no badge pills.
 */
export function PatientOverviewCard({ patient, onClick }: PatientOverviewCardProps) {
  const { data: latest } = useQuery({
    queryKey: vitalsKeys.latest(patient.id),
    queryFn: () => fetchLatestVital(patient.id),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  })

  const { data: recent } = useQuery({
    queryKey: vitalsKeys.recent(patient.id),
    queryFn: () => fetchRecentVitals(patient.id),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  })

  // Threshold evaluations
  const hrResult = evaluateHeartRate(latest?.heartRate ?? null)
  const bpResult = evaluateBPSystolic(latest?.bpSystolic ?? null)
  const spo2Result = evaluateSpO2(latest?.spo2 ?? null)
  const tempResult = evaluateTemperature(latest?.temperature ?? null)
  const worst = worstOfFour([hrResult, bpResult, spo2Result, tempResult])

  const age = calculateAge(patient.dateOfBirth)
  const recentData = recent ?? []

  const vitals = [
    {
      label: 'HR',
      value: formatVitalValue('heartRate', latest?.heartRate ?? null),
      valueTextClass: hrResult.valueTextClass,
      sparkColor: sparklineColor(hrResult.level),
      sparkKey: 'heartRate' as const,
    },
    {
      label: 'BP',
      value: formatBP(latest?.bpSystolic ?? null, latest?.bpDiastolic ?? null),
      valueTextClass: bpResult.valueTextClass,
      sparkColor: sparklineColor(bpResult.level),
      sparkKey: 'bpSystolic' as const,
    },
    {
      label: 'SpO2',
      value: formatVitalValue('spo2', latest?.spo2 ?? null),
      valueTextClass: spo2Result.valueTextClass,
      sparkColor: sparklineColor(spo2Result.level),
      sparkKey: 'spo2' as const,
    },
    {
      label: 'Temp',
      value: formatVitalValue('temperature', latest?.temperature ?? null),
      valueTextClass: tempResult.valueTextClass,
      sparkColor: sparklineColor(tempResult.level),
      sparkKey: 'temperature' as const,
    },
  ]

  return (
    <div
      onClick={onClick}
      className={cn(
        // Apple Health minimal card — no left border accent
        'cursor-pointer rounded-2xl border border-border/50 bg-card p-4',
        'shadow-sm transition-shadow duration-200 hover:shadow-md',
      )}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
    >
      {/* Header: patient name + age left, worst status dot right */}
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h3 className="text-base font-semibold leading-tight text-foreground">
            {patient.firstName} {patient.lastName}
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {age} y/o &middot; {patient.primaryCondition ?? 'No condition noted'}
          </p>
        </div>
        {/* Worst-of-four status dot */}
        <span
          className={cn('mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full', statusDotClass(worst.level))}
          aria-label={`Patient status: ${worst.level}`}
        />
      </div>

      {/* Vitals 2x2 grid — label + colored value + full-width sparkline */}
      <div className="grid grid-cols-2 gap-3">
        {vitals.map((v) => (
          <div key={v.label} className="flex flex-col gap-1">
            {/* Label + value on one line */}
            <div className="flex items-baseline gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">{v.label}</span>
              <span className={cn('text-sm font-bold tabular-nums', v.valueTextClass)}>
                {v.value}
              </span>
            </div>
            {/* Full-width 70px sparkline */}
            <VitalSparkline
              data={recentData}
              dataKey={v.sparkKey}
              color={v.sparkColor}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
