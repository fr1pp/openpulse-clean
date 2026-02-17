import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'
import type { AuthState } from '@/hooks/useAuth'
import { useSocket } from '@/hooks/useSocket'
import { useVitalsStream } from '@/hooks/useVitalsStream'
import { ConnectionIndicator } from '@/components/connection/ConnectionIndicator'
import { TooltipProvider } from '@/components/ui/tooltip'

export interface RouterContext {
  auth: AuthState
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
})

/**
 * Side-effect component that manages socket lifecycle and vitals cache bridge.
 * Only rendered when user is authenticated.
 */
function SocketBridge() {
  useSocket()
  useVitalsStream()
  return <ConnectionIndicator />
}

function RootComponent() {
  const { auth } = Route.useRouteContext()

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background text-foreground">
        {auth.isAuthenticated && <SocketBridge />}
        <main>
          <Outlet />
        </main>
      </div>
    </TooltipProvider>
  )
}
