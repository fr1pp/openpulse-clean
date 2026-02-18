import { queryOptions } from '@tanstack/react-query'

export interface AuthUser {
  id: number
  role: 'healthcare_pro' | 'patient'
  firstName: string
  lastName: string
  email?: string
  accessCode?: string
  adminRole?: 'admin' | 'pro'
}

export const authKeys = {
  me: ['auth', 'me'] as const,
}

export const authMeQueryOptions = queryOptions({
  queryKey: authKeys.me,
  queryFn: async (): Promise<AuthUser | null> => {
    const res = await fetch('/api/auth/me')
    if (res.status === 401) return null
    if (!res.ok) throw new Error('Failed to fetch auth state')
    return res.json()
  },
  staleTime: Infinity,
  retry: false,
})
