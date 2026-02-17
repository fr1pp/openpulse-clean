import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useSimulatorStatus } from '@/hooks/useSimulatorStatus'
import { useMediaQuery } from '@/hooks/use-media-query'
import { SimulatorControls } from './SimulatorControls'
import { ScenarioSelector } from './ScenarioSelector'
import { PatientStateView } from './PatientStateView'
import { EventLog } from './EventLog'

interface DevPanelDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DevPanelDrawer({ open, onOpenChange }: DevPanelDrawerProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const { data: status } = useSimulatorStatus()
  const isRunning = status?.running ?? false

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isDesktop ? 'right' : 'bottom'}
        className={
          isDesktop
            ? 'sm:max-w-md flex flex-col p-0'
            : 'max-h-[80vh] flex flex-col p-0 rounded-t-xl'
        }
      >
        <SheetHeader className="px-5 pt-5 pb-3 shrink-0">
          <div className="flex items-center gap-3">
            <SheetTitle className="text-base">Simulator Dev Panel</SheetTitle>
            <Badge variant={isRunning ? 'default' : 'destructive'} className="text-xs">
              {isRunning ? 'Running' : 'Paused'}
            </Badge>
          </div>
          <SheetDescription className="text-xs">
            {status?.patientCount ?? 0} patients &middot; {isRunning ? `${status?.speed ?? 1}x speed` : 'paused'}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-5 pb-5">
          <div className="space-y-5">
            <SimulatorControls />
            <Separator />
            <ScenarioSelector />
            <Separator />
            <PatientStateView />
            <Separator />
            <EventLog />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
