import { Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DevPanelTriggerProps {
  onClick: () => void
}

export function DevPanelTrigger({ onClick }: DevPanelTriggerProps) {
  return (
    <Button
      variant="outline"
      size="icon"
      className="fixed bottom-4 right-4 z-50 rounded-full w-10 h-10 shadow-md bg-background/80 backdrop-blur-sm"
      onClick={onClick}
      aria-label="Open dev panel"
    >
      <Settings className="h-5 w-5" />
    </Button>
  )
}
