import { RefreshCw } from 'lucide-react'
import { useRegenAccessCode } from '@/api/mutations/patients'
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

interface RegenCodeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patientId: number
  patientName: string
  onRegenerated: (data: { accessCode: string; qrCodeData: string }) => void
}

export function RegenCodeDialog({
  open,
  onOpenChange,
  patientId,
  patientName,
  onRegenerated,
}: RegenCodeDialogProps) {
  const regenAccessCode = useRegenAccessCode(patientId)

  const handleRegen = async () => {
    const result = await regenAccessCode.mutateAsync()
    onOpenChange(false)
    onRegenerated({
      accessCode: result.accessCode,
      qrCodeData: result.qrCodeData,
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-500/10 shrink-0">
              <RefreshCw className="size-5 text-amber-600 dark:text-amber-400" />
            </div>
            <AlertDialogTitle>Regenerate Access Code</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-sm leading-relaxed">
            This will generate a new access code for{' '}
            <span className="font-semibold text-foreground">{patientName}</span>
            . The current code will stop working immediately. Any printed cards
            will need to be reprinted.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleRegen}
            disabled={regenAccessCode.isPending}
          >
            {regenAccessCode.isPending ? 'Regenerating...' : 'Regenerate Code'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
