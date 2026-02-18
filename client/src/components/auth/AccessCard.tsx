import { QRCodeSVG } from 'qrcode.react'
import { Button } from '@/components/ui/button'

interface AccessCardProps {
  patientName: string
  accessCode: string
  qrUrl: string
}

export function AccessCard({ patientName, accessCode, qrUrl }: AccessCardProps) {
  return (
    <div className="print-card flex flex-col items-center gap-5 rounded-2xl border border-border bg-card p-8 text-center shadow-sm print:border-2 print:border-black print:bg-white print:shadow-none">
      {/* Wordmark */}
      <div className="flex items-center text-lg font-semibold tracking-tight print:text-black">
        <span className="text-foreground print:text-black">open</span>
        <span className="text-red-500 print:text-black">pulse</span>
      </div>

      {/* Divider */}
      <div className="w-full border-t border-border print:border-black/30" />

      {/* Patient name */}
      <div className="flex flex-col items-center gap-1">
        <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground print:text-gray-500">
          Patient
        </span>
        <h2 className="text-xl font-semibold text-foreground print:text-black">{patientName}</h2>
      </div>

      {/* QR code */}
      <div className="rounded-xl border border-border bg-white p-3 print:border-gray-200">
        <QRCodeSVG
          value={qrUrl}
          size={140}
          level="M"
          title={`QR code for patient ${patientName}`}
        />
      </div>

      {/* Access code */}
      <div className="flex flex-col items-center gap-2">
        <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground print:text-gray-500">
          Access Code
        </span>
        <span className="rounded-lg border border-border bg-muted/40 px-4 py-2 font-mono text-4xl font-bold tracking-widest text-foreground print:border-black/20 print:bg-gray-50 print:text-black">
          {accessCode}
        </span>
      </div>

      {/* Instructions */}
      <p className="max-w-[240px] text-sm text-muted-foreground print:text-gray-500">
        Scan the QR code or enter the access code at the patient login screen
      </p>
    </div>
  )
}

export function PrintAccessCardButton({
  patientName,
  accessCode,
  qrUrl,
}: AccessCardProps) {
  const handlePrint = () => {
    window.print()
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={handlePrint}
        className="min-h-[44px]"
      >
        Print Access Card
      </Button>

      <div className="hidden print:block">
        <AccessCard
          patientName={patientName}
          accessCode={accessCode}
          qrUrl={qrUrl}
        />
      </div>
    </>
  )
}
