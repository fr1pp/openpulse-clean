import { useState, useEffect } from 'react'
import { TriangleAlert } from 'lucide-react'
import { useDeletePatient } from '@/api/mutations/patients'
import { Input } from '@/components/ui/input'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface DeletePatientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patient: {
    id: number
    firstName: string
    lastName: string
  } | null
}

export function DeletePatientDialog({
  open,
  onOpenChange,
  patient,
}: DeletePatientDialogProps) {
  const deletePatient = useDeletePatient()
  const [confirmName, setConfirmName] = useState('')

  const fullName = patient ? `${patient.firstName} ${patient.lastName}` : ''
  const isConfirmed = confirmName === fullName

  // Reset confirm input whenever the dialog opens/closes
  useEffect(() => {
    if (!open) {
      setConfirmName('')
    }
  }, [open])

  const handleDelete = async () => {
    if (!patient || !isConfirmed) return
    await deletePatient.mutateAsync(patient.id)
    onOpenChange(false)
    setConfirmName('')
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-destructive/10 shrink-0">
              <TriangleAlert className="size-5 text-destructive" />
            </div>
            <AlertDialogTitle className="text-destructive text-lg">
              Delete Patient
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-sm leading-relaxed">
            This action cannot be undone. Patient{' '}
            <span className="font-semibold text-foreground">{fullName}</span>{' '}
            will be removed from all views and their access code will stop working.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2 py-1">
          <p className="text-sm text-muted-foreground">
            Type{' '}
            <span className="font-mono font-semibold text-foreground">
              {fullName}
            </span>{' '}
            to confirm:
          </p>
          <Input
            value={confirmName}
            onChange={(e) => setConfirmName(e.target.value)}
            placeholder={fullName}
            aria-label="Confirm patient name"
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={!isConfirmed || deletePatient.isPending}
            onClick={handleDelete}
          >
            {deletePatient.isPending ? 'Deleting...' : 'Delete Patient'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
