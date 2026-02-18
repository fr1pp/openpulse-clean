import { Skeleton } from '@/components/ui/skeleton'

/**
 * Skeleton loading placeholder matching PatientOverviewCard layout.
 * Shown while patient data is being fetched.
 */
export function PatientCardSkeleton() {
  return (
    <div className="rounded-lg border border-l-4 border-l-gray-300 p-4 shadow-sm">
      {/* Header skeleton */}
      <div className="mb-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="mt-1.5 h-3 w-48" />
      </div>

      {/* Vitals 2x2 grid skeleton */}
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <Skeleton className="h-3 w-8" />
              <Skeleton className="h-5 w-16 rounded-md" />
            </div>
            <Skeleton className="h-8 w-20" />
          </div>
        ))}
      </div>
    </div>
  )
}
