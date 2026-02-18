import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { UserPlus } from 'lucide-react'
import { patientsQueryOptions } from '@/api/queries/patients'
import { useAdminRole } from '@/hooks/useAdminRole'
import { PatientTable } from '@/components/management/PatientTable'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export const Route = createFileRoute('/_auth/management')({
  component: ManagementPage,
})

function ManagementPage() {
  const { data: patients, isLoading } = useQuery(patientsQueryOptions)
  const isAdmin = useAdminRole()

  // State for dialogs (will be wired in Plan 06-03)
  // const [createOpen, setCreateOpen] = useState(false)
  // const [editPatient, setEditPatient] = useState<PatientListItem | null>(null)
  // const [deletePatient, setDeletePatient] = useState<PatientListItem | null>(null)

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Patient Management</h1>
          <p className="text-muted-foreground">
            Manage patient records, access codes, and demographics
          </p>
        </div>
        {isAdmin && (
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Patient
          </Button>
        )}
      </div>

      <div className="mt-6">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 rounded" />
            ))}
          </div>
        ) : (
          <PatientTable
            patients={patients ?? []}
            isAdmin={isAdmin}
            onEdit={() => {/* Plan 06-03 */}}
            onDelete={() => {/* Plan 06-03 */}}
          />
        )}
      </div>
    </div>
  )
}
