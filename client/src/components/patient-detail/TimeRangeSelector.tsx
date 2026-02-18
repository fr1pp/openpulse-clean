import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import type { TimeRange } from '@openpulse/shared'

const TIME_RANGES: { value: TimeRange; label: string }[] = [
  { value: '1h', label: '1h' },
  { value: '6h', label: '6h' },
  { value: '24h', label: '24h' },
  { value: '7d', label: '7d' },
  { value: '30d', label: '30d' },
]

interface TimeRangeSelectorProps {
  value: TimeRange
  onValueChange: (range: TimeRange) => void
}

export function TimeRangeSelector({ value, onValueChange }: TimeRangeSelectorProps) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(v) => { if (v) onValueChange(v as TimeRange) }}
      variant="outline"
      size="sm"
    >
      {TIME_RANGES.map((r) => (
        <ToggleGroupItem key={r.value} value={r.value} aria-label={`${r.label} time range`}>
          {r.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}
