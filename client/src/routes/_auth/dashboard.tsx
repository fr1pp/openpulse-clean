import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/dashboard')({
  component: DashboardLayout,
})

/**
 * Dashboard layout route. Renders the patient list (index) or patient detail
 * as children via Outlet. Required for flat file routing to work with
 * dashboard.index.tsx and dashboard.patient.$patientId.tsx.
 */
function DashboardLayout() {
  return <Outlet />
}
