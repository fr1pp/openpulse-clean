import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useSimulatorStatus } from '@/hooks/useSimulatorStatus'

export function PatientStateView() {
  const { data: status, isLoading } = useSimulatorStatus()

  if (isLoading) {
    return (
      <div className="space-y-2">
        <h3 className="text-sm font-semibold">Patient States</h3>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-md" />
        ))}
      </div>
    )
  }

  const patients = status?.patients ?? []

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold">
        Patient States ({patients.length})
      </h3>

      <div className="space-y-1.5">
        {patients.map((p) => (
          <div key={p.patientId} className="rounded-md border px-2.5 py-1.5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium truncate mr-2">{p.patientName}</span>
              <div className="flex items-center gap-1 shrink-0">
                {p.isAnomaly && (
                  <Badge variant="destructive" className="text-[9px] px-1 py-0 leading-tight">
                    anomaly
                  </Badge>
                )}
                {p.activeScenario && (
                  <Badge variant="secondary" className="text-[9px] px-1 py-0 leading-tight">
                    {p.activeScenario.name}
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-baseline gap-3 text-xs font-mono tabular-nums text-muted-foreground">
              <span>
                <span className="text-foreground">{Math.round(p.currentValues.heartRate)}</span>
                <span className="text-[9px] ml-0.5">bpm</span>
              </span>
              <span>
                <span className="text-foreground">{Math.round(p.currentValues.bpSystolic)}/{Math.round(p.currentValues.bpDiastolic)}</span>
                <span className="text-[9px] ml-0.5">mmHg</span>
              </span>
              <span>
                <span className="text-foreground">{p.currentValues.spo2.toFixed(1)}</span>
                <span className="text-[9px] ml-0.5">%</span>
              </span>
              <span>
                <span className="text-foreground">{p.currentValues.temperature.toFixed(1)}</span>
                <span className="text-[9px] ml-0.5">°C</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
