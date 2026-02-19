import { useState } from 'react'
import { createFileRoute, redirect, Outlet } from '@tanstack/react-router'
import { TopNav } from '@/components/layout/TopNav'
import { DevPanelDrawer } from '@/components/dev-panel/DevPanelDrawer'

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
  const [devPanelOpen, setDevPanelOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <TopNav onDevPanelOpen={() => setDevPanelOpen(true)} />
      <div className="pt-14 pb-0">
        <div className="mx-auto max-w-7xl p-6">
          <Outlet />
        </div>
      </div>
      <DevPanelDrawer open={devPanelOpen} onOpenChange={setDevPanelOpen} />
    </div>
  )
}
