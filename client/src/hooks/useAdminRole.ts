import { useQuery } from '@tanstack/react-query'
import { authMeQueryOptions } from '@/api/queries/auth'

export function useAdminRole(): boolean {
  const { data: user } = useQuery(authMeQueryOptions)
  return user?.adminRole === 'admin'
}
