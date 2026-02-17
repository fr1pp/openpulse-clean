import { useEffect } from 'react'
import { socket } from '@/lib/socket'
import { useAuth } from '@/hooks/useAuth'

/**
 * Manages socket lifecycle tied to authentication state.
 * Connect when authenticated, disconnect when not.
 * Call ONCE in the root/authenticated layout.
 */
export function useSocket() {
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated) {
      socket.connect()
    } else {
      socket.disconnect()
    }

    return () => {
      socket.disconnect()
    }
  }, [isAuthenticated])
}
