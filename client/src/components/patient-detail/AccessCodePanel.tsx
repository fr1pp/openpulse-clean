import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { QRCodeSVG } from 'qrcode.react'
import { Copy, KeyRound, Printer, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { patientDetailQueryOptions } from '@/api/queries/patients'
import { useAdminRole } from '@/hooks/useAdminRole'
import { AccessCard } from '@/components/auth/AccessCard'
import { CodeRevealDialog } from '@/components/management/CodeRevealDialog'
import { RegenCodeDialog } from '@/components/management/RegenCodeDialog'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

interface AccessCodePanelProps {
  patientId: number
  patientName: string
}

export function AccessCodePanel({ patientId, patientName }: AccessCodePanelProps) {
  const isAdmin = useAdminRole()
  const { data: patient, isLoading } = useQuery(patientDetailQueryOptions(patientId))

  const [regenOpen, setRegenOpen] = useState(false)
  const [revealData, setRevealData] = useState<{
    accessCode: string
    qrCodeData: string
  } | null>(null)

  if (isLoading) {
    return (
      <div className="rounded-2xl border bg-card p-4 shadow-sm">
        <Skeleton className="mb-3 h-5 w-32" />
        <div className="flex items-center gap-6">
          <Skeleton className="h-16 w-32" />
          <Skeleton className="h-[120px] w-[120px]" />
        </div>
      </div>
    )
  }

  if (!patient) return null

  const qrUrl = patient.qrCodeData
    ? `${window.location.origin}${patient.qrCodeData}`
    : ''

  const handleCopy = () => {
    navigator.clipboard.writeText(patient.accessCode)
    toast.success('Code copied to clipboard')
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <>
      <div className="rounded-2xl border bg-card p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">Access Code</h3>
        </div>

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
          {/* Code display */}
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Patient Code</span>
            <span className="font-mono text-4xl font-bold tracking-widest">
              {patient.accessCode}
            </span>
          </div>

          {/* QR code */}
          {qrUrl && (
            <QRCodeSVG
              value={qrUrl}
              size={120}
              level="M"
              title={`QR code for patient ${patientName}`}
            />
          )}

          {/* Action buttons */}
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:ml-auto">
            <Button variant="outline" size="sm" onClick={handleCopy} className="w-full sm:w-auto">
              <Copy className="mr-2 h-3.5 w-3.5" />
              Copy Code
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint} className="w-full sm:w-auto">
              <Printer className="mr-2 h-3.5 w-3.5" />
              Print
            </Button>
            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRegenOpen(true)}
                className="w-full sm:w-auto"
              >
                <RefreshCw className="mr-2 h-3.5 w-3.5" />
                Regenerate
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Hidden access card for print — becomes visible during print via print:block */}
      <div className="hidden print:block">
        <AccessCard
          patientName={patientName}
          accessCode={patient.accessCode}
          qrUrl={qrUrl}
        />
      </div>

      <RegenCodeDialog
        open={regenOpen}
        onOpenChange={setRegenOpen}
        patientId={patientId}
        patientName={patientName}
        onRegenerated={(data) => {
          setRevealData(data)
        }}
      />

      <CodeRevealDialog
        open={!!revealData}
        onOpenChange={(open) => !open && setRevealData(null)}
        patientName={patientName}
        accessCode={revealData?.accessCode ?? ''}
        qrCodeData={revealData?.qrCodeData ?? ''}
      />
    </>
  )
}
