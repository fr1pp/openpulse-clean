import { queryOptions } from '@tanstack/react-query'
import type { VitalReadingPayload } from '@openpulse/shared'

export const vitalsKeys = {
  all: ['vitals'] as const,
  latest: (patientId: number) => ['vitals', 'latest', patientId] as const,
  recent: (patientId: number) => ['vitals', 'recent', patientId] as const,
  history: (patientId: number, since?: string) =>
    ['vitals', 'history', patientId, since] as const,
}

export async function fetchRecentVitals(
  patientId: number,
  since?: string,
): Promise<VitalReadingPayload[]> {
  const params = since ? `?since=${encodeURIComponent(since)}` : ''
  const res = await fetch(`/api/vitals/${patientId}/recent${params}`, {
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Failed to fetch recent vitals')
  return res.json()
}

export async function fetchLatestVital(
  patientId: number,
): Promise<VitalReadingPayload | null> {
  const res = await fetch(`/api/vitals/${patientId}/latest`, {
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Failed to fetch latest vital')
  const data = await res.json()
  return data ?? null
}

export function recentVitalsQueryOptions(patientId: number) {
  return queryOptions({
    queryKey: vitalsKeys.recent(patientId),
    queryFn: () => fetchRecentVitals(patientId),
    staleTime: Infinity, // Socket is the freshness mechanism
    gcTime: 30 * 60 * 1000, // 30 min -- prevents GC while user navigates away
    refetchOnWindowFocus: false,
  })
}
