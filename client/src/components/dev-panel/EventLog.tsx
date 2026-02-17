import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useSimulatorEvents } from '@/hooks/useSimulatorEvents'

const eventColors: Record<string, string> = {
  threshold_entered: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  threshold_exited: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  anomaly_started: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  anomaly_resolved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  scenario_started: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  scenario_ended: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  } catch {
    return '--:--:--'
  }
}

export function EventLog() {
  const { events, clearEvents } = useSimulatorEvents(50)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Event Log</h3>
        {events.length > 0 && (
          <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={clearEvents}>
            Clear
          </Button>
        )}
      </div>

      <ScrollArea className="h-[200px] rounded-md border">
        {events.length === 0 ? (
          <p className="p-3 text-xs text-muted-foreground">
            No events yet. Events will appear as the simulator detects threshold
            crossings and anomalies.
          </p>
        ) : (
          <div className="p-2 space-y-1">
            {events.map((event, i) => (
              <div
                key={`${event.timestamp}-${event.patientId}-${i}`}
                className="flex items-start gap-2 text-xs"
              >
                <span className="text-muted-foreground font-mono whitespace-nowrap shrink-0">
                  {formatTime(event.timestamp)}
                </span>
                <Badge
                  variant="secondary"
                  className={`text-[10px] px-1 py-0 shrink-0 ${eventColors[event.type] ?? ''}`}
                >
                  {event.type.replace(/_/g, ' ')}
                </Badge>
                <span className="truncate">
                  <span className="font-medium">{event.patientName}</span>{' '}
                  <span className="text-muted-foreground">{event.message}</span>
                </span>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
