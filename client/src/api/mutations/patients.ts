import { useMutation, useQueryClient } from '@tanstack/react-query'
import { patientKeys } from '../queries/patients'
import { toast } from 'sonner'

// Types for mutation inputs
export interface CreatePatientInput {
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: string
}

export interface UpdatePatientInput {
  firstName?: string
  lastName?: string
  dateOfBirth?: string
  gender?: string
}

// Helper for API calls
async function patientFetch(url: string, options: RequestInit) {
  const res = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(err.error || 'Request failed')
  }
  return res.json()
}

export function useCreatePatient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreatePatientInput) =>
      patientFetch('/api/patients', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientKeys.list() })
      toast.success('Patient created successfully')
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })
}

export function useUpdatePatient(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdatePatientInput) =>
      patientFetch(`/api/patients/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientKeys.list() })
      queryClient.invalidateQueries({ queryKey: patientKeys.detail(id) })
      toast.success('Patient updated successfully')
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })
}

export function useDeletePatient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) =>
      patientFetch(`/api/patients/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientKeys.list() })
      toast.success('Patient deleted')
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })
}

export function useRegenAccessCode(id: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () =>
      patientFetch(`/api/patients/${id}/access-code`, { method: 'PATCH' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientKeys.detail(id) })
      // Don't toast here — the caller shows the code reveal dialog instead
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })
}
