import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/portal/_portal/vitals')({
  component: VitalsPage,
})

function VitalsPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight">My Vitals</h2>
      <p className="mt-2 text-muted-foreground">
        Patient vitals view coming in Phase 7.
      </p>
    </div>
  )
}
