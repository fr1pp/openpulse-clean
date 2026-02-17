import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { useSimulatorEvents } from '@/hooks/useSimulatorEvents'

const eventStyles: Record<
  string,
  { label: string; fullLabel: string; className: string }
> = {
  threshold_entered: {
    label: 'warn',
    fullLabel: 'Threshold Crossed',
    className:
      'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  },
  threshold_exited: {
    label: 'ok',
    fullLabel: 'Threshold Normal',
    className:
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  },
  anomaly_started: {
    label: 'alert',
    fullLabel: 'Anomaly Detected',
    className:
      'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
  },
  anomaly_resolved: {
    label: 'ok',
    fullLabel: 'Anomaly Resolved',
    className:
      'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  },
  scenario_started: {
    label: 'start',
    fullLabel: 'Scenario Started',
    className:
      'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  },
  scenario_ended: {
    label: 'end',
    fullLabel: 'Scenario Ended',
    className:
      'bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-300',
  },
}

const fallbackStyle = {
  label: '?',
  fullLabel: 'Unknown Event',
  className: 'bg-muted text-muted-foreground',
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
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  function toggleExpand(index: number) {
    setExpandedIndex((prev) => (prev === index ? null : index))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
          Events
        </span>
        {events.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-xs px-2 text-muted-foreground hover:text-foreground"
            onClick={() => {
              clearEvents()
              setExpandedIndex(null)
            }}
          >
            Clear
          </Button>
        )}
      </div>

      <ScrollArea className="h-[220px] rounded-lg ring-1 ring-border">
        {events.length === 0 ? (
          <div className="flex items-center justify-center h-[220px] text-sm text-muted-foreground">
            No events yet
          </div>
        ) : (
          <div>
            {events.map((event, i) => {
              const style = eventStyles[event.type] ?? fallbackStyle
              const isExpanded = expandedIndex === i

              return (
                <div
                  key={`${event.timestamp}-${event.patientId}-${i}`}
                  className={cn(
                    'cursor-pointer transition-colors',
                    i % 2 === 1 ? 'bg-muted/40 dark:bg-muted/20' : '',
                    isExpanded && 'bg-muted/60 dark:bg-muted/30'
                  )}
                  role="button"
                  tabIndex={0}
                  onClick={() => toggleExpand(i)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      toggleExpand(i)
                    }
                  }}
                >
                  {/* Main row */}
                  <div className="flex items-center gap-2 px-3 py-1.5">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium shrink-0 ${style.className}`}
                    >
                      {style.label}
                    </span>
                    <span className="text-xs font-medium truncate flex-1">
                      {event.patientName}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono tabular-nums shrink-0">
                      {formatTime(event.timestamp)}
                    </span>
                  </div>

                  {/* Expandable detail */}
                  <div
                    className={cn(
                      'grid transition-[grid-template-rows] duration-200 ease-out',
                      isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                    )}
                  >
                    <div className="overflow-hidden">
                      <div className="px-3 pb-2 pt-1 border-t border-border/40 mx-2">
                        <p className="text-xs text-foreground/80 leading-relaxed">
                          {event.message}
                        </p>
                        <span className="text-[11px] text-muted-foreground mt-1 block">
                          {style.fullLabel}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
