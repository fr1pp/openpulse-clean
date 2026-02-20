import type { TimeRange } from '@openpulse/shared'
import { cn } from '@/lib/utils'

const RANGES: { value: TimeRange; label: string }[] = [
  { value: '6h', label: '6h' },
  { value: '24h', label: '24h' },
  { value: '7d', label: '7d' },
  { value: '30d', label: '30d' },
]

export interface ChartTimeRangeSelectorProps {
  value: TimeRange
  onChange: (range: TimeRange) => void
  className?: string
}

/**
 * Per-chart segmented time range control.
 * Compact pill/capsule design matching the PatientSortToggle pattern.
 * Options: 6h | 24h | 7d | 30d.
 */
export function ChartTimeRangeSelector({ value, onChange, className }: ChartTimeRangeSelectorProps) {
  return (
    <div
      className={cn(
        'flex rounded-full border border-border bg-muted/40 p-0.5',
        className,
      )}
      role="group"
      aria-label="Select time range"
    >
      {RANGES.map(({ value: rangeValue, label }) => {
        const isActive = value === rangeValue
        return (
          <button
            key={rangeValue}
            type="button"
            onClick={() => onChange(rangeValue)}
            className={cn(
              'rounded-full px-2.5 py-0.5 text-xs font-medium transition-all duration-150',
              isActive
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
            aria-pressed={isActive}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
