import type { ThresholdResult } from '@/lib/thresholds'
import { thresholdLineColors } from '@/components/charts/chart-config'

interface GradientStop {
  offset: string
  color: string
}

/**
 * Compute gradient color stops for a vital data series.
 * Maps each data point to its threshold zone color at the corresponding x-position.
 * Used as stops in an SVG linearGradient from x1="0" x2="1" (horizontal).
 *
 * @param data - The chart data array
 * @param getValue - Accessor function to get the numeric value from each data point
 * @param evaluate - Threshold evaluator function returning ThresholdResult
 * @returns Array of gradient stops with offset (%) and color
 */
export function computeGradientStops<T>(
  data: T[],
  getValue: (d: T) => number | null,
  evaluate: (v: number | null) => ThresholdResult,
): GradientStop[] {
  if (data.length === 0) return []
  if (data.length === 1) {
    const result = evaluate(getValue(data[0]))
    const color = thresholdLineColors[result.level as keyof typeof thresholdLineColors] ?? thresholdLineColors.unknown
    return [{ offset: '0%', color }]
  }

  const stops: GradientStop[] = []
  const n = data.length

  for (let i = 0; i < n; i++) {
    const val = getValue(data[i])
    const result = evaluate(val)
    const color = thresholdLineColors[result.level as keyof typeof thresholdLineColors] ?? thresholdLineColors.unknown
    const offset = `${(i / (n - 1)) * 100}%`

    // Add transition stops: end previous segment and start new one at same position
    if (i > 0) {
      const prevVal = getValue(data[i - 1])
      const prevResult = evaluate(prevVal)
      const prevColor = thresholdLineColors[prevResult.level as keyof typeof thresholdLineColors] ?? thresholdLineColors.unknown
      if (prevColor !== color) {
        // Sharp transition: end previous color just before, start new color at same point
        stops.push({ offset, color: prevColor })
        stops.push({ offset, color })
        continue
      }
    }

    // Only add stops at segment boundaries (first, last, and zone changes)
    if (i === 0 || i === n - 1) {
      stops.push({ offset, color })
    }
  }

  return stops
}
