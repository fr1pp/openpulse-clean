import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Heart, Activity, Wind, Thermometer, Pencil } from 'lucide-react'
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
  hrBands,
  bpBands,
  spo2Bands,
  tempBands,
  compactRelativeTime,
} from '@/components/charts/chart-config'
import { VitalLineChart } from '@/components/charts/VitalLineChart'
import { BPDualLineChart } from '@/components/charts/BPDualLineChart'
import { PatientBreadcrumb } from '@/components/patient-detail/PatientBreadcrumb'
import { VitalChartPanel } from '@/components/patient-detail/VitalChartPanel'
import { ChartZoneLegend } from '@/components/patient-detail/ChartZoneLegend'
import { ViewToggle, type ViewMode } from '@/components/patient-detail/ViewToggle'
import { TimeRangeSelector } from '@/components/patient-detail/TimeRangeSelector'
import { AccessCodePanel } from '@/components/patient-detail/AccessCodePanel'
import { EditPatientDialog } from '@/components/management/EditPatientDialog'
import { useTimeRange } from '@/hooks/useTimeRange'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { TimeRange } from '@openpulse/shared'

export const Route = createFileRoute('/_auth/dashboard/patient/$patientId')({
  component: PatientDetailPage,
})

/** Min/max range band is only shown for 7d and 30d — not 24h (per locked decision). */
function showsRangeBand(range: TimeRange): boolean {
  return range === '7d' || range === '30d'
}

function PatientDetailPage() {
  const { patientId } = Route.useParams()
  const id = Number(patientId)

  // View toggle: 'realtime' | 'history'
  const [view, setView] = useState<ViewMode>('realtime')

  // Session-persistent time range (defaults to '6h')
  const [range, updateRange] = useTimeRange()

  // Edit dialog state
  const [editOpen, setEditOpen] = useState(false)

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

  // Whether to show min/max range band (only for 7d and 30d history view)
  const rangeBand = view === 'history' && showsRangeBand(range)

  return (
    <div>
      {/* Breadcrumb + edit button */}
      <div className="flex items-center gap-2">
        <PatientBreadcrumb patientName={patientName} />
        {patient && (
          <Button variant="ghost" size="icon" onClick={() => setEditOpen(true)}>
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit patient</span>
          </Button>
        )}
      </div>

      {/* View toggle + time range selector */}
      <div className="mt-3 flex items-center gap-4">
        <ViewToggle value={view} onValueChange={setView} />
        {view === 'history' && (
          <TimeRangeSelector value={range} onValueChange={updateRange} />
        )}
      </div>

      {/* Zone legend — shown for both views (bands appear on both) */}
      <div className="mt-3">
        <ChartZoneLegend />
      </div>

      {/* Access Code Panel — between legend and charts */}
      <div className="mt-4">
        <AccessCodePanel patientId={id} patientName={patientName} />
      </div>

      {/* Chart grid */}
      {showSkeleton ? (
        <div className="mt-4 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[280px] rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="mt-4 space-y-4">
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
              bands={hrBands}
              evaluator={evaluateHeartRate}
              syncId="vital-charts"
              {...(view === 'history' ? { tickFormatter: compactRelativeTime } : {})}
              {...(rangeBand ? { showRangeBand: true, minKey: 'heartRateMin', maxKey: 'heartRateMax' } : {})}
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
              bands={bpBands}
              evaluator={evaluateBPSystolic}
              syncId="vital-charts"
              {...(view === 'history' ? { tickFormatter: compactRelativeTime } : {})}
              {...(rangeBand ? {
                showRangeBand: true,
                systolicMinKey: 'bpSystolicMin',
                systolicMaxKey: 'bpSystolicMax',
                diastolicMinKey: 'bpDiastolicMin',
                diastolicMaxKey: 'bpDiastolicMax',
              } : {})}
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
              bands={spo2Bands}
              evaluator={evaluateSpO2}
              syncId="vital-charts"
              {...(view === 'history' ? { tickFormatter: compactRelativeTime } : {})}
              {...(rangeBand ? { showRangeBand: true, minKey: 'spo2Min', maxKey: 'spo2Max' } : {})}
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
              bands={tempBands}
              evaluator={evaluateTemperature}
              syncId="vital-charts"
              {...(view === 'history' ? { tickFormatter: compactRelativeTime } : {})}
              {...(rangeBand ? { showRangeBand: true, minKey: 'temperatureMin', maxKey: 'temperatureMax' } : {})}
            />
          </VitalChartPanel>
        </div>
      )}

      {/* Edit patient dialog */}
      <EditPatientDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        patient={patient ?? null}
      />
    </div>
  )
}
