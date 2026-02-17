import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useSimulatorStatus } from '@/hooks/useSimulatorStatus'

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
              <span className="text-sm font-medium">{p.patientName}</span>
              <div className="flex items-center gap-1">
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

            <div className="grid grid-cols-5 gap-1 text-center">
              <VitalCell label="HR" value={p.currentValues.heartRate} unit="bpm" />
              <VitalCell
                label="BP"
                value={`${p.currentValues.bpSystolic}/${p.currentValues.bpDiastolic}`}
              />
              <VitalCell label="SpO2" value={p.currentValues.spo2} unit="%" />
              <VitalCell label="Temp" value={p.currentValues.temperature} unit="F" />
              <VitalCell
                label="Anomaly"
                value={p.isAnomaly ? 'Yes' : 'No'}
                highlight={p.isAnomaly}
              />
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
  highlight,
}: {
  label: string
  value: string | number
  unit?: string
  highlight?: boolean
}) {
  return (
    <div className="flex flex-col">
      <span className="text-[9px] text-muted-foreground uppercase">{label}</span>
      <span
        className={`text-xs font-mono ${highlight ? 'text-red-500 font-bold' : ''}`}
      >
        {value}
        {unit && <span className="text-[8px] text-muted-foreground">{unit}</span>}
      </span>
    </div>
  )
}
