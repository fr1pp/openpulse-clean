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
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import type { VitalReadingPayload, HistoricalReading } from '@openpulse/shared'
import type { ThresholdResult } from '@/lib/thresholds'
import { vitalChartConfig, thresholdColors, thresholdBandColors, BAND_OPACITY } from '@/components/charts/chart-config'
import { computeGradientStops } from '@/components/charts/threshold-gradient'
import { cn } from '@/lib/utils'

export interface BPDualLineChartProps {
  /** Chart data array (any window size). */
  data: VitalReadingPayload[] | HistoricalReading[]
  /** Horizontal dashed reference lines (systolic thresholds only). */
  thresholdLines: readonly { readonly y: number; readonly label?: string }[]
  /** Y-axis min/max range. */
  yDomain?: [number, number]
  className?: string
  /** Threshold zone bands (ReferenceArea fills). */
  bands?: Array<{ y1: number; y2: number; level: 'normal' | 'concerning' | 'critical' }>
  /** syncId for synchronized crosshair across charts. */
  syncId?: string
  /** Tick formatter override for X-axis (e.g. relative time). */
  tickFormatter?: (value: string) => string
  /** Whether to show min/max range band for aggregated data. */
  showRangeBand?: boolean
  systolicMinKey?: string
  systolicMaxKey?: string
  diastolicMinKey?: string
  diastolicMaxKey?: string
  /** Evaluator function for systolic gradient line. */
  evaluator?: (v: number | null) => ThresholdResult
}

const bpConfig = {
  bpSystolic: vitalChartConfig.bpSystolic,
  bpDiastolic: vitalChartConfig.bpDiastolic,
}

function defaultFormatTick(val: string) {
  const d = new Date(val)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

/**
 * Blood pressure chart with dual lines (systolic + diastolic).
 * Supports threshold band fills, gradient-colored systolic line, synchronized crosshair,
 * relative time axis, and min/max range bands for aggregated data.
 */
export function BPDualLineChart({
  data,
  thresholdLines,
  yDomain,
  className,
  bands,
  syncId,
  tickFormatter,
  showRangeBand,
  systolicMinKey,
  systolicMaxKey,
  diastolicMinKey,
  diastolicMaxKey,
  evaluator,
}: BPDualLineChartProps) {
  const systolicGradientId = useId()

  const systolicGradientStops = useMemo(() => {
    if (!evaluator || data.length === 0) return null
    return computeGradientStops(data, (d: any) => d.bpSystolic ?? null, evaluator)
  }, [data, evaluator])

  const systolicStroke = systolicGradientStops
    ? `url(#${systolicGradientId})`
    : undefined

  const useComposed = showRangeBand && systolicMinKey && systolicMaxKey

  const sharedProps = {
    data,
    accessibilityLayer: true as const,
    ...(syncId ? { syncId } : {}),
  }

  const chartContent = (
    <>
      {systolicGradientStops && (
        <defs>
          <linearGradient id={systolicGradientId} x1="0" x2="1" y1="0" y2="0">
            {systolicGradientStops.map((stop, i) => (
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
        minTickGap={40}
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
      <ChartLegend content={<ChartLegendContent />} />
      {useComposed && systolicMinKey && systolicMaxKey && (
        <>
          <Area
            type="monotone"
            dataKey={systolicMinKey}
            fill="transparent"
            stroke="none"
            stackId="systolicRange"
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey={(d: any) => (d[systolicMaxKey] ?? 0) - (d[systolicMinKey] ?? 0)}
            fill={vitalChartConfig.bpSystolic.color}
            fillOpacity={0.12}
            stroke="none"
            stackId="systolicRange"
            isAnimationActive={false}
          />
        </>
      )}
      {useComposed && diastolicMinKey && diastolicMaxKey && (
        <>
          <Area
            type="monotone"
            dataKey={diastolicMinKey}
            fill="transparent"
            stroke="none"
            stackId="diastolicRange"
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey={(d: any) => (d[diastolicMaxKey] ?? 0) - (d[diastolicMinKey!] ?? 0)}
            fill={vitalChartConfig.bpDiastolic.color}
            fillOpacity={0.12}
            stroke="none"
            stackId="diastolicRange"
            isAnimationActive={false}
          />
        </>
      )}
      <Line
        type="monotone"
        dataKey="bpSystolic"
        stroke={systolicStroke}
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
    </>
  )

  return (
    <ChartContainer config={bpConfig} className={cn('h-[200px] w-full', className)}>
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
