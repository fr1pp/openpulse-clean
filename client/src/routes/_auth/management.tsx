import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { UserPlus } from 'lucide-react'
import { patientsQueryOptions } from '@/api/queries/patients'
import type { PatientListItem } from '@/api/queries/patients'
import { useAdminRole } from '@/hooks/useAdminRole'
import { PatientTable } from '@/components/management/PatientTable'
import { CreatePatientDialog } from '@/components/management/CreatePatientDialog'
import { EditPatientDialog } from '@/components/management/EditPatientDialog'
import { DeletePatientDialog } from '@/components/management/DeletePatientDialog'
import { CodeRevealDialog } from '@/components/management/CodeRevealDialog'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export const Route = createFileRoute('/_auth/management')({
  component: ManagementPage,
})

function ManagementPage() {
  const { data: patients, isLoading } = useQuery(patientsQueryOptions)
  const isAdmin = useAdminRole()

  const [createOpen, setCreateOpen] = useState(false)
  const [editPatient, setEditPatient] = useState<PatientListItem | null>(null)
  const [deletePatient, setDeletePatient] = useState<PatientListItem | null>(null)
  const [revealData, setRevealData] = useState<{
    patientName: string
    accessCode: string
    qrCodeData: string
  } | null>(null)

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
          <Button onClick={() => setCreateOpen(true)}>
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
            onEdit={(p) => setEditPatient(p)}
            onDelete={(p) => setDeletePatient(p)}
            renderName={(patient) => (
              <Link
                to="/dashboard/patient/$patientId"
                params={{ patientId: String(patient.id) }}
                className="font-medium hover:underline"
              >
                {patient.firstName} {patient.lastName}
              </Link>
            )}
          />
        )}
      </div>

      <CreatePatientDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(p) =>
          setRevealData({
            patientName: `${p.firstName} ${p.lastName}`,
            accessCode: p.accessCode,
            qrCodeData: p.qrCodeData,
          })
        }
      />
      <EditPatientDialog
        open={!!editPatient}
        onOpenChange={(open) => !open && setEditPatient(null)}
        patient={editPatient}
      />
      <DeletePatientDialog
        open={!!deletePatient}
        onOpenChange={(open) => !open && setDeletePatient(null)}
        patient={deletePatient}
      />
      <CodeRevealDialog
        open={!!revealData}
        onOpenChange={(open) => !open && setRevealData(null)}
        patientName={revealData?.patientName ?? ''}
        accessCode={revealData?.accessCode ?? ''}
        qrCodeData={revealData?.qrCodeData ?? ''}
      />
    </div>
  )
}
