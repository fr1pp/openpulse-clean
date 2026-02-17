import { useQuery, queryOptions } from '@tanstack/react-query'
import type { SimulatorStatus } from '@openpulse/shared'

export const simulatorStatusQueryOptions = queryOptions({
  queryKey: ['simulator', 'status'] as const,
  queryFn: async (): Promise<SimulatorStatus> => {
    const res = await fetch('/api/simulator/status', {
      credentials: 'include',
    })
    if (!res.ok) throw new Error('Failed to fetch simulator status')
    return res.json()
  },
  refetchInterval: 2000,
  staleTime: 1000,
})

export function useSimulatorStatus() {
  return useQuery(simulatorStatusQueryOptions)
}
