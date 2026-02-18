import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Heart, Activity, Wind, Thermometer } from 'lucide-react'
import { patientsQueryOptions } from '@/api/queries/patients'
import {
  recentVitalsQueryOptions,
  vitalsKeys,
  fetchLatestVital,
  historicalVitalsQueryOptions,
} from '@/api/queries/vitals'
import {
  evaluateHeartRate,
  evaluateBPSystolic,
  evaluateSpO2,
  evaluateTemperature,
} from '@/lib/thresholds'
import { formatVitalValue, formatBP } from '@/lib/vitals-format'
import {
  vitalChartConfig,
  hrThresholdLines,
  bpThresholdLines,
  spo2ThresholdLines,
  tempThresholdLines,
  vitalYDomains,
} from '@/components/charts/chart-config'
import { VitalLineChart } from '@/components/charts/VitalLineChart'
import { BPDualLineChart } from '@/components/charts/BPDualLineChart'
import { PatientBreadcrumb } from '@/components/patient-detail/PatientBreadcrumb'
import { VitalChartPanel } from '@/components/patient-detail/VitalChartPanel'
import { ViewToggle, type ViewMode } from '@/components/patient-detail/ViewToggle'
import { TimeRangeSelector } from '@/components/patient-detail/TimeRangeSelector'
import { useTimeRange } from '@/hooks/useTimeRange'
import { Skeleton } from '@/components/ui/skeleton'

export const Route = createFileRoute('/_auth/dashboard/patient/$patientId')({
  component: PatientDetailPage,
})

function PatientDetailPage() {
  const { patientId } = Route.useParams()
  const id = Number(patientId)

  // View toggle: 'realtime' | 'history'
  const [view, setView] = useState<ViewMode>('realtime')

  // Session-persistent time range (defaults to '6h')
  const [range, updateRange] = useTimeRange()

  // Patient info for breadcrumb
  const { data: patients, isLoading: patientsLoading } = useQuery(patientsQueryOptions)
  const patient = patients?.find((p) => p.id === id)
  const patientName = patient
    ? `${patient.firstName} ${patient.lastName}`
    : 'Loading...'

  // Recent vitals for real-time charts (30-min window, ordered ASC)
  const { data: recentData, isLoading: vitalsLoading } = useQuery(
    recentVitalsQueryOptions(id),
  )

  // Latest vital for badges (always active so header badges reflect live data)
  const { data: latest } = useQuery({
    queryKey: vitalsKeys.latest(id),
    queryFn: () => fetchLatestVital(id),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  })

  // Historical vitals (always active for pre-fetching)
  const { data: historyData, isLoading: historyLoading } = useQuery(
    historicalVitalsQueryOptions(id, range),
  )

  const chartData = recentData ?? []
  const isInitialLoading = patientsLoading || vitalsLoading

  // Show loading skeletons when: initial page load OR switching to history view while data loads
  const showSkeleton = isInitialLoading || (view === 'history' && historyLoading)

  // Active data: history view uses historical data, real-time uses recent data
  const activeData = view === 'history' ? (historyData ?? []) : chartData

  return (
    <div>
      {/* Breadcrumb */}
      <PatientBreadcrumb patientName={patientName} />

      {/* View toggle + time range selector */}
      <div className="mt-3 flex items-center gap-4">
        <ViewToggle value={view} onValueChange={setView} />
        {view === 'history' && (
          <TimeRangeSelector value={range} onValueChange={updateRange} />
        )}
      </div>

      {/* Chart grid */}
      {showSkeleton ? (
        <div className="mt-6 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[280px] rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {/* Heart Rate */}
          <VitalChartPanel
            icon={Heart}
            label="HR"
            currentValue={formatVitalValue('heartRate', latest?.heartRate ?? null)}
            threshold={evaluateHeartRate(latest?.heartRate ?? null)}
          >
            <VitalLineChart
              data={activeData}
              dataKey="heartRate"
              config={{ heartRate: vitalChartConfig.heartRate }}
              thresholdLines={hrThresholdLines}
              yDomain={vitalYDomains.heartRate}
            />
          </VitalChartPanel>

          {/* Blood Pressure */}
          <VitalChartPanel
            icon={Activity}
            label="BP"
            currentValue={formatBP(latest?.bpSystolic ?? null, latest?.bpDiastolic ?? null)}
            threshold={evaluateBPSystolic(latest?.bpSystolic ?? null)}
          >
            <BPDualLineChart
              data={activeData}
              thresholdLines={bpThresholdLines}
              yDomain={vitalYDomains.bpSystolic}
            />
          </VitalChartPanel>

          {/* SpO2 */}
          <VitalChartPanel
            icon={Wind}
            label="SpO2"
            currentValue={formatVitalValue('spo2', latest?.spo2 ?? null)}
            threshold={evaluateSpO2(latest?.spo2 ?? null)}
          >
            <VitalLineChart
              data={activeData}
              dataKey="spo2"
              config={{ spo2: vitalChartConfig.spo2 }}
              thresholdLines={spo2ThresholdLines}
              yDomain={vitalYDomains.spo2}
            />
          </VitalChartPanel>

          {/* Temperature */}
          <VitalChartPanel
            icon={Thermometer}
            label="Temp"
            currentValue={formatVitalValue('temperature', latest?.temperature ?? null)}
            threshold={evaluateTemperature(latest?.temperature ?? null)}
          >
            <VitalLineChart
              data={activeData}
              dataKey="temperature"
              config={{ temperature: vitalChartConfig.temperature }}
              thresholdLines={tempThresholdLines}
              yDomain={vitalYDomains.temperature}
            />
          </VitalChartPanel>
        </div>
      )}
    </div>
  )
}
