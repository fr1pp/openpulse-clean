import { useQuery } from '@tanstack/react-query'
import { authMeQueryOptions } from '@/api/queries/auth'
import type { AuthUser } from '@/api/queries/auth'

export interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
}

export function useAuth(): AuthState {
  const { data, isPending } = useQuery(authMeQueryOptions)

  return {
    user: data ?? null,
    isAuthenticated: !!data,
    isLoading: isPending,
  }
}
