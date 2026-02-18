import { Terminal } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DevPanelTriggerProps {
  onClick: () => void
}

export function DevPanelTrigger({ onClick }: DevPanelTriggerProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="text-muted-foreground hover:text-foreground"
      onClick={onClick}
      aria-label="Open dev panel"
    >
      <Terminal className="h-4 w-4" />
    </Button>
  )
}
