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
  { color: string; label: string; pulse: boolean; hidden: boolean }
> = {
  connected: {
    color: 'bg-green-500',
    label: 'Live connection active',
    pulse: false,
    hidden: true, // connected is the normal state — hide the dot
  },
  reconnecting: {
    color: 'bg-amber-500',
    label: 'Reconnecting...',
    pulse: true,
    hidden: false,
  },
  disconnected: {
    color: 'bg-red-500',
    label: 'Connection lost',
    pulse: false,
    hidden: false,
  },
}

export function ConnectionIndicator() {
  const { status, reconnectAttempt } = useConnectionStatus()
  const config = statusConfig[status]

  const tooltipText =
    status === 'reconnecting' && reconnectAttempt > 0
      ? `${config.label} (attempt ${reconnectAttempt})`
      : config.label

  if (config.hidden) {
    return null
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className="flex items-center justify-center px-1"
          aria-label={tooltipText}
          role="status"
        >
          <div
            className={`h-2 w-2 rounded-full ${config.color} ${config.pulse ? 'animate-pulse' : ''}`}
          />
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={8}>
        {tooltipText}
      </TooltipContent>
    </Tooltip>
  )
}
