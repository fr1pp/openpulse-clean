import { Copy, Printer, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { AccessCard } from '@/components/auth/AccessCard'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface CodeRevealDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patientName: string
  accessCode: string
  qrCodeData: string
}

export function CodeRevealDialog({
  open,
  onOpenChange,
  patientName,
  accessCode,
  qrCodeData,
}: CodeRevealDialogProps) {
  const qrUrl = qrCodeData ? `${window.location.origin}${qrCodeData}` : ''

  const handleCopy = () => {
    navigator.clipboard.writeText(accessCode)
    toast.success('Code copied to clipboard')
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2.5 mb-0.5">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-500/10 shrink-0">
              <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <DialogTitle>Patient Access Code</DialogTitle>
          </div>
          <DialogDescription>
            Save or print the access card for{' '}
            <span className="font-medium text-foreground">{patientName}</span>.
            The patient will use this to log in.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center py-2">
          <AccessCard
            patientName={patientName}
            accessCode={accessCode}
            qrUrl={qrUrl}
          />
        </div>

        <div className="flex justify-center gap-2">
          <Button variant="outline" onClick={handleCopy}>
            <Copy className="mr-2 h-4 w-4" />
            Copy Code
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        </div>

        <DialogFooter className="pt-1">
          <Button onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
