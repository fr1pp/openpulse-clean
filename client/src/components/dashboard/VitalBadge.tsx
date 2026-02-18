import { CheckCircle2, AlertTriangle, XOctagon, Minus } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ThresholdResult } from '@/lib/thresholds'

const ICON_MAP: Record<ThresholdResult['icon'], LucideIcon> = {
  CheckCircle2,
  AlertTriangle,
  XOctagon,
  Minus,
}

export interface VitalBadgeProps {
  /** Formatted vital value, e.g. '78 bpm' */
  label: string
  /** Threshold evaluation result controlling color + icon */
  threshold: ThresholdResult
  /** 'sm' for compact vital strip, 'default' for overview cards */
  size?: 'sm' | 'default'
  className?: string
}

/**
 * Filled badge with dual encoding: background color + icon shape.
 * Satisfies RTMON-09 — never relies on color alone.
 */
export function VitalBadge({ label, threshold, size = 'default', className }: VitalBadgeProps) {
  const Icon = ICON_MAP[threshold.icon]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md font-semibold',
        threshold.bgClass,
        threshold.textClass,
        size === 'sm' ? 'px-1.5 py-0.5 text-xs' : 'px-2 py-1 text-sm',
        className,
      )}
    >
      <Icon className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
      {label}
    </span>
  )
}
