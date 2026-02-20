import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useLogout } from '@/api/mutations/auth'
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
import { VITAL_LABELS } from '@/components/portal/portal-status'
import {
  vitalChartConfig,
  vitalYDomains,
  hrThresholdLines,
  bpThresholdLines,
  spo2ThresholdLines,
  tempThresholdLines,
  hrBands,
  bpBands,
  spo2Bands,
  tempBands,
  compactRelativeTime,
} from '@/components/charts/chart-config'
import { VitalLineChart } from '@/components/charts/VitalLineChart'
import { BPDualLineChart } from '@/components/charts/BPDualLineChart'
import { ChartTimeRangeSelector } from '@/components/charts/ChartTimeRangeSelector'
import { useTimeRange } from '@/hooks/useTimeRange'
import type { VitalReadingPayload, TimeRange } from '@openpulse/shared'

export const Route = createFileRoute('/portal/_portal/vitals')({
  component: VitalsPage,
})

// -----------------------------------------------------------------------
// Per-vital section components (one hook call per component)
// -----------------------------------------------------------------------

interface HeartRateSectionProps {
  patientId: number
  latestData: VitalReadingPayload | null | undefined
}

function HeartRateSection({ patientId, latestData }: HeartRateSectionProps) {
  const [range, setRange] = useTimeRange('openpulse-time-range-portal-heartRate')
  const { data: historyData } = useQuery(historicalVitalsQueryOptions(patientId, range))

  const threshold = latestData
    ? evaluateHeartRate(latestData.heartRate)
    : { level: 'unknown' as const, valueTextClass: 'text-foreground', color: '', bgClass: '', textClass: '', borderClass: '', icon: 'Minus' as const }

  const value = latestData ? formatVitalValue('heartRate', latestData.heartRate) : '--'

  return (
    <PatientVitalCard
      label={VITAL_LABELS.heartRate}
      value={value}
      valueTextClass={threshold.valueTextClass}
      level={threshold.level}
      timestamp={latestData?.recordedAt}
    >
      <ChartTimeRangeSelector
        value={range}
        onChange={setRange as (r: TimeRange) => void}
        className="mb-3 ml-4"
      />
      <VitalLineChart
        data={historyData ?? []}
        dataKey="heartRate"
        config={{ heartRate: vitalChartConfig.heartRate }}
        thresholdLines={hrThresholdLines}
        bands={hrBands}
        yDomain={vitalYDomains.heartRate}
        evaluator={evaluateHeartRate}
        tickFormatter={compactRelativeTime}
        className="h-[180px]"
      />
    </PatientVitalCard>
  )
}

interface BloodPressureSectionProps {
  patientId: number
  latestData: VitalReadingPayload | null | undefined
}

function BloodPressureSection({ patientId, latestData }: BloodPressureSectionProps) {
  const [range, setRange] = useTimeRange('openpulse-time-range-portal-bloodPressure')
  const { data: historyData } = useQuery(historicalVitalsQueryOptions(patientId, range))

  const threshold = latestData
    ? evaluateBPSystolic(latestData.bpSystolic)
    : { level: 'unknown' as const, valueTextClass: 'text-foreground', color: '', bgClass: '', textClass: '', borderClass: '', icon: 'Minus' as const }

  const value = latestData ? formatBP(latestData.bpSystolic, latestData.bpDiastolic) : '--'

  return (
    <PatientVitalCard
      label={VITAL_LABELS.bloodPressure}
      value={value}
      valueTextClass={threshold.valueTextClass}
      level={threshold.level}
      timestamp={latestData?.recordedAt}
    >
      <ChartTimeRangeSelector
        value={range}
        onChange={setRange as (r: TimeRange) => void}
        className="mb-3 ml-4"
      />
      <BPDualLineChart
        data={historyData ?? []}
        thresholdLines={bpThresholdLines}
        bands={bpBands}
        yDomain={vitalYDomains.bpSystolic}
        evaluator={evaluateBPSystolic}
        tickFormatter={compactRelativeTime}
        className="h-[180px]"
      />
    </PatientVitalCard>
  )
}

interface SpO2SectionProps {
  patientId: number
  latestData: VitalReadingPayload | null | undefined
}

function SpO2Section({ patientId, latestData }: SpO2SectionProps) {
  const [range, setRange] = useTimeRange('openpulse-time-range-portal-spo2')
  const { data: historyData } = useQuery(historicalVitalsQueryOptions(patientId, range))

  const threshold = latestData
    ? evaluateSpO2(latestData.spo2)
    : { level: 'unknown' as const, valueTextClass: 'text-foreground', color: '', bgClass: '', textClass: '', borderClass: '', icon: 'Minus' as const }

  const value = latestData ? formatVitalValue('spo2', latestData.spo2) : '--'

  return (
    <PatientVitalCard
      label={VITAL_LABELS.spo2}
      value={value}
      valueTextClass={threshold.valueTextClass}
      level={threshold.level}
      timestamp={latestData?.recordedAt}
    >
      <ChartTimeRangeSelector
        value={range}
        onChange={setRange as (r: TimeRange) => void}
        className="mb-3 ml-4"
      />
      <VitalLineChart
        data={historyData ?? []}
        dataKey="spo2"
        config={{ spo2: vitalChartConfig.spo2 }}
        thresholdLines={spo2ThresholdLines}
        bands={spo2Bands}
        yDomain={vitalYDomains.spo2}
        evaluator={evaluateSpO2}
        tickFormatter={compactRelativeTime}
        className="h-[180px]"
      />
    </PatientVitalCard>
  )
}

interface TemperatureSectionProps {
  patientId: number
  latestData: VitalReadingPayload | null | undefined
}

function TemperatureSection({ patientId, latestData }: TemperatureSectionProps) {
  const [range, setRange] = useTimeRange('openpulse-time-range-portal-temperature')
  const { data: historyData } = useQuery(historicalVitalsQueryOptions(patientId, range))

  const threshold = latestData
    ? evaluateTemperature(latestData.temperature)
    : { level: 'unknown' as const, valueTextClass: 'text-foreground', color: '', bgClass: '', textClass: '', borderClass: '', icon: 'Minus' as const }

  const value = latestData ? formatVitalValue('temperature', latestData.temperature) : '--'

  return (
    <PatientVitalCard
      label={VITAL_LABELS.temperature}
      value={value}
      valueTextClass={threshold.valueTextClass}
      level={threshold.level}
      timestamp={latestData?.recordedAt}
    >
      <ChartTimeRangeSelector
        value={range}
        onChange={setRange as (r: TimeRange) => void}
        className="mb-3 ml-4"
      />
      <VitalLineChart
        data={historyData ?? []}
        dataKey="temperature"
        config={{ temperature: vitalChartConfig.temperature }}
        thresholdLines={tempThresholdLines}
        bands={tempBands}
        yDomain={vitalYDomains.temperature}
        evaluator={evaluateTemperature}
        tickFormatter={compactRelativeTime}
        className="h-[180px]"
      />
    </PatientVitalCard>
  )
}

// -----------------------------------------------------------------------
// Main vitals page
// -----------------------------------------------------------------------

function VitalsPage() {
  const { user } = useAuth()
  // Safe: _portal.tsx beforeLoad guards patient role, so user is always set here
  const patientId = user!.id

  const navigate = useNavigate()
  const logout = useLogout()

  const { data: latestData } = useQuery({
    queryKey: vitalsKeys.latest(patientId),
    queryFn: () => fetchLatestVital(patientId),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  })

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        navigate({ to: '/patient-login' })
      },
    })
  }

  return (
    <div>
      <PortalGreeting firstName={user?.firstName} />

      {/* Always-visible vital cards with per-chart time range selectors */}
      <div className="flex flex-col gap-4">
        <HeartRateSection patientId={patientId} latestData={latestData} />
        <BloodPressureSection patientId={patientId} latestData={latestData} />
        <SpO2Section patientId={patientId} latestData={latestData} />
        <TemperatureSection patientId={patientId} latestData={latestData} />
      </div>

      {/* Bottom logout — subtle text link, well-spaced from cards for touch safety */}
      <div className="mt-12 flex justify-center pb-8">
        <button
          onClick={handleLogout}
          disabled={logout.isPending}
          className="flex items-center gap-2 min-h-[48px] px-4 text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors duration-200"
          aria-label="Log out of patient portal"
        >
          <LogOut className="h-4 w-4" />
          {logout.isPending ? 'Logging out...' : 'Log out'}
        </button>
      </div>
    </div>
  )
}
