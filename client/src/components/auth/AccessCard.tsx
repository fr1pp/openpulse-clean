import { QRCodeSVG } from 'qrcode.react'
import { Button } from '@/components/ui/button'

interface AccessCardProps {
  patientName: string
  accessCode: string
  qrUrl: string
}

export function AccessCard({ patientName, accessCode, qrUrl }: AccessCardProps) {
  return (
    <div className="print-card flex flex-col items-center gap-4 rounded-xl border-2 border-foreground/20 bg-white p-8 text-center">
      <h2 className="text-xl font-bold text-foreground">{patientName}</h2>

      <div className="flex flex-col items-center gap-1">
        <span className="text-sm font-medium text-muted-foreground">
          Your Access Code
        </span>
        <span className="font-mono text-4xl font-bold tracking-widest text-foreground">
          {accessCode}
        </span>
      </div>

      <QRCodeSVG
        value={qrUrl}
        size={160}
        level="M"
        title={`QR code for patient ${patientName}`}
      />

      <p className="max-w-[250px] text-sm text-muted-foreground">
        Scan this code or enter the code above at the login screen
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
