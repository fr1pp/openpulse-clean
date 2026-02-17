import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useSimulatorStatus } from '@/hooks/useSimulatorStatus'

function fmtInt(v: number): string {
  return Math.round(v).toString()
}

function fmtDec(v: number): string {
  return v.toFixed(1)
}

export function PatientStateView() {
  const { data: status, isLoading } = useSimulatorStatus()

  if (isLoading) {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold">Patient States</h3>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-md" />
        ))}
      </div>
    )
  }

  const patients = status?.patients ?? []

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold">
        Patient States ({patients.length})
      </h3>

      <div className="space-y-2">
        {patients.map((p) => (
          <div
            key={p.patientId}
            className="rounded-md border p-2 space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium truncate">{p.patientName}</span>
              <div className="flex items-center gap-1 shrink-0">
                {p.isAnomaly && (
                  <span
                    className="inline-block w-2 h-2 rounded-full bg-red-500"
                    title="Anomaly detected"
                  />
                )}
                {p.activeScenario && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    {p.activeScenario.name}
                  </Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <VitalCell label="HR" value={fmtInt(p.currentValues.heartRate)} unit="bpm" />
              <VitalCell label="BP" value={`${fmtInt(p.currentValues.bpSystolic)}/${fmtInt(p.currentValues.bpDiastolic)}`} />
              <VitalCell label="SpO2" value={fmtDec(p.currentValues.spo2)} unit="%" />
              <VitalCell label="Temp" value={fmtDec(p.currentValues.temperature)} unit="°C" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function VitalCell({
  label,
  value,
  unit,
}: {
  label: string
  value: string
  unit?: string
}) {
  return (
    <div className="min-w-0">
      <div className="text-[9px] text-muted-foreground uppercase">{label}</div>
      <div className="text-xs font-mono tabular-nums truncate">
        {value}
        {unit && <span className="text-[8px] text-muted-foreground ml-0.5">{unit}</span>}
      </div>
    </div>
  )
}
