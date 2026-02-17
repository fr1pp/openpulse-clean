import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useSimulatorEvents } from '@/hooks/useSimulatorEvents'

const eventStyles: Record<string, { label: string; className: string }> = {
  threshold_entered: { label: 'warn', className: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' },
  threshold_exited: { label: 'ok', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  anomaly_started: { label: 'alert', className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
  anomaly_resolved: { label: 'ok', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  scenario_started: { label: 'start', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  scenario_ended: { label: 'end', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('en-US', {
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
  const { events, clearEvents } = useSimulatorEvents(30)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Events</h3>
        {events.length > 0 && (
          <Button variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={clearEvents}>
            Clear
          </Button>
        )}
      </div>

      <div className="h-[160px] overflow-y-auto rounded-md border text-[11px]">
        {events.length === 0 ? (
          <p className="p-3 text-xs text-muted-foreground text-center">
            No events yet
          </p>
        ) : (
          <table className="w-full">
            <tbody>
              {events.map((event, i) => {
                const style = eventStyles[event.type] ?? { label: event.type, className: '' }
                return (
                  <tr key={`${event.timestamp}-${event.patientId}-${i}`} className="border-b last:border-b-0">
                    <td className="py-0.5 pl-2 pr-1 text-muted-foreground font-mono tabular-nums whitespace-nowrap align-middle">
                      {formatTime(event.timestamp)}
                    </td>
                    <td className="py-0.5 px-1 align-middle">
                      <Badge variant="secondary" className={`text-[9px] px-1 py-0 leading-tight ${style.className}`}>
                        {style.label}
                      </Badge>
                    </td>
                    <td className="py-0.5 pl-1 pr-2 truncate max-w-[180px] align-middle">
                      {event.patientName}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
