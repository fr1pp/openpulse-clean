import { useMemo, useId, useState, useRef, useEffect } from 'react'
import {
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
} from '@/components/ui/chart'
import type { VitalReadingPayload, HistoricalReading } from '@openpulse/shared'
import type { ThresholdResult } from '@/lib/thresholds'
import { vitalChartConfig, thresholdColors, thresholdBandColors, BAND_OPACITY } from '@/components/charts/chart-config'
import { computeGradientStops } from '@/components/charts/threshold-gradient'
import { useIsMobile } from '@/hooks/use-mobile'
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
 * Blood pressure chart — systolic-primary with diastolic-area visualization.
 *
 * Design: diastolic rendered as a subtle filled Area (~15% opacity) providing
 * the "pulse pressure band" visual. Systolic rendered as the primary Line on
 * top with threshold gradient coloring.
 *
 * Interactions:
 * - Desktop: hover tooltip with dashed cursor
 * - Mobile: sticky-tap tooltip (tap point to pin, tap outside to dismiss)
 * - CSS slide animation when new data points arrive
 */
export function BPDualLineChart({
  data,
  thresholdLines,
  yDomain,
  className,
  bands,
  tickFormatter,
  showRangeBand,
  systolicMinKey,
  systolicMaxKey,
  diastolicMinKey,
  diastolicMaxKey,
  evaluator,
}: BPDualLineChartProps) {
  const systolicGradientId = useId()
  const diastolicAreaId = useId()
  const isMobile = useIsMobile()
  const [pinnedIndex, setPinnedIndex] = useState<number | null>(null)
  const [animKey, setAnimKey] = useState(0)
  const prevDataLengthRef = useRef(data.length)

  // Trigger slide animation when new data points arrive
  useEffect(() => {
    if (data.length > prevDataLengthRef.current) {
      setAnimKey((k) => k + 1)
    }
    prevDataLengthRef.current = data.length
  }, [data.length])

  const systolicGradientStops = useMemo(() => {
    if (!evaluator || data.length === 0) return null
    return computeGradientStops(data, (d: any) => d.bpSystolic ?? null, evaluator)
  }, [data, evaluator])

  const systolicStroke = systolicGradientStops
    ? `url(#${systolicGradientId})`
    : vitalChartConfig.bpSystolic.color

  const showRangeBands = showRangeBand && systolicMinKey && systolicMaxKey

  const handleChartClick = (chartData: any) => {
    if (!isMobile) return
    if (chartData?.activeTooltipIndex != null) {
      setPinnedIndex((prev) =>
        prev === chartData.activeTooltipIndex ? null : chartData.activeTooltipIndex
      )
    } else {
      setPinnedIndex(null)
    }
  }

  const sharedProps = {
    data,
    accessibilityLayer: true as const,
    onClick: handleChartClick,
  }

  // Mobile: controlled tooltip with click trigger; Desktop: default hover behavior
  const tooltipProps = isMobile
    ? {
        trigger: 'click' as const,
        active: pinnedIndex !== null ? true : undefined,
        defaultIndex: pinnedIndex ?? undefined,
      }
    : {}

  return (
    <ChartContainer config={bpConfig} className={cn('h-[200px] w-full', className)}>
      <div key={animKey} className="chart-slide-in contents">
        <ComposedChart {...sharedProps}>
          <defs>
            {systolicGradientStops && (
              <linearGradient id={systolicGradientId} x1="0" x2="1" y1="0" y2="0">
                {systolicGradientStops.map((stop, i) => (
                  <stop key={i} offset={stop.offset} stopColor={stop.color} />
                ))}
              </linearGradient>
            )}
            {/* Subtle fill for the diastolic area */}
            <linearGradient id={diastolicAreaId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={vitalChartConfig.bpDiastolic.color} stopOpacity={0.18} />
              <stop offset="100%" stopColor={vitalChartConfig.bpDiastolic.color} stopOpacity={0.06} />
            </linearGradient>
          </defs>

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
            {...tooltipProps}
            content={<ChartTooltipContent />}
            cursor={isMobile ? false : { stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '4 4' }}
          />

          {/* Diastolic as a subtle filled Area — upper boundary IS the diastolic line visually */}
          <Area
            type="monotone"
            dataKey="bpDiastolic"
            fill={`url(#${diastolicAreaId})`}
            stroke={vitalChartConfig.bpDiastolic.color}
            strokeWidth={1.5}
            strokeOpacity={0.5}
            dot={false}
            isAnimationActive={false}
            connectNulls
          />

          {/* Aggregated range bands for diastolic (7d/30d) */}
          {showRangeBands && diastolicMinKey && diastolicMaxKey && (
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
                fillOpacity={0.08}
                stroke="none"
                stackId="diastolicRange"
                isAnimationActive={false}
              />
            </>
          )}

          {/* Aggregated range bands for systolic (7d/30d) */}
          {showRangeBands && systolicMinKey && systolicMaxKey && (
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
                dataKey={(d: any) => (d[systolicMaxKey] ?? 0) - (d[systolicMinKey!] ?? 0)}
                fill={vitalChartConfig.bpSystolic.color}
                fillOpacity={0.1}
                stroke="none"
                stackId="systolicRange"
                isAnimationActive={false}
              />
            </>
          )}

          {/* Systolic as the primary gradient-colored line — rendered on top */}
          <Line
            type="monotone"
            dataKey="bpSystolic"
            stroke={systolicStroke}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            dot={false}
            isAnimationActive={false}
            connectNulls
          />
        </ComposedChart>
      </div>
    </ChartContainer>
  )
}
