import { queryOptions } from '@tanstack/react-query'

export interface PatientListItem {
  id: number
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: string
  primaryCondition: string | null
}

export interface PatientDetail extends PatientListItem {
  accessCode: string
  qrCodeData: string | null
  notes: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export const patientKeys = {
  all: ['patients'] as const,
  list: () => ['patients', 'list'] as const,
  detail: (id: number) => ['patients', 'detail', id] as const,
}

export async function fetchPatients(): Promise<PatientListItem[]> {
  const res = await fetch('/api/patients', {
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Failed to fetch patients')
  return res.json()
}

export const patientsQueryOptions = queryOptions({
  queryKey: patientKeys.list(),
  queryFn: fetchPatients,
  staleTime: 5 * 60 * 1000, // 5 min — patient list rarely changes
})

export async function fetchPatientDetail(id: number): Promise<PatientDetail> {
  const res = await fetch(`/api/patients/${id}`, { credentials: 'include' })
  if (!res.ok) throw new Error('Failed to fetch patient')
  return res.json()
}

export function patientDetailQueryOptions(id: number) {
  return queryOptions({
    queryKey: patientKeys.detail(id),
    queryFn: () => fetchPatientDetail(id),
  })
}
