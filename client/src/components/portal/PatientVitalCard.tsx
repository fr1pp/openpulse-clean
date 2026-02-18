import { ChevronDown } from 'lucide-react'
import type { ThresholdLevel } from '@openpulse/shared'
import { CARD_TINT, STATUS_TEXT_COLOR } from './portal-status'

interface PatientVitalCardProps {
  label: string
  value: string
  statusPhrase: string
  actionNudge?: string
  level: ThresholdLevel | 'unknown'
  isExpanded: boolean
  onToggle: () => void
  children?: React.ReactNode
}

export function PatientVitalCard({
  label,
  value,
  statusPhrase,
  actionNudge,
  level,
  isExpanded,
  onToggle,
  children,
}: PatientVitalCardProps) {
  return (
    <div className={`rounded-2xl border p-6 transition-colors duration-500 ${CARD_TINT[level]}`}>
      {/* Tappable header area — 44px minimum touch target */}
      <button
        onClick={onToggle}
        aria-expanded={isExpanded}
        className="min-h-[44px] w-full flex items-center justify-between"
      >
        <div className="flex flex-col items-start text-left">
          {/* Vital label */}
          <span className="text-base font-medium text-slate-600">{label}</span>
          {/* Large vital number — 48px (top of 36-48px range) */}
          <span className="text-5xl font-bold text-slate-900 mt-1">{value}</span>
        </div>

        {/* Chevron rotates when expanded */}
        <ChevronDown
          className={`h-6 w-6 text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Status phrase below the value */}
      <p className={`text-lg font-semibold mt-2 ${STATUS_TEXT_COLOR[level]}`}>
        {statusPhrase}
      </p>

      {/* Action nudge for critical readings only */}
      {actionNudge && (
        <p className="text-sm text-red-600 mt-1 font-medium">{actionNudge}</p>
      )}

      {/* Expand area — CSS grid trick for smooth height animation */}
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
      >
        <div className="overflow-hidden">{children}</div>
      </div>
    </div>
  )
}
