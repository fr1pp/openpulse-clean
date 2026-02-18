import { useState, useEffect, useRef } from 'react'
import { Play, Pause, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { useSimulatorStatus } from '@/hooks/useSimulatorStatus'
import {
  usePauseSimulator,
  useResumeSimulator,
  useSetSimulatorSpeed,
} from '@/api/mutations/simulator'

export function SimulatorToolbar() {
  const { data: status } = useSimulatorStatus()
  const pauseMutation = usePauseSimulator()
  const resumeMutation = useResumeSimulator()
  const speedMutation = useSetSimulatorSpeed()

  const isRunning = status?.running ?? false
  const serverSpeed = status?.speed ?? 1

  // Local speed state decoupled from server polling to prevent jitter during drag
  const [localSpeed, setLocalSpeed] = useState(serverSpeed)
  const interactingRef = useRef(false)

  useEffect(() => {
    if (!interactingRef.current) {
      setLocalSpeed(serverSpeed)
    }
  }, [serverSpeed])

  function handlePlayPause() {
    if (isRunning) {
      pauseMutation.mutate()
    } else {
      resumeMutation.mutate()
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

  const simTime = status?.simulatedTime
    ? new Date(status.simulatedTime).toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : '--:--:--'

  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-border bg-muted/40 px-3 py-2.5">
      {/* Play / Pause */}
      <Button
        variant={isRunning ? 'default' : 'outline'}
        size="icon"
        className="h-8 w-8 shrink-0 rounded-lg"
        onClick={handlePlayPause}
        disabled={pauseMutation.isPending || resumeMutation.isPending}
        aria-label={isRunning ? 'Pause simulation' : 'Resume simulation'}
      >
        {isRunning ? (
          <Pause className="h-3.5 w-3.5" />
        ) : (
          <Play className="h-3.5 w-3.5" />
        )}
      </Button>

      {/* Speed slider */}
      <div className="flex-1 flex items-center gap-2 min-w-0">
        <Slider
          value={[localSpeed]}
          min={1}
          max={24}
          step={1}
          onValueChange={handleSpeedDrag}
          onValueCommit={handleSpeedCommit}
          disabled={speedMutation.isPending}
          className="flex-1"
        />
        <span className="text-xs font-mono tabular-nums text-muted-foreground shrink-0 w-7 text-right">
          {localSpeed}x
        </span>
      </div>

      {/* Sim time */}
      <div className="flex items-center gap-1.5 shrink-0 text-muted-foreground border-l border-border/70 pl-2.5">
        <Clock className="h-3.5 w-3.5" />
        <span className="text-xs font-mono tabular-nums">{simTime}</span>
      </div>
    </div>
  )
}
