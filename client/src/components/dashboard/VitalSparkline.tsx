import { LineChart, Line } from 'recharts'
import { ChartContainer } from '@/components/ui/chart'
import type { ChartConfig } from '@/components/ui/chart'
import type { VitalReadingPayload } from '@openpulse/shared'
import { cn } from '@/lib/utils'

const MAX_SPARKLINE_POINTS = 60 // 5 minutes at 5s intervals

export interface VitalSparklineProps {
  data: VitalReadingPayload[]
  dataKey: keyof Pick<VitalReadingPayload, 'heartRate' | 'bpSystolic' | 'bpDiastolic' | 'spo2' | 'temperature'>
  color: string
  className?: string
}

const chartConfig: ChartConfig = {
  value: { label: 'Value' },
}

/**
 * Minimal inline sparkline for vital trend visualization.
 * No axes, grid, or tooltips — just a colored trend line.
 */
export function VitalSparkline({ data, dataKey, color, className }: VitalSparklineProps) {
  if (!data || data.length === 0) return null

  // Take last 60 data points (5 minutes at 5s intervals)
  const trimmed = data.length > MAX_SPARKLINE_POINTS
    ? data.slice(-MAX_SPARKLINE_POINTS)
    : data

  return (
    <ChartContainer config={chartConfig} className={cn('h-8 w-20', className)}>
      <LineChart data={trimmed}>
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
          connectNulls
        />
      </LineChart>
    </ChartContainer>
  )
}
