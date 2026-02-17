import { useState, useEffect, useCallback } from 'react'
import { socket } from '@/lib/socket'
import type { SimulatorEventPayload } from '@openpulse/shared'

export function useSimulatorEvents(maxEvents = 50) {
  const [events, setEvents] = useState<SimulatorEventPayload[]>([])

  useEffect(() => {
    function handleEvent(event: SimulatorEventPayload) {
      setEvents((prev) => [event, ...prev].slice(0, maxEvents))
    }

    socket.on('simulator:event', handleEvent)
    return () => {
      socket.off('simulator:event', handleEvent)
    }
  }, [maxEvents])

  const clearEvents = useCallback(() => setEvents([]), [])

  return { events, clearEvents }
}
