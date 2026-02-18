import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import { vitalsKeys, fetchLatestVital } from '@/api/queries/vitals'
import {
  evaluateHeartRate,
  evaluateBPSystolic,
  evaluateSpO2,
  evaluateTemperature,
} from '@/lib/thresholds'
import { formatVitalValue, formatBP } from '@/lib/vitals-format'
import { PortalGreeting } from '@/components/portal/PortalGreeting'
import { PatientVitalCard } from '@/components/portal/PatientVitalCard'
import { STATUS_PHRASES, ACTION_NUDGE, VITAL_LABELS } from '@/components/portal/portal-status'
import type { VitalReadingPayload } from '@openpulse/shared'

export const Route = createFileRoute('/portal/_portal/vitals')({
  component: VitalsPage,
})

interface VitalConfig {
  key: string
  label: string
  getValue: (d: VitalReadingPayload) => string
  getThreshold: (d: VitalReadingPayload) => ReturnType<typeof evaluateHeartRate>
}

const VITALS_CONFIG: VitalConfig[] = [
  {
    key: 'heartRate',
    label: VITAL_LABELS.heartRate,
    getValue: (d) => formatVitalValue('heartRate', d.heartRate),
    getThreshold: (d) => evaluateHeartRate(d.heartRate),
  },
  {
    key: 'bloodPressure',
    label: VITAL_LABELS.bloodPressure,
    getValue: (d) => formatBP(d.bpSystolic, d.bpDiastolic),
    getThreshold: (d) => evaluateBPSystolic(d.bpSystolic),
  },
  {
    key: 'spo2',
    label: VITAL_LABELS.spo2,
    getValue: (d) => formatVitalValue('spo2', d.spo2),
    getThreshold: (d) => evaluateSpO2(d.spo2),
  },
  {
    key: 'temperature',
    label: VITAL_LABELS.temperature,
    getValue: (d) => formatVitalValue('temperature', d.temperature),
    getThreshold: (d) => evaluateTemperature(d.temperature),
  },
]

function VitalsPage() {
  const { user } = useAuth()
  // Safe: _portal.tsx beforeLoad guards patient role, so user is always set here
  const patientId = user!.id

  const { data: latestData } = useQuery({
    queryKey: vitalsKeys.latest(patientId),
    queryFn: () => fetchLatestVital(patientId),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  })

  const [expandedVital, setExpandedVital] = useState<string | null>(null)

  const toggle = (key: string) =>
    setExpandedVital((prev) => (prev === key ? null : key))

  return (
    <div>
      <PortalGreeting firstName={user?.firstName} />

      <div className="flex flex-col gap-4">
        {VITALS_CONFIG.map(({ key, label, getValue, getThreshold }) => {
          const threshold = latestData
            ? getThreshold(latestData)
            : { level: 'unknown' as const, color: '', bgClass: '', textClass: '', borderClass: '', icon: 'Minus' as const }

          const value = latestData ? getValue(latestData) : '--'

          return (
            <PatientVitalCard
              key={key}
              label={label}
              value={value}
              statusPhrase={STATUS_PHRASES[threshold.level]}
              actionNudge={ACTION_NUDGE[threshold.level]}
              level={threshold.level}
              isExpanded={expandedVital === key}
              onToggle={() => toggle(key)}
            />
          )
        })}
      </div>
    </div>
  )
}
