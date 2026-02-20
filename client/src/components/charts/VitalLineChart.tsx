import { useMemo, useId } from 'react'
import {
  LineChart,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  ReferenceArea,
} from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import type { ChartConfig } from '@/components/ui/chart'
import type { VitalReadingPayload, HistoricalReading } from '@openpulse/shared'
import type { ThresholdResult } from '@/lib/thresholds'
import { thresholdColors, thresholdBandColors, BAND_OPACITY } from '@/components/charts/chart-config'
import { computeGradientStops } from '@/components/charts/threshold-gradient'
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
  /** Threshold zone bands (ReferenceArea fills). */
  bands?: Array<{ y1: number; y2: number; level: 'normal' | 'concerning' | 'critical' }>
  /** Evaluator function for multi-colored line gradient. */
  evaluator?: (v: number | null) => ThresholdResult
  /** syncId for synchronized crosshair across charts. */
  syncId?: string
  /** Tick formatter override for X-axis (e.g. relative time). */
  tickFormatter?: (value: string) => string
  /** Whether this chart shows aggregated data with min/max range band. */
  showRangeBand?: boolean
  /** Data key for min values (aggregated data). */
  minKey?: string
  /** Data key for max values (aggregated data). */
  maxKey?: string
}

function defaultFormatTick(val: string) {
  const d = new Date(val)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

/**
 * Reusable single-line vital sign chart with threshold reference lines.
 * Supports threshold band fills, gradient-colored lines, synchronized crosshair,
 * relative time axis, and min/max range bands for aggregated data.
 */
export function VitalLineChart({
  data,
  dataKey,
  config,
  thresholdLines,
  yDomain,
  lineColor,
  className,
  bands,
  evaluator,
  syncId,
  tickFormatter,
  showRangeBand,
  minKey,
  maxKey,
}: VitalLineChartProps) {
  const gradientId = useId()

  const gradientStops = useMemo(() => {
    if (!evaluator || data.length === 0) return null
    return computeGradientStops(data, (d: any) => d[dataKey] ?? null, evaluator)
  }, [data, dataKey, evaluator])

  // Determine the line color: use gradient URL if available, otherwise lineColor or undefined (config default)
  const lineStroke = gradientStops ? `url(#${gradientId})` : lineColor

  // Use ComposedChart when showing range band (needs Area support), LineChart otherwise
  const useComposed = showRangeBand && minKey && maxKey

  const sharedProps = {
    data,
    accessibilityLayer: true as const,
    ...(syncId ? { syncId } : {}),
  }

  const chartContent = (
    <>
      {gradientStops && (
        <defs>
          <linearGradient id={gradientId} x1="0" x2="1" y1="0" y2="0">
            {gradientStops.map((stop, i) => (
              <stop key={i} offset={stop.offset} stopColor={stop.color} />
            ))}
          </linearGradient>
        </defs>
      )}
      <CartesianGrid strokeDasharray="3 3" vertical={false} />
      <XAxis
        dataKey="recordedAt"
        tickFormatter={tickFormatter ?? defaultFormatTick}
        tickLine={false}
        axisLine={false}
        minTickGap={80}
      />
      <YAxis
        domain={yDomain ?? ['auto', 'auto']}
        tickLine={false}
        axisLine={false}
        width={40}
      />
      {bands?.map((band, i) => (
        <ReferenceArea
          key={i}
          y1={band.y1}
          y2={band.y2}
          fill={thresholdBandColors[band.level]}
          fillOpacity={BAND_OPACITY[band.level]}
          ifOverflow="hidden"
        />
      ))}
      {thresholdLines.map((t) => (
        <ReferenceLine
          key={t.y}
          y={t.y}
          stroke={thresholdColors.line}
          strokeDasharray="4 4"
          strokeOpacity={0.5}
        />
      ))}
      <ChartTooltip
        content={<ChartTooltipContent />}
        cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '4 4' }}
      />
      {useComposed && (
        <>
          <Area
            type="monotone"
            dataKey={minKey}
            fill="transparent"
            stroke="none"
            stackId="range"
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey={(d: any) => (d[maxKey] ?? 0) - (d[minKey!] ?? 0)}
            fill={lineColor ?? '#94a3b8'}
            fillOpacity={0.12}
            stroke="none"
            stackId="range"
            isAnimationActive={false}
          />
        </>
      )}
      <Line
        type="monotone"
        dataKey={dataKey}
        stroke={lineStroke}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        dot={false}
        isAnimationActive={false}
        connectNulls
      />
    </>
  )

  return (
    <ChartContainer config={config} className={cn('h-[200px] w-full', className)}>
      {useComposed ? (
        <ComposedChart {...sharedProps}>
          {chartContent}
        </ComposedChart>
      ) : (
        <LineChart {...sharedProps}>
          {chartContent}
        </LineChart>
      )}
    </ChartContainer>
  )
}
