import { useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { socket } from '@/lib/socket'
import { vitalsKeys } from '@/api/queries/vitals'

export type ConnectionState = 'connected' | 'reconnecting' | 'disconnected'

export interface ConnectionStatus {
  status: ConnectionState
  reconnectAttempt: number
}

/**
 * Tracks Socket.io connection state for UI display.
 * On reconnect, invalidates vitals queries to trigger backfill.
 */
export function useConnectionStatus(): ConnectionStatus {
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<ConnectionState>(
    socket.connected ? 'connected' : 'disconnected',
  )
  const [reconnectAttempt, setReconnectAttempt] = useState(0)

  useEffect(() => {
    function onConnect() {
      setStatus('connected')
      setReconnectAttempt(0)
    }

    function onDisconnect() {
      setStatus('disconnected')
    }

    function onReconnectAttempt(attempt: number) {
      setStatus('reconnecting')
      setReconnectAttempt(attempt)
    }

    function onReconnect() {
      setStatus('connected')
      setReconnectAttempt(0)
      // Invalidate vitals queries to trigger backfill after reconnection
      queryClient.invalidateQueries({ queryKey: vitalsKeys.all })
    }

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.io.on('reconnect_attempt', onReconnectAttempt)
    socket.io.on('reconnect', onReconnect)

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.io.off('reconnect_attempt', onReconnectAttempt)
      socket.io.off('reconnect', onReconnect)
    }
  }, [queryClient])

  return { status, reconnectAttempt }
}
