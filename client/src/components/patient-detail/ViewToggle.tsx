import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

export type ViewMode = 'realtime' | 'history'

interface ViewToggleProps {
  value: ViewMode
  onValueChange: (value: ViewMode) => void
}

export function ViewToggle({ value, onValueChange }: ViewToggleProps) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(v) => { if (v) onValueChange(v as ViewMode) }}
      variant="outline"
      size="sm"
    >
      <ToggleGroupItem value="realtime" aria-label="Real-time view">
        Real-time
      </ToggleGroupItem>
      <ToggleGroupItem value="history" aria-label="Historical view">
        History
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
