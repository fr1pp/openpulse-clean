import { createFileRoute, redirect, Outlet } from '@tanstack/react-router'
import { useAuth } from '@/hooks/useAuth'
import { ThemeToggle } from '@/components/layout/ThemeToggle'

export const Route = createFileRoute('/portal/_portal')({
  beforeLoad: ({ context, location }) => {
    if (!context.auth.isAuthenticated || context.auth.user?.role !== 'patient') {
      throw redirect({
        to: '/patient-login',
        search: { redirect: location.href },
      })
    }
  },
  component: PortalLayout,
})

function PortalLayout() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-background/95 backdrop-blur-sm border-b border-border px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          {/* Portal wordmark — not linked to /dashboard */}
          <span className="flex items-center font-semibold tracking-tight text-lg text-foreground">
            <span>open</span>
            <span className="text-red-500">pulse</span>
          </span>

          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {user?.firstName} {user?.lastName}
            </span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl p-6">
        <Outlet />
      </div>
    </div>
  )
}
