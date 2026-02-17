import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  beforeLoad: ({ context }) => {
    if (context.auth.isAuthenticated) {
      if (context.auth.user?.role === 'healthcare_pro') {
        throw redirect({ to: '/dashboard' })
      }
      if (context.auth.user?.role === 'patient') {
        throw redirect({ to: '/portal/vitals' })
      }
    }
    throw redirect({ to: '/login' })
  },
})
