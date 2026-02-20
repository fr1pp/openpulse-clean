import { Skeleton } from '@/components/ui/skeleton'

/**
 * Skeleton loading placeholder matching PatientOverviewCard layout.
 * Shown while patient data is being fetched.
 *
 * Matches the Apple Health minimal card design — rounded-2xl, no left border accent,
 * 2x2 grid of vital placeholders with 70px sparkline skeletons.
 */
export function PatientCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border/50 bg-card p-4 shadow-sm">
      {/* Header skeleton — name + age row with status dot */}
      <div className="mb-3 flex items-start justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
        <Skeleton className="mt-1 h-2.5 w-2.5 rounded-full" />
      </div>

      {/* Vitals 2x2 grid skeleton */}
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-1">
            {/* Label + value placeholder */}
            <div className="flex items-baseline gap-1.5">
              <Skeleton className="h-3 w-8" />
              <Skeleton className="h-3.5 w-12" />
            </div>
            {/* 70px sparkline placeholder */}
            <Skeleton className="h-[70px] w-full rounded-md" />
          </div>
        ))}
      </div>
    </div>
  )
}
