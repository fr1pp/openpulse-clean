import { Button } from '@/components/ui/button'

export type SortMode = 'severity' | 'alphabetical'

export interface PatientSortToggleProps {
  sortBy: SortMode
  onSortChange: (sort: SortMode) => void
}

/**
 * Toggle between severity-first and alphabetical patient sort order.
 */
export function PatientSortToggle({ sortBy, onSortChange }: PatientSortToggleProps) {
  return (
    <div className="flex gap-1">
      <Button
        size="sm"
        variant={sortBy === 'severity' ? 'default' : 'ghost'}
        onClick={() => onSortChange('severity')}
      >
        Severity
      </Button>
      <Button
        size="sm"
        variant={sortBy === 'alphabetical' ? 'default' : 'ghost'}
        onClick={() => onSortChange('alphabetical')}
      >
        A-Z
      </Button>
    </div>
  )
}
