import { createFileRoute } from '@tanstack/react-router'
import type { VitalType } from '@openpulse/shared'

export const Route = createFileRoute('/')({
  component: IndexComponent,
})

// Demonstrate shared types are importable
const vitalTypes: VitalType[] = ['heartRate', 'bpSystolic', 'bpDiastolic', 'spo2', 'temperature']

function IndexComponent() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-4xl font-bold tracking-tight">OpenPulse</h1>
      <p className="text-lg text-muted-foreground">Foundation ready</p>
      <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
        <p className="text-sm font-medium">Shared types working:</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Vital types: {vitalTypes.join(', ')}
        </p>
      </div>
    </div>
  )
}
