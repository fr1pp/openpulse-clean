import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Heart, Activity, Wind, Thermometer, Pencil } from 'lucide-react'
import { patientsQueryOptions, patientDetailQueryOptions } from '@/api/queries/patients'
import {
  recentVitalsQueryOptions,
  vitalsKeys,
  fetchLatestVital,
} from '@/api/queries/vitals'
import {
  evaluateHeartRate,
  evaluateBPSystolic,
  evaluateSpO2,
  evaluateTemperature,
  worstOfFour,
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
import { PatientInfoCard } from '@/components/patient-detail/PatientInfoCard'
import { ChartZoneLegend } from '@/components/patient-detail/ChartZoneLegend'
import { AccessCodePanel } from '@/components/patient-detail/AccessCodePanel'
import { EditPatientDialog } from '@/components/management/EditPatientDialog'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { TimeRange, VitalReadingPayload, HistoricalReading } from '@openpulse/shared'

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

  // Edit dialog state
  const [editOpen, setEditOpen] = useState(false)

  // Patient list (for name, DOB in PatientInfoCard)
  const { data: patients, isLoading: patientsLoading } = useQuery(patientsQueryOptions)
  const patient = patients?.find((p) => p.id === id)
  const patientName = patient
    ? `${patient.firstName} ${patient.lastName}`
    : 'Loading...'

  // Patient detail (for access code + QR URL in PatientInfoCard)
  const { data: patientDetail } = useQuery(patientDetailQueryOptions(id))
  const qrUrl = patientDetail?.qrCodeData
    ? `${window.location.origin}${patientDetail.qrCodeData}`
    : undefined

  // Recent vitals for real-time display in chart headers (30-min window)
  const { isLoading: vitalsLoading } = useQuery(
    recentVitalsQueryOptions(id),
  )

  // Latest vital for header values (always active for live data)
  const { data: latest } = useQuery({
    queryKey: vitalsKeys.latest(id),
    queryFn: () => fetchLatestVital(id),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  })

  const isInitialLoading = patientsLoading || vitalsLoading

  // Worst-of-four status for PatientInfoCard
  const worst = worstOfFour([
    evaluateHeartRate(latest?.heartRate ?? null),
    evaluateBPSystolic(latest?.bpSystolic ?? null),
    evaluateSpO2(latest?.spo2 ?? null),
    evaluateTemperature(latest?.temperature ?? null),
  ])

  // Skeleton grid for 2x2 chart layout
  const skeletonGrid = (
    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-[380px] rounded-2xl" />
      ))}
    </div>
  )

  return (
    <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[1fr_300px] lg:items-start">
      {/* Left column: breadcrumb + legend + charts */}
      <div className="min-w-0">
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

        {/* Zone legend */}
        <div className="mt-3">
          <ChartZoneLegend />
        </div>

        {/* Mobile: PatientInfoCard above charts */}
        {patient && (
          <div className="mt-4 lg:hidden">
            <PatientInfoCard patient={patient} worst={worst} qrUrl={qrUrl} />
          </div>
        )}

        {/* Chart 2x2 grid */}
        {isInitialLoading ? (
          skeletonGrid
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Heart Rate */}
            <VitalChartPanel
              icon={Heart}
              label="HR"
              currentValue={formatVitalValue('heartRate', latest?.heartRate ?? null)}
              threshold={evaluateHeartRate(latest?.heartRate ?? null)}
              patientId={id}
              storageKey="openpulse-time-range-heartRate"
              renderChart={(activeData: VitalReadingPayload[] | HistoricalReading[], range: string, isHistory: boolean) => (
                <VitalLineChart
                  data={activeData}
                  dataKey="heartRate"
                  config={{ heartRate: vitalChartConfig.heartRate }}
                  thresholdLines={hrThresholdLines}
                  bands={hrBands}
                  evaluator={evaluateHeartRate}
                  className="h-[280px]"
                  {...(isHistory ? { tickFormatter: compactRelativeTime } : {})}
                  {...(showsRangeBand(range as TimeRange) ? { showRangeBand: true, minKey: 'heartRateMin', maxKey: 'heartRateMax' } : {})}
                />
              )}
            />

            {/* Blood Pressure */}
            <VitalChartPanel
              icon={Activity}
              label="BP"
              currentValue={formatBP(latest?.bpSystolic ?? null, latest?.bpDiastolic ?? null)}
              threshold={evaluateBPSystolic(latest?.bpSystolic ?? null)}
              patientId={id}
              storageKey="openpulse-time-range-bp"
              renderChart={(activeData: VitalReadingPayload[] | HistoricalReading[], range: string, isHistory: boolean) => (
                <BPDualLineChart
                  data={activeData}
                  thresholdLines={bpThresholdLines}
                  bands={bpBands}
                  evaluator={evaluateBPSystolic}
                  className="h-[280px]"
                  {...(isHistory ? { tickFormatter: compactRelativeTime } : {})}
                  {...(showsRangeBand(range as TimeRange) ? {
                    showRangeBand: true,
                    systolicMinKey: 'bpSystolicMin',
                    systolicMaxKey: 'bpSystolicMax',
                    diastolicMinKey: 'bpDiastolicMin',
                    diastolicMaxKey: 'bpDiastolicMax',
                  } : {})}
                />
              )}
            />

            {/* SpO2 */}
            <VitalChartPanel
              icon={Wind}
              label="SpO2"
              currentValue={formatVitalValue('spo2', latest?.spo2 ?? null)}
              threshold={evaluateSpO2(latest?.spo2 ?? null)}
              patientId={id}
              storageKey="openpulse-time-range-spo2"
              renderChart={(activeData: VitalReadingPayload[] | HistoricalReading[], range: string, isHistory: boolean) => (
                <VitalLineChart
                  data={activeData}
                  dataKey="spo2"
                  config={{ spo2: vitalChartConfig.spo2 }}
                  thresholdLines={spo2ThresholdLines}
                  bands={spo2Bands}
                  evaluator={evaluateSpO2}
                  className="h-[280px]"
                  {...(isHistory ? { tickFormatter: compactRelativeTime } : {})}
                  {...(showsRangeBand(range as TimeRange) ? { showRangeBand: true, minKey: 'spo2Min', maxKey: 'spo2Max' } : {})}
                />
              )}
            />

            {/* Temperature */}
            <VitalChartPanel
              icon={Thermometer}
              label="Temp"
              currentValue={formatVitalValue('temperature', latest?.temperature ?? null)}
              threshold={evaluateTemperature(latest?.temperature ?? null)}
              patientId={id}
              storageKey="openpulse-time-range-temperature"
              renderChart={(activeData: VitalReadingPayload[] | HistoricalReading[], range: string, isHistory: boolean) => (
                <VitalLineChart
                  data={activeData}
                  dataKey="temperature"
                  config={{ temperature: vitalChartConfig.temperature }}
                  thresholdLines={tempThresholdLines}
                  bands={tempBands}
                  evaluator={evaluateTemperature}
                  className="h-[280px]"
                  {...(isHistory ? { tickFormatter: compactRelativeTime } : {})}
                  {...(showsRangeBand(range as TimeRange) ? { showRangeBand: true, minKey: 'temperatureMin', maxKey: 'temperatureMax' } : {})}
                />
              )}
            />
          </div>
        )}

        {/* Access Code Panel — below charts */}
        <div className="mt-4">
          <AccessCodePanel patientId={id} patientName={patientName} />
        </div>
      </div>

      {/* Right column: sticky patient info sidebar (desktop only) */}
      {patient && (
        <div className="hidden lg:block lg:sticky lg:top-20">
          <PatientInfoCard patient={patient} worst={worst} qrUrl={qrUrl} />
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
