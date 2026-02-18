import { useState, useCallback } from 'react'
import type { TimeRange } from '@openpulse/shared'

const STORAGE_KEY = 'openpulse-time-range'
const DEFAULT_RANGE: TimeRange = '6h'

/**
 * Session-persistent time range state.
 * Persists to sessionStorage so the selected range survives patient navigation.
 * Default: '6h' per user decision.
 */
export function useTimeRange() {
  const [range, setRange] = useState<TimeRange>(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY) as TimeRange | null
      if (stored && ['1h', '6h', '24h', '7d', '30d'].includes(stored)) return stored
      return DEFAULT_RANGE
    } catch {
      return DEFAULT_RANGE
    }
  })

  const updateRange = useCallback((newRange: TimeRange) => {
    setRange(newRange)
    try { sessionStorage.setItem(STORAGE_KEY, newRange) } catch {}
  }, [])

  return [range, updateRange] as const
}
