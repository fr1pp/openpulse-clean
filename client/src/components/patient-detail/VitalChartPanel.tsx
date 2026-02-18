import { useEffect, useRef, useState } from 'react'
import type { ThresholdResult } from '@/lib/thresholds'
import { VitalBadge } from '@/components/dashboard/VitalBadge'
import { cn } from '@/lib/utils'

export interface VitalChartPanelProps {
  /** Lucide icon component for the panel header. */
  icon: React.ElementType
  /** Abbreviated clinical label (e.g. 'HR'). */
  label: string
  /** Formatted current value (e.g. '78 bpm'). */
  currentValue: string
  /** Threshold evaluation for the current value badge and border pulse. */
  threshold: ThresholdResult
  /** The chart component to render below the header. */
  children: React.ReactNode
}

/**
 * Chart panel wrapper: icon + label on left, current value badge on right, chart below.
 * Warm card styling: rounded-2xl bg-card shadow-sm.
 * Border briefly pulses (threshold.borderClass) when the vital crosses a threshold boundary.
 */
export function VitalChartPanel({
  icon: Icon,
  label,
  currentValue,
  threshold,
  children,
}: VitalChartPanelProps) {
  const prevLevelRef = useRef<string | null>(null)
  const [flash, setFlash] = useState(false)

  useEffect(() => {
    const prev = prevLevelRef.current
    prevLevelRef.current = threshold.level

    // Only flash on actual level change, not initial render
    if (prev !== null && prev !== threshold.level) {
      setFlash(true)
      const timeout = setTimeout(() => setFlash(false), 500)
      return () => clearTimeout(timeout)
    }
  }, [threshold.level])

  return (
    <div
      className={cn(
        // Warm card: rounded-2xl matches card.tsx, bg-card is warm off-white/dark-brown
        'rounded-2xl border bg-card p-4 shadow-sm transition-colors duration-300',
        flash && threshold.borderClass,
      )}
    >
      {/* Header: icon + label on left, badge on right */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">{label}</span>
        </div>
        <VitalBadge label={currentValue} threshold={threshold} size="sm" />
      </div>

      {/* Chart body */}
      {children}
    </div>
  )
}
