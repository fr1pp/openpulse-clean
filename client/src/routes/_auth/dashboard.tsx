import { useState, useMemo } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { patientsQueryOptions } from '@/api/queries/patients'
import type { PatientListItem } from '@/api/queries/patients'
import { vitalsKeys } from '@/api/queries/vitals'
import { PatientOverviewCard } from '@/components/dashboard/PatientOverviewCard'
import { PatientCardSkeleton } from '@/components/dashboard/PatientCardSkeleton'
import { PatientSortToggle } from '@/components/dashboard/PatientSortToggle'
import type { SortMode } from '@/components/dashboard/PatientSortToggle'
import {
  evaluateHeartRate,
  evaluateBPSystolic,
  evaluateSpO2,
  evaluateTemperature,
  worstOfFour,
} from '@/lib/thresholds'
import type { VitalReadingPayload } from '@openpulse/shared'

export const Route = createFileRoute('/_auth/dashboard')({
  component: DashboardPage,
})

const SEVERITY_ORDER = { unknown: 0, normal: 1, concerning: 2, critical: 3 } as const

function DashboardPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: patients, isLoading } = useQuery(patientsQueryOptions)
  const [sortBy, setSortBy] = useState<SortMode>('severity')

  const sortedPatients = useMemo(() => {
    if (!patients) return []

    if (sortBy === 'alphabetical') {
      return [...patients].sort((a, b) => {
        const cmp = a.lastName.localeCompare(b.lastName)
        return cmp !== 0 ? cmp : a.firstName.localeCompare(b.firstName)
      })
    }

    // Severity sort: read latest vitals from cache for each patient
    return [...patients].sort((a, b) => {
      const latestA = queryClient.getQueryData<VitalReadingPayload | null>(
        vitalsKeys.latest(a.id),
      )
      const latestB = queryClient.getQueryData<VitalReadingPayload | null>(
        vitalsKeys.latest(b.id),
      )

      const severityA = getSeverityScore(latestA)
      const severityB = getSeverityScore(latestB)

      // Higher severity first
      if (severityB !== severityA) return severityB - severityA

      // Within same tier, most recently changed first
      const timeA = latestA?.recordedAt ?? ''
      const timeB = latestB?.recordedAt ?? ''
      return timeB.localeCompare(timeA)
    })
  }, [patients, sortBy, queryClient])

  return (
    <div>
      {/* Header with sort toggle */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <PatientSortToggle sortBy={sortBy} onSortChange={setSortBy} />
      </div>

      {/* Patient card grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <PatientCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {sortedPatients.map((patient) => (
            <PatientOverviewCard
              key={patient.id}
              patient={patient}
              onClick={() =>
                navigate({
                  to: '/dashboard/patient/$patientId',
                  params: { patientId: String(patient.id) },
                } as any)
              }
            />
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Compute numeric severity score for a patient's latest vitals.
 * Higher = more severe. Used for sort ordering.
 */
function getSeverityScore(latest: VitalReadingPayload | null | undefined): number {
  if (!latest) return -1

  const hr = evaluateHeartRate(latest.heartRate)
  const bp = evaluateBPSystolic(latest.bpSystolic)
  const spo2 = evaluateSpO2(latest.spo2)
  const temp = evaluateTemperature(latest.temperature)
  const worst = worstOfFour([hr, bp, spo2, temp])

  return SEVERITY_ORDER[worst.level]
}
