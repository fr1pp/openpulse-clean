import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Heart, Activity, Wind, Thermometer } from 'lucide-react'
import { patientsQueryOptions } from '@/api/queries/patients'
import {
  recentVitalsQueryOptions,
  vitalsKeys,
  fetchLatestVital,
} from '@/api/queries/vitals'
import type { VitalReadingPayload } from '@openpulse/shared'
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
import { VitalStrip } from '@/components/patient-detail/VitalStrip'
import { VitalChartPanel } from '@/components/patient-detail/VitalChartPanel'
import { Skeleton } from '@/components/ui/skeleton'

export const Route = createFileRoute('/_auth/dashboard/patient/$patientId')({
  component: PatientDetailPage,
})

function PatientDetailPage() {
  const { patientId } = Route.useParams()
  const id = Number(patientId)

  // Patient info for breadcrumb
  const { data: patients, isLoading: patientsLoading } = useQuery(patientsQueryOptions)
  const patient = patients?.find((p) => p.id === id)
  const patientName = patient
    ? `${patient.firstName} ${patient.lastName}`
    : 'Loading...'

  // Recent vitals for charts (30-min window, ordered ASC)
  const { data: recentData, isLoading: vitalsLoading } = useQuery(
    recentVitalsQueryOptions(id),
  )

  // Latest vital for badges
  const { data: latest } = useQuery({
    queryKey: vitalsKeys.latest(id),
    queryFn: () => fetchLatestVital(id),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  })

  const chartData = recentData ?? []
  const isLoading = patientsLoading || vitalsLoading

  return (
    <div>
      {/* Breadcrumb */}
      <PatientBreadcrumb patientName={patientName} />

      {/* Vital strip */}
      <div className="mt-3">
        <VitalStrip latest={latest ?? null} />
      </div>

      {/* Chart grid */}
      {isLoading ? (
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[280px] rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Heart Rate */}
          <VitalChartPanel
            icon={Heart}
            label="HR"
            currentValue={formatVitalValue('heartRate', latest?.heartRate ?? null)}
            threshold={evaluateHeartRate(latest?.heartRate ?? null)}
          >
            <VitalLineChart
              data={chartData}
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
              data={chartData}
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
              data={chartData}
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
              data={chartData}
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
