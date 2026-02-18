import { useId, useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, ReferenceArea } from 'recharts'
import { ChartContainer, ChartTooltip } from '@/components/ui/chart'
import type { ChartConfig } from '@/components/ui/chart'
import type { HistoricalReading } from '@openpulse/shared'
import { compactRelativeTime } from '@/components/charts/chart-config'

interface PatientVitalAreaChartProps {
  data: HistoricalReading[]
  dataKey: string           // 'heartRate' | 'bpSystolic' | 'spo2' | 'temperature'
  color: string             // hex color from vitalChartConfig
  yDomain: [number, number] // from vitalYDomains
  normalRange: { y1: number; y2: number }  // normal zone bounds for ReferenceArea
  config: ChartConfig       // single-key chart config for ChartContainer
}

interface TooltipPayloadEntry {
  value?: number | null
  payload?: HistoricalReading
}

function SimpleTooltipContent({
  active,
  payload,
  dataKey,
}: {
  active?: boolean
  payload?: TooltipPayloadEntry[]
  dataKey: string
}) {
  if (!active || !payload?.length) return null
  const entry = payload[0]
  const value = entry?.value
  const recordedAt = entry?.payload?.recordedAt
  if (value == null) return null

  return (
    <div className="rounded-lg bg-white px-3 py-2 text-sm shadow-md border">
      <span className="font-semibold">{value}</span>
      {recordedAt && (
        <span className="ml-2 text-slate-500">{compactRelativeTime(recordedAt)} ago</span>
      )}
    </div>
  )
}

/**
 * Simplified area chart for elderly-friendly trend visualization in the patient portal.
 * Renders a 24h vital trend with gentle gradient fill, a "Normal range" reference zone,
 * larger fonts, and fewer ticks to reduce cognitive load.
 */
export function PatientVitalAreaChart({
  data,
  dataKey,
  color,
  yDomain,
  normalRange,
  config,
}: PatientVitalAreaChartProps) {
  const gradientId = useId()

  // Thin data: every 4th point reduces ~288 aggregated points to ~72 for smooth rendering
  const thinnedData = useMemo(
    () => data.filter((_, i) => i % 4 === 0),
    [data],
  )

  return (
    <ChartContainer config={config} className="h-[160px] w-full">
      <AreaChart data={thinnedData} accessibilityLayer>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>

        <XAxis
          dataKey="recordedAt"
          tickFormatter={compactRelativeTime}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 14 }}
          minTickGap={60}
        />

        {/* Y-axis hidden — "Normal range" zone label communicates range instead */}
        <YAxis domain={yDomain} hide />

        {/* Normal range zone — subtle emerald tint with friendly label */}
        <ReferenceArea
          y1={normalRange.y1}
          y2={normalRange.y2}
          fill="#10b981"
          fillOpacity={0.06}
          label={{
            value: 'Normal range',
            position: 'insideTopLeft',
            fontSize: 12,
            fill: '#9ca3af',
          }}
        />

        <ChartTooltip
          content={
            <SimpleTooltipContent dataKey={dataKey} />
          }
        />

        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2.5}
          fill={`url(#${gradientId})`}
          isAnimationActive={false}
          dot={false}
          connectNulls
        />
      </AreaChart>
    </ChartContainer>
  )
}
