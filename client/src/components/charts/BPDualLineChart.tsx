import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
} from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import type { VitalReadingPayload } from '@openpulse/shared'
import { vitalChartConfig, thresholdColors } from '@/components/charts/chart-config'
import { cn } from '@/lib/utils'

export interface BPDualLineChartProps {
  /** Chart data array (any window size). */
  data: VitalReadingPayload[]
  /** Horizontal dashed reference lines (systolic thresholds only). */
  thresholdLines: readonly { readonly y: number; readonly label?: string }[]
  /** Y-axis min/max range. */
  yDomain?: [number, number]
  className?: string
}

const bpConfig = {
  bpSystolic: vitalChartConfig.bpSystolic,
  bpDiastolic: vitalChartConfig.bpDiastolic,
}

function formatTick(val: string) {
  const d = new Date(val)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

/**
 * Blood pressure chart with dual lines (systolic + diastolic).
 * Threshold reference lines are systolic-only per user decision.
 */
export function BPDualLineChart({
  data,
  thresholdLines,
  yDomain,
  className,
}: BPDualLineChartProps) {
  return (
    <ChartContainer config={bpConfig} className={cn('h-[200px] w-full', className)}>
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
        <ChartLegend content={<ChartLegendContent />} />
        <Line
          type="monotone"
          dataKey="bpSystolic"
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
          connectNulls
        />
        <Line
          type="monotone"
          dataKey="bpDiastolic"
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
          connectNulls
        />
      </LineChart>
    </ChartContainer>
  )
}
