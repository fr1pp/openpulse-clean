import { useQuery } from '@tanstack/react-query'
import { Skeleton } from '@/components/ui/skeleton'
import { ChartTimeRangeSelector } from '@/components/charts/ChartTimeRangeSelector'
import { useTimeRange } from '@/hooks/useTimeRange'
import { historicalVitalsQueryOptions } from '@/api/queries/vitals'
import type { ThresholdResult } from '@/lib/thresholds'
import type { VitalReadingPayload, HistoricalReading } from '@openpulse/shared'

export interface VitalChartPanelProps {
  /** Lucide icon component for the panel header. */
  icon: React.ElementType
  /** Abbreviated clinical label (e.g. 'HR'). */
  label: string
  /** Formatted current value (e.g. '78 bpm'). */
  currentValue: string
  /** Threshold evaluation for the current value — drives the colored text. */
  threshold: ThresholdResult
  /** Patient ID for fetching historical data. */
  patientId: number
  /** Vital key used for per-chart sessionStorage key (e.g. 'heartRate'). */
  storageKey: string
  /**
   * Render function receiving the data to render as chart children.
   * Called with both recentData and historyData so the parent can pick.
   */
  renderChart: (
    activeData: VitalReadingPayload[] | HistoricalReading[],
    range: string,
    isHistory: boolean,
  ) => React.ReactNode
}

/**
 * Self-contained chart panel with Apple Health minimal styling.
 * Owns its time range selection and historical data fetching.
 * Header: icon + label on left, colored text vital value on right.
 * Renders ChartTimeRangeSelector below the header row.
 * No border flash effect — clean static card.
 */
export function VitalChartPanel({
  icon: Icon,
  label,
  currentValue,
  threshold,
  patientId,
  storageKey,
  renderChart,
}: VitalChartPanelProps) {
  const [range, updateRange] = useTimeRange(storageKey)

  // Always fetch historical data for the selected range
  const { data: historyData, isLoading: historyLoading } = useQuery(
    historicalVitalsQueryOptions(patientId, range),
  )

  const isHistory = range !== '6h' || (historyData !== undefined && historyData.length > 0)
  const activeData = historyData ?? []

  return (
    <div className="rounded-2xl border border-border/50 bg-card p-5 shadow-sm">
      {/* Header row: icon + label left, colored value right */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
        </div>
        <span
          className={`text-2xl font-bold tabular-nums leading-none ${threshold.valueTextClass}`}
        >
          {currentValue}
        </span>
      </div>

      {/* Time range selector below header */}
      <div className="mt-2">
        <ChartTimeRangeSelector value={range} onChange={updateRange} />
      </div>

      {/* Chart area */}
      <div className="mt-3">
        {historyLoading ? (
          <Skeleton className="h-[280px] w-full rounded-xl" />
        ) : (
          renderChart(activeData, range, isHistory)
        )}
      </div>
    </div>
  )
}
