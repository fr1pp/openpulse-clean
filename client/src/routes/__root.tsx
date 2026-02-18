import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'
import type { AuthState } from '@/hooks/useAuth'
import { useSocket } from '@/hooks/useSocket'
import { useVitalsStream } from '@/hooks/useVitalsStream'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/sonner'

export interface RouterContext {
  auth: AuthState
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
})

/**
 * Side-effect component that manages socket lifecycle and vitals cache bridge.
 * Only rendered when user is authenticated. Returns null — no UI here.
 * ConnectionIndicator is now inline in TopNav (inside _auth layout).
 */
function SocketBridge() {
  useSocket()
  useVitalsStream()
  return null
}

function RootComponent() {
  const { auth } = Route.useRouteContext()

  return (
    <TooltipProvider delayDuration={300}>
      <div className="min-h-screen bg-background text-foreground">
        {auth.isAuthenticated && <SocketBridge />}
        <main>
          <Outlet />
        </main>
        <Toaster />
      </div>
    </TooltipProvider>
  )
}
