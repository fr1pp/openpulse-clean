import { QRCodeSVG } from 'qrcode.react'
import type { PatientListItem } from '@/api/queries/patients'
import type { ThresholdResult } from '@/lib/thresholds'
import { calculateAge } from '@/lib/vitals-format'
import { cn } from '@/lib/utils'

interface PatientInfoCardProps {
  patient: PatientListItem
  worst: ThresholdResult
  /** Patient login URL for the QR code. Omit to hide QR section. */
  qrUrl?: string
}

const LEVEL_LABELS: Record<string, string> = {
  normal: 'Normal',
  concerning: 'Concerning',
  critical: 'Critical',
  unknown: 'Unknown',
}

/**
 * Sticky sidebar card for patient identity and overall status.
 * Renders name, age, worst-of-four status indicator, and optional QR code.
 * Apple Health card styling: rounded-2xl, minimal chrome, compact for ~300px column.
 */
export function PatientInfoCard({ patient, worst, qrUrl }: PatientInfoCardProps) {
  const age = calculateAge(patient.dateOfBirth)
  const levelLabel = LEVEL_LABELS[worst.level] ?? 'Unknown'

  return (
    <div className="rounded-2xl border border-border/50 bg-card p-5 shadow-sm">
      {/* Patient name */}
      <p className="text-lg font-semibold text-foreground">
        {patient.firstName} {patient.lastName}
      </p>

      {/* Age */}
      <p className="mt-0.5 text-sm text-muted-foreground">Age {age}</p>

      {/* Overall status */}
      <div className="mt-3 flex items-center gap-2">
        <span
          className={cn('inline-block h-2.5 w-2.5 rounded-full', worst.bgClass)}
          aria-hidden="true"
        />
        <span className={cn('text-sm font-medium', worst.valueTextClass)}>{levelLabel}</span>
      </div>

      {/* QR code */}
      {qrUrl && (
        <div className="mt-4 flex flex-col items-center gap-2">
          <p className="self-start text-xs text-muted-foreground">Patient Login</p>
          <QRCodeSVG
            value={qrUrl}
            size={120}
            level="M"
            title={`QR code for ${patient.firstName} ${patient.lastName}`}
            className="rounded-lg"
          />
        </div>
      )}
    </div>
  )
}
