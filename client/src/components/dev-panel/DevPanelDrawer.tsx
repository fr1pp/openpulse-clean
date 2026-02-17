import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useSimulatorStatus } from '@/hooks/useSimulatorStatus'
import { SimulatorControls } from './SimulatorControls'
import { ScenarioSelector } from './ScenarioSelector'
import { PatientStateView } from './PatientStateView'
import { EventLog } from './EventLog'

interface DevPanelDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DevPanelDrawer({ open, onOpenChange }: DevPanelDrawerProps) {
  const { data: status } = useSimulatorStatus()
  const isRunning = status?.running ?? false

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md p-0">
        <SheetHeader className="px-6 pt-6 pb-2">
          <div className="flex items-center gap-3">
            <SheetTitle>Simulator Dev Panel</SheetTitle>
            <Badge variant={isRunning ? 'default' : 'destructive'} className="text-xs">
              {isRunning ? 'Running' : 'Paused'}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {status?.patientCount ?? 0} patients
          </p>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-5rem)]">
          <div className="px-6 pb-6 space-y-4">
            <Separator />
            <SimulatorControls />
            <Separator />
            <ScenarioSelector />
            <Separator />
            <PatientStateView />
            <Separator />
            <EventLog />
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
