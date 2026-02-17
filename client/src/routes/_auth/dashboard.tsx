import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
      <p className="mt-2 text-muted-foreground">
        Healthcare professional dashboard coming in Phase 4.
      </p>
    </div>
  )
}
