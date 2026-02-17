import { useCallback, useSyncExternalStore } from 'react'
import { socket } from '@/lib/socket'
import type { SimulatorEventPayload } from '@openpulse/shared'

// Module-level event buffer — survives component mount/unmount cycles.
const MAX_EVENTS = 30
let events: SimulatorEventPayload[] = []
let listeners = new Set<() => void>()
let listening = false

function notify() {
  for (const cb of listeners) cb()
}

function startSocketListener() {
  if (listening) return
  listening = true
  socket.on('simulator:event', (event: SimulatorEventPayload) => {
    events = [event, ...events].slice(0, MAX_EVENTS)
    notify()
  })
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  startSocketListener()
  return () => { listeners.delete(cb) }
}

function getSnapshot() {
  return events
}

export function useSimulatorEvents() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot)

  const clearEvents = useCallback(() => {
    events = []
    notify()
  }, [])

  return { events: snapshot, clearEvents }
}
