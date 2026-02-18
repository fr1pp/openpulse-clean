import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
} from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import type { ChartConfig } from '@/components/ui/chart'
import type { VitalReadingPayload, HistoricalReading } from '@openpulse/shared'
import { thresholdColors } from '@/components/charts/chart-config'
import { cn } from '@/lib/utils'

export interface VitalLineChartProps {
  /** Chart data array (any window size — component is reusable). */
  data: VitalReadingPayload[] | HistoricalReading[]
  /** Field name in data, e.g. 'heartRate'. */
  dataKey: string
  /** Chart config subset for this vital (color + label). */
  config: ChartConfig
  /** Horizontal dashed reference lines at threshold boundaries. */
  thresholdLines: readonly { readonly y: number; readonly label?: string }[]
  /** Y-axis min/max range. */
  yDomain?: [number, number]
  /** Override line stroke color (defaults from config). */
  lineColor?: string
  className?: string
}

function formatTick(val: string) {
  const d = new Date(val)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

/**
 * Reusable single-line vital sign chart with threshold reference lines.
 * Designed for Phase 5 reuse — accepts data as a prop, not hardcoded to 30-min window.
 */
export function VitalLineChart({
  data,
  dataKey,
  config,
  thresholdLines,
  yDomain,
  lineColor,
  className,
}: VitalLineChartProps) {
  return (
    <ChartContainer config={config} className={cn('h-[200px] w-full', className)}>
      <LineChart data={data} accessibilityLayer>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="recordedAt"
          tickFormatter={formatTick}
          tickLine={false}
          axisLine={false}
          minTickGap={40}
        />
        <YAxis
          domain={yDomain}
          tickLine={false}
          axisLine={false}
          width={40}
        />
        {thresholdLines.map((t) => (
          <ReferenceLine
            key={t.y}
            y={t.y}
            stroke={thresholdColors.line}
            strokeDasharray="4 4"
            strokeOpacity={0.5}
          />
        ))}
        <ChartTooltip content={<ChartTooltipContent />} />
        <Line
          type="monotone"
          dataKey={dataKey}
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
          connectNulls
        />
      </LineChart>
    </ChartContainer>
  )
}
