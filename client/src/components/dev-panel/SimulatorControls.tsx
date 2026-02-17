import { useState, useEffect, useRef } from 'react'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useSimulatorStatus } from '@/hooks/useSimulatorStatus'
import {
  usePauseSimulator,
  useResumeSimulator,
  useSetSimulatorSpeed,
  useResetAllPatients,
} from '@/api/mutations/simulator'

export function SimulatorControls() {
  const { data: status } = useSimulatorStatus()
  const pauseMutation = usePauseSimulator()
  const resumeMutation = useResumeSimulator()
  const speedMutation = useSetSimulatorSpeed()
  const resetAllMutation = useResetAllPatients()
  const [confirmReset, setConfirmReset] = useState(false)

  const isRunning = status?.running ?? false
  const serverSpeed = status?.speed ?? 1

  // Local speed state decoupled from server polling.
  // Only sync from server when we're not actively interacting.
  const [localSpeed, setLocalSpeed] = useState(serverSpeed)
  const interactingRef = useRef(false)

  useEffect(() => {
    if (!interactingRef.current) {
      setLocalSpeed(serverSpeed)
    }
  }, [serverSpeed])

  function handleToggle(checked: boolean) {
    if (checked) {
      resumeMutation.mutate()
    } else {
      pauseMutation.mutate()
    }
  }

  function handleSpeedDrag(value: number[]) {
    interactingRef.current = true
    const speed = value[0]
    if (speed !== undefined) setLocalSpeed(speed)
  }

  function handleSpeedCommit(value: number[]) {
    interactingRef.current = false
    const speed = value[0]
    if (speed !== undefined) speedMutation.mutate(speed)
  }

  function handleResetAll() {
    if (!confirmReset) {
      setConfirmReset(true)
      setTimeout(() => setConfirmReset(false), 3000)
      return
    }
    resetAllMutation.mutate()
    setConfirmReset(false)
  }

  const simulatedTime = status?.simulatedTime
    ? new Date(status.simulatedTime).toLocaleString()
    : '--'

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold">Controls</h3>

      <div className="flex items-center justify-between">
        <Label htmlFor="sim-toggle" className="text-sm">
          {isRunning ? 'Running' : 'Paused'}
        </Label>
        <Switch
          id="sim-toggle"
          checked={isRunning}
          onCheckedChange={handleToggle}
          disabled={pauseMutation.isPending || resumeMutation.isPending}
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-sm">Speed</Label>
          <span className="text-xs text-muted-foreground font-mono tabular-nums">
            {localSpeed}x
          </span>
        </div>
        <Slider
          value={[localSpeed]}
          min={1}
          max={24}
          step={1}
          onValueChange={handleSpeedDrag}
          onValueCommit={handleSpeedCommit}
          disabled={speedMutation.isPending}
        />
      </div>

      <div className="flex items-center justify-between gap-2">
        <Label className="text-sm shrink-0">Sim. Time</Label>
        <span className="text-xs text-muted-foreground font-mono tabular-nums truncate">
          {simulatedTime}
        </span>
      </div>

      <Button
        variant={confirmReset ? 'destructive' : 'outline'}
        size="sm"
        className="w-full"
        onClick={handleResetAll}
        disabled={resetAllMutation.isPending}
      >
        {confirmReset ? 'Confirm Reset All' : 'Reset All Patients'}
      </Button>
    </div>
  )
}
