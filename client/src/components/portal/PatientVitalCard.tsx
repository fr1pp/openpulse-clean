import { ChevronDown } from 'lucide-react'
import type { ThresholdLevel } from '@openpulse/shared'
import { CARD_TINT, STATUS_TEXT_COLOR } from './portal-status'

interface PatientVitalCardProps {
  label: string
  value: string
  statusPhrase: string
  actionNudge?: string
  level: ThresholdLevel | 'unknown'
  /** ISO date string of the most recent vital reading (recordedAt) */
  timestamp?: string
  isExpanded: boolean
  onToggle: () => void
  children?: React.ReactNode
}

/**
 * Computes a human-readable relative time string from an ISO timestamp.
 * Amber coloring applied externally when stale (>5 min).
 */
function relativeTime(timestamp: string): string {
  const diffMs = Date.now() - new Date(timestamp).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'just now'
  if (mins === 1) return '1 minute ago'
  return `${mins} minutes ago`
}

function isStale(timestamp: string): boolean {
  const diffMs = Date.now() - new Date(timestamp).getTime()
  return diffMs > 5 * 60 * 1000 // > 5 minutes
}

export function PatientVitalCard({
  label,
  value,
  statusPhrase,
  actionNudge,
  level,
  timestamp,
  isExpanded,
  onToggle,
  children,
}: PatientVitalCardProps) {
  const stale = timestamp ? isStale(timestamp) : false

  return (
    <div
      className={`rounded-2xl border shadow-sm hover:shadow-md transition-shadow duration-200 motion-reduce:transition-none ${CARD_TINT[level]}`}
    >
      {/* Tappable header area — full card header is the tap target, min 48px for elderly users */}
      <button
        onClick={onToggle}
        aria-expanded={isExpanded}
        className="w-full px-6 pt-6 pb-4 flex items-center justify-between min-h-[80px]"
      >
        <div className="flex flex-col items-start text-left">
          {/* Vital label */}
          <span className="text-base font-medium text-muted-foreground">{label}</span>
          {/* Large vital number — 48px, top of 36-48px range for elderly readability */}
          <span className="text-3xl sm:text-5xl font-bold text-foreground mt-1 leading-none">{value}</span>

          {/* Freshness indicator — shows relative time below the value */}
          {timestamp && (
            <span
              className={`text-sm mt-2 transition-colors duration-300 ${
                stale
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-muted-foreground'
              }`}
            >
              Updated {relativeTime(timestamp)}
            </span>
          )}
        </div>

        {/* Right side: expand hint + larger chevron for elderly users */}
        <div className="flex flex-col items-center gap-1 ml-4 flex-shrink-0">
          {!isExpanded && (
            <span className="text-xs text-muted-foreground/70 font-medium whitespace-nowrap">
              See trend
            </span>
          )}
          <ChevronDown
            className={`h-7 w-7 text-muted-foreground/60 transition-transform duration-300 motion-reduce:transition-none ${
              isExpanded ? 'rotate-180' : ''
            }`}
          />
        </div>
      </button>

      {/* Status phrase below the tap area */}
      <div className="px-6 pb-2">
        <p className={`text-lg font-semibold ${STATUS_TEXT_COLOR[level]}`}>
          {statusPhrase}
        </p>

        {/* Action nudge for critical readings only */}
        {actionNudge && (
          <p className="text-sm text-red-600 dark:text-red-400 mt-1 font-medium">{actionNudge}</p>
        )}
      </div>

      {/* Expand area — CSS grid trick for smooth height animation */}
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-in-out motion-reduce:transition-none ${
          isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-6 pb-6">{children}</div>
        </div>
      </div>
    </div>
  )
}
