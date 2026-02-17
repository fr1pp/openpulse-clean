import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
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

function DevPanelContent() {
  return (
    <div className="space-y-4">
      <Separator />
      <SimulatorControls />
      <Separator />
      <ScenarioSelector />
      <Separator />
      <PatientStateView />
      <Separator />
      <EventLog />
    </div>
  )
}

function StatusBadge() {
  const { data: status } = useSimulatorStatus()
  const isRunning = status?.running ?? false

  return (
    <Badge variant={isRunning ? 'default' : 'destructive'} className="text-xs">
      {isRunning ? 'Running' : 'Paused'}
    </Badge>
  )
}

export function DevPanelDrawer({ open, onOpenChange }: DevPanelDrawerProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const { data: status } = useSimulatorStatus()

  if (isDesktop) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="sm:max-w-md p-0">
          <SheetHeader className="px-6 pt-6 pb-2">
            <div className="flex items-center gap-3">
              <SheetTitle>Simulator Dev Panel</SheetTitle>
              <StatusBadge />
            </div>
            <SheetDescription>
              {status?.patientCount ?? 0} patients
            </SheetDescription>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-5rem)]">
            <div className="px-6 pb-6">
              <DevPanelContent />
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <div className="flex items-center gap-3">
            <DrawerTitle>Simulator Dev Panel</DrawerTitle>
            <StatusBadge />
          </div>
          <DrawerDescription>
            {status?.patientCount ?? 0} patients
          </DrawerDescription>
        </DrawerHeader>
        <ScrollArea className="max-h-[60vh] overflow-auto">
          <div className="px-4 pb-6">
            <DevPanelContent />
          </div>
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  )
}
