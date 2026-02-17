import { useMutation, useQueryClient } from '@tanstack/react-query'
import { authKeys } from '../queries/auth'
import type { AuthUser } from '../queries/auth'

export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }): Promise<AuthUser> => {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Login failed')
      }
      return res.json()
    },
    onSuccess: (user) => {
      queryClient.setQueryData(authKeys.me, user)
    },
  })
}

export function usePatientLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { code: string }): Promise<AuthUser> => {
      const res = await fetch('/api/auth/patient-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Invalid access code')
      }
      return res.json()
    },
    onSuccess: (user) => {
      queryClient.setQueryData(authKeys.me, user)
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/auth/logout', { method: 'POST' })
      if (!res.ok) throw new Error('Logout failed')
    },
    onSuccess: () => {
      queryClient.setQueryData(authKeys.me, null)
    },
  })
}
