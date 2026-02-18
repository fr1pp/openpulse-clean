import { cn } from '@/lib/utils'

export type SortMode = 'severity' | 'alphabetical'

export interface PatientSortToggleProps {
  sortBy: SortMode
  onSortChange: (sort: SortMode) => void
}

/**
 * Toggle between severity-first and alphabetical patient sort order.
 * Warm styling: pill container with warm border, active segment uses primary (warm dark).
 */
export function PatientSortToggle({ sortBy, onSortChange }: PatientSortToggleProps) {
  return (
    <div
      className="flex rounded-full border border-border bg-muted/40 p-0.5"
      role="group"
      aria-label="Sort patients by"
    >
      {(['severity', 'alphabetical'] as SortMode[]).map((mode) => {
        const isActive = sortBy === mode
        return (
          <button
            key={mode}
            onClick={() => onSortChange(mode)}
            className={cn(
              'rounded-full px-3 py-1 text-sm font-medium transition-all duration-150',
              isActive
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
            aria-pressed={isActive}
          >
            {mode === 'severity' ? 'Severity' : 'A–Z'}
          </button>
        )
      })}
    </div>
  )
}
