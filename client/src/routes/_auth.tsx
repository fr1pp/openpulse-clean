import { createFileRoute, redirect, Outlet, useNavigate } from '@tanstack/react-router'
import { useLogout } from '@/api/mutations/auth'
import { useAuth } from '@/hooks/useAuth'

export const Route = createFileRoute('/_auth')({
  beforeLoad: ({ context, location }) => {
    if (!context.auth.isAuthenticated || context.auth.user?.role !== 'healthcare_pro') {
      throw redirect({
        to: '/login',
        search: { redirect: location.href },
      })
    }
  },
  component: AuthLayout,
})

function AuthLayout() {
  const { user } = useAuth()
  const logout = useLogout()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        navigate({ to: '/login' })
      },
    })
  }

  return (
    <div className="min-h-screen">
      <header className="border-b bg-card px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <h1 className="text-xl font-semibold text-foreground">OpenPulse</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {user?.firstName} {user?.lastName}
            </span>
            <button
              onClick={handleLogout}
              disabled={logout.isPending}
              className="rounded-md bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground hover:bg-secondary/80 disabled:opacity-50"
            >
              {logout.isPending ? 'Logging out...' : 'Log out'}
            </button>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-7xl p-6">
        <Outlet />
      </div>
    </div>
  )
}
