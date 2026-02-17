import { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useSimulatorStatus } from '@/hooks/useSimulatorStatus'
import { useMediaQuery } from '@/hooks/use-media-query'
import { useResetAllPatients } from '@/api/mutations/simulator'
import { SimulatorToolbar } from './SimulatorToolbar'
import { PatientCard } from './PatientCard'
import { EventLog } from './EventLog'

interface DevPanelDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DevPanelDrawer({ open, onOpenChange }: DevPanelDrawerProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const { data: status, isLoading } = useSimulatorStatus()
  const resetAllMutation = useResetAllPatients()
  const [expandedPatientId, setExpandedPatientId] = useState<number | null>(
    null
  )
  const [confirmReset, setConfirmReset] = useState(false)

  const patients = status?.patients ?? []
  const isRunning = status?.running ?? false

  function handleResetAll() {
    if (!confirmReset) {
      setConfirmReset(true)
      setTimeout(() => setConfirmReset(false), 3000)
      return
    }
    resetAllMutation.mutate()
    setConfirmReset(false)
  }

  function togglePatient(patientId: number) {
    setExpandedPatientId((prev) => (prev === patientId ? null : patientId))
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isDesktop ? 'right' : 'bottom'}
        className={
          isDesktop
            ? 'sm:max-w-md flex flex-col p-0'
            : 'max-h-[85vh] flex flex-col p-0 rounded-t-xl'
        }
      >
        {/* Header */}
        <SheetHeader className="px-4 pt-4 pb-0 shrink-0">
          <div className="flex items-center gap-2">
            <div
              className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                isRunning ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
            <SheetTitle className="text-base font-semibold">
              Simulator
            </SheetTitle>
          </div>
          <SheetDescription className="sr-only">
            Simulator controls and patient state
          </SheetDescription>
        </SheetHeader>

        {/* Toolbar */}
        <div className="px-4 pt-2.5 pb-1 shrink-0">
          <SimulatorToolbar />
        </div>

        {/* Scrollable content */}
        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
          {/* Patients */}
          <div className="px-4 pb-3">
            <div className="text-xs font-medium tracking-wider text-muted-foreground uppercase mb-2">
              Patients ({patients.length})
            </div>
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {patients.map((p) => (
                  <PatientCard
                    key={p.patientId}
                    patient={p}
                    isExpanded={expandedPatientId === p.patientId}
                    onToggle={() => togglePatient(p.patientId)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Events */}
          <div className="px-4 pb-3">
            <EventLog />
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 pb-4 pt-2 shrink-0 border-t">
          <Button
            variant={confirmReset ? 'destructive' : 'outline'}
            size="sm"
            className="w-full text-sm h-9"
            onClick={handleResetAll}
            disabled={resetAllMutation.isPending}
          >
            {confirmReset ? 'Confirm Reset All' : 'Reset All Patients'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
