import { Copy, Printer } from 'lucide-react'
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
          <DialogTitle>Patient Access Code</DialogTitle>
          <DialogDescription>Access code for {patientName}</DialogDescription>
        </DialogHeader>

        <div className="flex justify-center">
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

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
