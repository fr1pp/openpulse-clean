import { createFileRoute, redirect, Outlet } from '@tanstack/react-router'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/AppSidebar'
import { SmartHeader } from '@/components/layout/SmartHeader'

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
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SmartHeader>
          <SidebarTrigger className="-ml-1" />
        </SmartHeader>
        <div className="mx-auto max-w-7xl p-6">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
