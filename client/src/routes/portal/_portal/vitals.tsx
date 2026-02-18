import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import { vitalsKeys, fetchLatestVital, historicalVitalsQueryOptions } from '@/api/queries/vitals'
import {
  evaluateHeartRate,
  evaluateBPSystolic,
  evaluateSpO2,
  evaluateTemperature,
} from '@/lib/thresholds'
import { formatVitalValue, formatBP } from '@/lib/vitals-format'
import { PortalGreeting } from '@/components/portal/PortalGreeting'
import { PatientVitalCard } from '@/components/portal/PatientVitalCard'
import { PatientVitalAreaChart } from '@/components/portal/PatientVitalAreaChart'
import { STATUS_PHRASES, ACTION_NUDGE, VITAL_LABELS } from '@/components/portal/portal-status'
import { vitalChartConfig, vitalYDomains } from '@/components/charts/chart-config'
import type { VitalReadingPayload } from '@openpulse/shared'

export const Route = createFileRoute('/portal/_portal/vitals')({
  component: VitalsPage,
})

interface ChartConfig {
  dataKey: string
  color: string
  yDomain: [number, number]
  normalRange: { y1: number; y2: number }
}

interface VitalConfig {
  key: string
  label: string
  getValue: (d: VitalReadingPayload) => string
  getThreshold: (d: VitalReadingPayload) => ReturnType<typeof evaluateHeartRate>
  chart: ChartConfig
}

const VITALS_CONFIG: VitalConfig[] = [
  {
    key: 'heartRate',
    label: VITAL_LABELS.heartRate,
    getValue: (d) => formatVitalValue('heartRate', d.heartRate),
    getThreshold: (d) => evaluateHeartRate(d.heartRate),
    chart: {
      dataKey: 'heartRate',
      color: vitalChartConfig.heartRate.color,
      yDomain: vitalYDomains.heartRate,
      normalRange: { y1: 60, y2: 100 },
    },
  },
  {
    key: 'bloodPressure',
    label: VITAL_LABELS.bloodPressure,
    getValue: (d) => formatBP(d.bpSystolic, d.bpDiastolic),
    getThreshold: (d) => evaluateBPSystolic(d.bpSystolic),
    chart: {
      dataKey: 'bpSystolic',
      color: vitalChartConfig.bpSystolic.color,
      yDomain: vitalYDomains.bpSystolic,
      normalRange: { y1: 90, y2: 140 },
    },
  },
  {
    key: 'spo2',
    label: VITAL_LABELS.spo2,
    getValue: (d) => formatVitalValue('spo2', d.spo2),
    getThreshold: (d) => evaluateSpO2(d.spo2),
    chart: {
      dataKey: 'spo2',
      color: vitalChartConfig.spo2.color,
      yDomain: vitalYDomains.spo2,
      normalRange: { y1: 95, y2: 100 },
    },
  },
  {
    key: 'temperature',
    label: VITAL_LABELS.temperature,
    getValue: (d) => formatVitalValue('temperature', d.temperature),
    getThreshold: (d) => evaluateTemperature(d.temperature),
    chart: {
      dataKey: 'temperature',
      color: vitalChartConfig.temperature.color,
      yDomain: vitalYDomains.temperature,
      normalRange: { y1: 36.1, y2: 37.2 },
    },
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

  // 24h historical data — always fetched for pre-fetching, chart renders lazily on expand
  const { data: historyData } = useQuery(historicalVitalsQueryOptions(patientId, '24h'))

  const [expandedVital, setExpandedVital] = useState<string | null>(null)

  const toggle = (key: string) =>
    setExpandedVital((prev) => (prev === key ? null : key))

  return (
    <div>
      <PortalGreeting firstName={user?.firstName} />

      <div className="flex flex-col gap-4">
        {VITALS_CONFIG.map(({ key, label, getValue, getThreshold, chart }) => {
          const threshold = latestData
            ? getThreshold(latestData)
            : { level: 'unknown' as const, color: '', bgClass: '', textClass: '', borderClass: '', icon: 'Minus' as const }

          const value = latestData ? getValue(latestData) : '--'
          // Build single-key chart config for ChartContainer
          const chartConfig = {
            [chart.dataKey]: vitalChartConfig[chart.dataKey as keyof typeof vitalChartConfig],
          }

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
            >
              {/* Lazy rendering: only the expanded card's chart enters the DOM */}
              {expandedVital === key && historyData && (
                <div className="pt-4">
                  <PatientVitalAreaChart
                    data={historyData}
                    dataKey={chart.dataKey}
                    color={chart.color}
                    yDomain={chart.yDomain}
                    normalRange={chart.normalRange}
                    config={chartConfig}
                  />
                </div>
              )}
            </PatientVitalCard>
          )
        })}
      </div>
    </div>
  )
}
