import { useState } from 'react'
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'
import type { AuthState } from '@/hooks/useAuth'
import { useSocket } from '@/hooks/useSocket'
import { useVitalsStream } from '@/hooks/useVitalsStream'
import { ConnectionIndicator } from '@/components/connection/ConnectionIndicator'
import { DevPanelTrigger } from '@/components/dev-panel/DevPanelTrigger'
import { DevPanelDrawer } from '@/components/dev-panel/DevPanelDrawer'
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
 * Only rendered when user is authenticated.
 */
function SocketBridge() {
  useSocket()
  useVitalsStream()
  return <ConnectionIndicator />
}

/**
 * Dev panel with floating trigger button and slide-out drawer.
 * Only rendered when user is authenticated (both roles).
 */
function DevPanel() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <DevPanelTrigger onClick={() => setOpen(true)} />
      <DevPanelDrawer open={open} onOpenChange={setOpen} />
    </>
  )
}

function RootComponent() {
  const { auth } = Route.useRouteContext()

  return (
    <TooltipProvider delayDuration={300}>
      <div className="min-h-screen bg-background text-foreground">
        {auth.isAuthenticated && <SocketBridge />}
        {auth.isAuthenticated && <DevPanel />}
        <main>
          <Outlet />
        </main>
        <Toaster />
      </div>
    </TooltipProvider>
  )
}
