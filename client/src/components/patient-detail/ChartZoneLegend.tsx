import { thresholdBandColors, BAND_OPACITY } from '@/components/charts/chart-config'

const ZONES = [
  { label: 'Normal', color: thresholdBandColors.normal, opacity: BAND_OPACITY.normal },
  { label: 'Warning', color: thresholdBandColors.concerning, opacity: BAND_OPACITY.concerning },
  { label: 'Critical', color: thresholdBandColors.critical, opacity: BAND_OPACITY.critical },
]

/**
 * Shared legend explaining zone colors for all vital charts.
 * Rendered once above the chart stack — applies to both real-time and historical views.
 * Swatch opacity is multiplied by 4 to be visible at small size (bands at 6-7% would be invisible).
 */
export function ChartZoneLegend() {
  return (
    <div className="flex items-center gap-4 text-xs text-muted-foreground">
      {ZONES.map((z) => (
        <div key={z.label} className="flex items-center gap-1.5">
          <span
            className="inline-block h-3 w-3 rounded-sm"
            style={{ backgroundColor: z.color, opacity: z.opacity * 4 }}
            aria-hidden="true"
          />
          <span>{z.label}</span>
        </div>
      ))}
    </div>
  )
}
