import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { socket } from '@/lib/socket'
import { vitalsKeys } from '@/api/queries/vitals'
import type { VitalReadingPayload } from '@openpulse/shared'

const MAX_RECENT_READINGS = 360 // 30 min at 5s intervals

/**
 * Bridges Socket.io vitals events into TanStack Query cache.
 * Listens for 'vitals:update' and writes directly via setQueryData.
 * Call ONCE in the authenticated layout.
 */
export function useVitalsStream() {
  const queryClient = useQueryClient()

  useEffect(() => {
    function handleVitalsUpdate(reading: VitalReadingPayload) {
      // Update "latest" cache -- replace with newest
      queryClient.setQueryData(vitalsKeys.latest(reading.patientId), reading)

      // Append to "recent" cache -- keep last 360 readings
      queryClient.setQueryData(
        vitalsKeys.recent(reading.patientId),
        (old: VitalReadingPayload[] | undefined) => {
          if (!old) return [reading]
          const updated = [...old, reading]
          return updated.length > MAX_RECENT_READINGS
            ? updated.slice(-MAX_RECENT_READINGS)
            : updated
        },
      )
    }

    function handleVitalsBatch(readings: VitalReadingPayload[]) {
      for (const reading of readings) {
        handleVitalsUpdate(reading)
      }
    }

    socket.on('vitals:update', handleVitalsUpdate)
    socket.on('vitals:batch', handleVitalsBatch)

    return () => {
      socket.off('vitals:update', handleVitalsUpdate)
      socket.off('vitals:batch', handleVitalsBatch)
    }
  }, [queryClient])
}
