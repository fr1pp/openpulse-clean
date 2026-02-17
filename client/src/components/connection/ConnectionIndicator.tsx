import {
  useConnectionStatus,
  type ConnectionState,
} from '@/hooks/useConnectionStatus'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const statusConfig: Record<
  ConnectionState,
  { color: string; label: string; pulse: boolean }
> = {
  connected: {
    color: 'bg-green-500',
    label: 'Live connection active',
    pulse: false,
  },
  reconnecting: {
    color: 'bg-yellow-500',
    label: 'Reconnecting...',
    pulse: true,
  },
  disconnected: {
    color: 'bg-red-500',
    label: 'Connection lost',
    pulse: false,
  },
}

export function ConnectionIndicator() {
  const { status, reconnectAttempt } = useConnectionStatus()
  const config = statusConfig[status]

  const tooltipText =
    status === 'reconnecting' && reconnectAttempt > 0
      ? `${config.label} (attempt ${reconnectAttempt})`
      : config.label

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center justify-center rounded-full bg-black/20 p-1.5 backdrop-blur-sm">
            <div
              className={`h-2.5 w-2.5 rounded-full ${config.color} ${config.pulse ? 'animate-pulse' : ''}`}
              role="status"
              aria-label={tooltipText}
            />
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          {tooltipText}
        </TooltipContent>
      </Tooltip>
    </div>
  )
}
