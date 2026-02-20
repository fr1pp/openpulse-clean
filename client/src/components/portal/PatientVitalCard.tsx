import type { ThresholdLevel } from '@openpulse/shared'
import { CARD_TINT } from './portal-status'

interface PatientVitalCardProps {
  label: string
  value: string
  valueTextClass: string
  level: ThresholdLevel | 'unknown'
  /** ISO date string of the most recent vital reading (recordedAt) */
  timestamp?: string
  children?: React.ReactNode
}

/**
 * Computes a human-readable relative time string from an ISO timestamp.
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

/**
 * Simplified patient vital card for the portal — always shows chart.
 * No expand/collapse interaction, no status phrase text.
 * Chart renders directly as children, always visible.
 *
 * Apple Health / accessibility-first design:
 * - Large value text for elderly readability
 * - Subtle card tint per threshold level
 * - Freshness indicator below value
 */
export function PatientVitalCard({
  label,
  value,
  valueTextClass,
  level,
  timestamp,
  children,
}: PatientVitalCardProps) {
  const stale = timestamp ? isStale(timestamp) : false

  return (
    <div
      className={`rounded-2xl border shadow-sm ${CARD_TINT[level]}`}
    >
      {/* Card header — vital label, large value, freshness */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex flex-col items-start">
          {/* Vital label */}
          <span className="text-base font-medium text-muted-foreground">{label}</span>
          {/* Large vital number — 48px for elderly readability */}
          <span className={`text-3xl sm:text-5xl font-bold mt-1 leading-none ${valueTextClass}`}>
            {value}
          </span>

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
      </div>

      {/* Chart area — always visible, with slight horizontal bleed */}
      {children && (
        <div className="pb-5 px-1">
          {children}
        </div>
      )}
    </div>
  )
}
