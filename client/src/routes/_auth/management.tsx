import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { UserPlus, Users } from 'lucide-react'
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
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10 shrink-0">
              <Users className="size-5 text-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Patient Management
            </h1>
          </div>
          <p className="text-sm text-muted-foreground pl-[46px]">
            Manage patient records, access codes, and demographics
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setCreateOpen(true)} className="shrink-0">
            <UserPlus className="mr-2 h-4 w-4" />
            Add Patient
          </Button>
        )}
      </div>

      {/* Table area */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-11 rounded-lg" />
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
                className="font-medium hover:text-primary hover:underline underline-offset-4 transition-colors"
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
