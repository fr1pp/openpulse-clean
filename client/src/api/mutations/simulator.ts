import { useMutation, useQuery, useQueryClient, queryOptions } from '@tanstack/react-query'
import type { ScenarioDefinition } from '@openpulse/shared'

async function simulatorFetch(path: string, options?: RequestInit) {
  const res = await fetch(`/api/simulator/${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(error.error || 'Simulator request failed')
  }
  return res.json()
}

const simulatorStatusKey = ['simulator', 'status'] as const

export function usePauseSimulator() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => simulatorFetch('pause', { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: simulatorStatusKey }),
  })
}

export function useResumeSimulator() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => simulatorFetch('resume', { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: simulatorStatusKey }),
  })
}

export function useSetSimulatorSpeed() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (speed: number) =>
      simulatorFetch('speed', { method: 'POST', body: JSON.stringify({ speed }) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: simulatorStatusKey }),
  })
}

export function useApplyScenario() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ patientId, scenarioId }: { patientId: number; scenarioId: string }) =>
      simulatorFetch('scenario', {
        method: 'POST',
        body: JSON.stringify({ patientId, scenarioId }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: simulatorStatusKey }),
  })
}

export function useResetPatient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (patientId: number) =>
      simulatorFetch(`reset/${patientId}`, { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: simulatorStatusKey }),
  })
}

export function useResetAllPatients() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => simulatorFetch('reset-all', { method: 'POST' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: simulatorStatusKey }),
  })
}

const availableScenariosQueryOptions = queryOptions({
  queryKey: ['simulator', 'scenarios'] as const,
  queryFn: async (): Promise<ScenarioDefinition[]> => {
    const res = await fetch('/api/simulator/scenarios', {
      credentials: 'include',
    })
    if (!res.ok) throw new Error('Failed to fetch scenarios')
    return res.json()
  },
  staleTime: Infinity,
})

export function useAvailableScenarios() {
  return useQuery(availableScenariosQueryOptions)
}
