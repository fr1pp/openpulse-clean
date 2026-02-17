import {
  X,
  ChevronRight,
  HeartPulse,
  Thermometer as ThermometerIcon,
  Wind,
  TrendingUp,
  RotateCcw,
  Activity,
  Heart,
  Droplets,
  type LucideIcon,
} from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import {
  useAvailableScenarios,
  useApplyScenario,
  useResetPatient,
} from '@/api/mutations/simulator'
import type { PatientSimState } from '@openpulse/shared'

const scenarioMeta: Record<
  string,
  { icon: LucideIcon; color: string; bg: string }
> = {
  bradycardia: {
    icon: HeartPulse,
    color: 'text-rose-500 dark:text-rose-400',
    bg: 'bg-rose-500/10 hover:bg-rose-500/20',
  },
  feverSpike: {
    icon: ThermometerIcon,
    color: 'text-amber-500 dark:text-amber-400',
    bg: 'bg-amber-500/10 hover:bg-amber-500/20',
  },
  desaturation: {
    icon: Wind,
    color: 'text-sky-500 dark:text-sky-400',
    bg: 'bg-sky-500/10 hover:bg-sky-500/20',
  },
  hypertensiveCrisis: {
    icon: TrendingUp,
    color: 'text-red-500 dark:text-red-400',
    bg: 'bg-red-500/10 hover:bg-red-500/20',
  },
}

const fallbackMeta = {
  icon: Activity,
  color: 'text-muted-foreground',
  bg: 'bg-muted/50 hover:bg-muted',
}

interface PatientCardProps {
  patient: PatientSimState
  isExpanded: boolean
  onToggle: () => void
}

export function PatientCard({
  patient,
  isExpanded,
  onToggle,
}: PatientCardProps) {
  const { data: scenarios } = useAvailableScenarios()
  const applyMutation = useApplyScenario()
  const resetMutation = useResetPatient()

  const v = patient.currentValues
  const hasStatus = patient.isAnomaly || patient.activeScenario

  return (
    <div
      className={cn(
        'rounded-xl bg-card shadow-sm transition-all duration-150',
        isExpanded
          ? 'ring-1 ring-foreground/15 shadow-md'
          : 'ring-1 ring-border hover:ring-foreground/10'
      )}
    >
      {/* Card header */}
      <div
        role="button"
        tabIndex={0}
        className="w-full text-left px-3 py-2.5 cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset rounded-xl"
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onToggle()
          }
        }}
      >
        {/* Name row */}
        <div className="flex items-center gap-2 mb-2">
          <ChevronRight
            className={cn(
              'h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-200',
              isExpanded && 'rotate-90'
            )}
          />
          <span className="text-sm font-medium truncate flex-1">
            {patient.patientName}
          </span>
          {/* Inline status pills */}
          {hasStatus && (
            <div className="flex items-center gap-1.5 shrink-0">
              {patient.isAnomaly && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 dark:bg-red-500/15 px-2.5 py-1">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-xs font-medium text-red-700 dark:text-red-300">
                    Anomaly
                  </span>
                </span>
              )}
              {patient.activeScenario && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 dark:bg-blue-500/15 px-2.5 py-1">
                  <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                    {patient.activeScenario.name}
                  </span>
                  <span className="text-[11px] text-blue-500 dark:text-blue-400 font-mono tabular-nums">
                    {Math.ceil(patient.activeScenario.remainingMs / 1000)}s
                  </span>
                  <button
                    type="button"
                    className="rounded-full p-0.5 text-blue-400 hover:text-blue-600 hover:bg-blue-200 dark:hover:text-blue-200 dark:hover:bg-blue-800/50 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation()
                      resetMutation.mutate(patient.patientId)
                    }}
                    aria-label={`Cancel ${patient.activeScenario.name}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Vitals row with icons */}
        <div className="grid grid-cols-4 gap-x-2 pl-[22px]">
          <div>
            <div className="flex items-center gap-1">
              <Heart className="h-3.5 w-3.5 text-rose-400/70 shrink-0" />
              <span className="text-sm font-semibold font-mono tabular-nums leading-none">
                {Math.round(v.heartRate)}
              </span>
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5 pl-[18px]">
              bpm
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1">
              <Activity className="h-3.5 w-3.5 text-violet-400/70 shrink-0" />
              <span className="text-sm font-semibold font-mono tabular-nums leading-none">
                {Math.round(v.bpSystolic)}/{Math.round(v.bpDiastolic)}
              </span>
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5 pl-[18px]">
              mmHg
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1">
              <Droplets className="h-3.5 w-3.5 text-sky-400/70 shrink-0" />
              <span className="text-sm font-semibold font-mono tabular-nums leading-none">
                {v.spo2.toFixed(1)}
              </span>
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5 pl-[18px]">
              %SpO&#x2082;
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1">
              <ThermometerIcon className="h-3.5 w-3.5 text-amber-400/70 shrink-0" />
              <span className="text-sm font-semibold font-mono tabular-nums leading-none">
                {v.temperature.toFixed(1)}
              </span>
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5 pl-[18px]">
              °C
            </div>
          </div>
        </div>
      </div>

      {/* Expandable scenario controls */}
      <div
        className={cn(
          'grid transition-[grid-template-rows] duration-200 ease-out',
          isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        )}
      >
        <div className="overflow-hidden">
          <div className="px-3 pb-2.5 pt-2.5 border-t border-border/60">
            {/* Section header with inline reset */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">
                Scenarios
              </span>
              <button
                type="button"
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer disabled:opacity-50"
                onClick={(e) => {
                  e.stopPropagation()
                  resetMutation.mutate(patient.patientId)
                }}
                disabled={resetMutation.isPending}
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </button>
            </div>

            {/* Scenario icon tiles */}
            {scenarios && (
              <div className="grid grid-cols-4 gap-1.5">
                {scenarios.map((s) => {
                  const meta = scenarioMeta[s.id] ?? fallbackMeta
                  const Icon = meta.icon
                  return (
                    <Tooltip key={s.id}>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          className={cn(
                            'flex flex-col items-center justify-center gap-1.5 rounded-lg py-2.5 px-1.5 transition-colors cursor-pointer',
                            meta.bg,
                            applyMutation.isPending &&
                              'opacity-50 pointer-events-none'
                          )}
                          onClick={(e) => {
                            e.stopPropagation()
                            applyMutation.mutate({
                              patientId: patient.patientId,
                              scenarioId: s.id,
                            })
                          }}
                        >
                          <Icon className={cn('h-5 w-5', meta.color)} />
                          <span className="text-xs font-medium leading-tight text-center text-foreground/80">
                            {s.name}
                          </span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        {s.description}
                      </TooltipContent>
                    </Tooltip>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
