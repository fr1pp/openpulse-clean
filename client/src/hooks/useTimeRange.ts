import { useState, useCallback } from 'react'
import type { TimeRange } from '@openpulse/shared'

const DEFAULT_STORAGE_KEY = 'openpulse-time-range'
const DEFAULT_RANGE: TimeRange = '6h'
const VALID_RANGES: TimeRange[] = ['6h', '24h', '7d', '30d']

/**
 * Session-persistent time range state.
 * Persists to sessionStorage so the selected range survives patient navigation.
 * Accepts an optional storageKey for per-chart persistence across vitals.
 * Default: '6h' per user decision.
 */
export function useTimeRange(storageKey: string = DEFAULT_STORAGE_KEY) {
  const [range, setRange] = useState<TimeRange>(() => {
    try {
      const stored = sessionStorage.getItem(storageKey) as TimeRange | null
      if (stored && VALID_RANGES.includes(stored)) return stored
      return DEFAULT_RANGE
    } catch {
      return DEFAULT_RANGE
    }
  })

  const updateRange = useCallback((newRange: TimeRange) => {
    setRange(newRange)
    try { sessionStorage.setItem(storageKey, newRange) } catch {}
  }, [storageKey])

  return [range, updateRange] as const
}
