import { useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { PatientListItem } from '@/api/queries/patients'
import { vitalsKeys, fetchLatestVital, fetchRecentVitals } from '@/api/queries/vitals'
import { VitalBadge } from '@/components/dashboard/VitalBadge'
import { VitalSparkline } from '@/components/dashboard/VitalSparkline'
import {
  evaluateHeartRate,
  evaluateBPSystolic,
  evaluateSpO2,
  evaluateTemperature,
  worstOfFour,
} from '@/lib/thresholds'
import type { ThresholdResult } from '@/lib/thresholds'
import { formatVitalValue, formatBP, calculateAge } from '@/lib/vitals-format'
import { cn } from '@/lib/utils'

export interface PatientOverviewCardProps {
  patient: PatientListItem
  onClick: () => void
}

/** Tailwind border-l color class from threshold status (left accent border). Clinical colors are preserved. */
function borderColorClass(result: ThresholdResult): string {
  switch (result.level) {
    case 'critical':
      return 'border-l-red-500'
    case 'concerning':
      return 'border-l-amber-500'
    case 'normal':
      return 'border-l-emerald-500'
    default:
      return 'border-l-border'
  }
}

/** Map threshold level to a CSS variable reference for sparkline stroke. Dark-mode-aware via CSS variables. */
function sparklineColor(result: ThresholdResult): string {
  switch (result.level) {
    case 'critical':
      return '#ef4444' // red-500 — clinical color, intentionally hardcoded for clinical clarity
    case 'concerning':
      return '#f59e0b' // amber-500 — clinical color
    case 'normal':
      return '#10b981' // emerald-500 — clinical color
    default:
      return 'var(--color-muted-foreground, #9ca3af)'
  }
}

/**
 * Patient overview card for the dashboard grid.
 * Shows patient info, 4 vital badges with dual encoding, mini sparklines,
 * severity-colored left border, and background flash on value change.
 *
 * Warm design: rounded-2xl card with subtle shadow, semantic colors throughout.
 * Clinical status colors (emerald/amber/red) are intentionally preserved per RTMON-09.
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

  // Background flash on vital value change — uses bg-primary/5 (warm tint)
  const prevValsRef = useRef<string>('')
  const flashRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!latest) return
    const valsKey = `${latest.heartRate}-${latest.bpSystolic}-${latest.spo2}-${latest.temperature}`
    if (prevValsRef.current && prevValsRef.current !== valsKey) {
      const el = flashRef.current
      if (el) {
        el.classList.add('bg-primary/5')
        const timeout = setTimeout(() => el.classList.remove('bg-primary/5'), 200)
        return () => clearTimeout(timeout)
      }
    }
    prevValsRef.current = valsKey
  }, [latest])

  const age = calculateAge(patient.dateOfBirth)
  const recentData = recent ?? []

  const vitals = [
    {
      label: 'HR',
      value: formatVitalValue('heartRate', latest?.heartRate ?? null),
      threshold: hrResult,
      sparkKey: 'heartRate' as const,
    },
    {
      label: 'BP',
      value: formatBP(latest?.bpSystolic ?? null, latest?.bpDiastolic ?? null),
      threshold: bpResult,
      sparkKey: 'bpSystolic' as const,
    },
    {
      label: 'SpO2',
      value: formatVitalValue('spo2', latest?.spo2 ?? null),
      threshold: spo2Result,
      sparkKey: 'spo2' as const,
    },
    {
      label: 'Temp',
      value: formatVitalValue('temperature', latest?.temperature ?? null),
      threshold: tempResult,
      sparkKey: 'temperature' as const,
    },
  ]

  return (
    <div
      ref={flashRef}
      onClick={onClick}
      className={cn(
        // Warm Card styling: rounded-2xl matches card.tsx, bg-card is warm off-white/dark-brown
        'cursor-pointer rounded-2xl border border-l-4 bg-card p-4',
        // Subtle shadow with warm hover elevation
        'shadow-sm transition-all duration-200 hover:shadow-md hover:border-border/80',
        borderColorClass(worst),
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
      {/* Header: patient name and demographic info */}
      <div className="mb-3">
        <h3 className="text-sm font-semibold leading-tight text-foreground">
          {patient.firstName} {patient.lastName}
        </h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {age} y/o &middot; {patient.primaryCondition ?? 'No condition noted'}
        </p>
      </div>

      {/* Vitals 2x2 grid */}
      <div className="grid grid-cols-2 gap-3">
        {vitals.map((v) => (
          <div key={v.label} className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">{v.label}</span>
              <VitalBadge label={v.value} threshold={v.threshold} size="sm" />
            </div>
            <VitalSparkline
              data={recentData}
              dataKey={v.sparkKey}
              color={sparklineColor(v.threshold)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
