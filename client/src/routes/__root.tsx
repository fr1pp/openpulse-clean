import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'
import type { AuthState } from '@/hooks/useAuth'

export interface RouterContext {
  auth: AuthState
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
})

function RootComponent() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main>
        <Outlet />
      </main>
    </div>
  )
}
