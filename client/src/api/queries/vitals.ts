import { queryOptions } from '@tanstack/react-query'
import type { VitalReadingPayload, HistoricalReading, TimeRange } from '@openpulse/shared'

export const vitalsKeys = {
  all: ['vitals'] as const,
  latest: (patientId: number) => ['vitals', 'latest', patientId] as const,
  recent: (patientId: number) => ['vitals', 'recent', patientId] as const,
  history: (patientId: number, since?: string) =>
    ['vitals', 'history', patientId, since] as const,
  historyRaw: (patientId: number, range: TimeRange) =>
    ['vitals', 'history', 'raw', patientId, range] as const,
  historyAggregated: (patientId: number, range: TimeRange) =>
    ['vitals', 'history', 'aggregated', patientId, range] as const,
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

// ============================================================
// Historical vitals
// ============================================================

const TIME_RANGE_MS: Record<TimeRange, number> = {
  '1h':  1 * 60 * 60 * 1000,
  '6h':  6 * 60 * 60 * 1000,
  '24h': 24 * 60 * 60 * 1000,
  '7d':  7 * 24 * 60 * 60 * 1000,
  '30d': 30 * 24 * 60 * 60 * 1000,
}

// 24h and longer ranges use aggregation
const AGGREGATE_RANGES: TimeRange[] = ['7d', '30d']

// Bucket sizes: 24h -> 5m (~288 pts), 7d -> 30m (~336 pts), 30d -> 2h (~360 pts)
const BUCKET_MAP: Partial<Record<TimeRange, string>> = {
  '24h': '5m',
  '7d': '30m',
  '30d': '2h',
}

export async function fetchHistoricalVitals(
  patientId: number,
  range: TimeRange,
): Promise<HistoricalReading[]> {
  const until = new Date()
  const since = new Date(until.getTime() - TIME_RANGE_MS[range])
  const aggregate = AGGREGATE_RANGES.includes(range) || range === '24h'
  const bucket = BUCKET_MAP[range]

  const params = new URLSearchParams({
    since: since.toISOString(),
    until: until.toISOString(),
  })
  if (aggregate && bucket) {
    params.set('aggregate', 'true')
    params.set('bucket', bucket)
  }

  const res = await fetch(`/api/vitals/${patientId}/history?${params}`, {
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Failed to fetch historical vitals')
  return res.json()
}

export function historicalVitalsQueryOptions(patientId: number, range: TimeRange) {
  const isAggregated = AGGREGATE_RANGES.includes(range) || range === '24h'
  return queryOptions({
    queryKey: isAggregated
      ? vitalsKeys.historyAggregated(patientId, range)
      : vitalsKeys.historyRaw(patientId, range),
    queryFn: () => fetchHistoricalVitals(patientId, range),
    staleTime: 5 * 60 * 1000,   // 5 min — historical data doesn't change second-to-second
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}

export function isAggregatedRange(range: TimeRange): boolean {
  return AGGREGATE_RANGES.includes(range) || range === '24h'
}
