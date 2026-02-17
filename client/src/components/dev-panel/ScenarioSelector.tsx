import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useSimulatorStatus } from '@/hooks/useSimulatorStatus'
import {
  useAvailableScenarios,
  useApplyScenario,
  useResetPatient,
} from '@/api/mutations/simulator'
import { useState } from 'react'

export function ScenarioSelector() {
  const { data: status } = useSimulatorStatus()
  const { data: scenarios } = useAvailableScenarios()
  const applyMutation = useApplyScenario()
  const resetMutation = useResetPatient()
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null)

  const patients = status?.patients ?? []
  const selectedPatient = patients.find((p) => p.patientId === selectedPatientId)

  function handleApplyScenario(scenarioId: string) {
    if (selectedPatientId === null) return
    applyMutation.mutate({ patientId: selectedPatientId, scenarioId })
  }

  function handleResetPatient() {
    if (selectedPatientId === null) return
    resetMutation.mutate(selectedPatientId)
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold">Scenarios</h3>

      <Select
        value={selectedPatientId?.toString() ?? ''}
        onValueChange={(val) => setSelectedPatientId(Number(val))}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a patient" />
        </SelectTrigger>
        <SelectContent>
          {patients.map((p) => (
            <SelectItem key={p.patientId} value={p.patientId.toString()}>
              {p.patientName} (ID: {p.patientId})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedPatient?.activeScenario && (
        <div className="flex items-center justify-between rounded-md border p-2">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                Active
              </Badge>
              <span className="text-sm font-medium">
                {selectedPatient.activeScenario.name}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.ceil(selectedPatient.activeScenario.remainingMs / 1000)}s remaining
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetPatient}
            disabled={resetMutation.isPending}
          >
            Cancel
          </Button>
        </div>
      )}

      {selectedPatientId !== null && scenarios && (
        <div className="grid grid-cols-2 gap-2">
          {scenarios.map((s) => (
            <Button
              key={s.id}
              variant="outline"
              size="sm"
              className="h-auto flex-col items-start p-2 text-left"
              onClick={() => handleApplyScenario(s.id)}
              disabled={applyMutation.isPending}
            >
              <span className="text-xs font-medium">{s.name}</span>
              <span className="text-[10px] text-muted-foreground line-clamp-2">
                {s.description}
              </span>
            </Button>
          ))}
        </div>
      )}

      {selectedPatientId === null && (
        <p className="text-xs text-muted-foreground">
          Select a patient to apply a scenario.
        </p>
      )}
    </div>
  )
}
