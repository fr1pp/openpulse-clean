import React from 'react'
import { Pencil, Trash2, Users } from 'lucide-react'
import type { PatientListItem } from '@/api/queries/patients'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

function formatDOB(dateStr: string): string {
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}

interface PatientTableProps {
  patients: PatientListItem[]
  isAdmin: boolean
  onEdit: (patient: PatientListItem) => void
  onDelete: (patient: PatientListItem) => void
  renderName?: (patient: PatientListItem) => React.ReactNode
}

export function PatientTable({ patients, isAdmin, onEdit, onDelete, renderName }: PatientTableProps) {
  if (patients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
        <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-muted/60">
          <Users className="size-6 opacity-50" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-medium text-foreground/70">No patients found</p>
          <p className="text-xs text-muted-foreground">Add a patient to get started</p>
        </div>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Date of Birth</TableHead>
          <TableHead>Gender</TableHead>
          <TableHead>Primary Condition</TableHead>
          <TableHead className="w-[100px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {patients.map((patient) => (
          <TableRow key={patient.id}>
            <TableCell className="font-medium">
              {renderName ? renderName(patient) : `${patient.firstName} ${patient.lastName}`}
            </TableCell>
            <TableCell className="text-muted-foreground">{formatDOB(patient.dateOfBirth)}</TableCell>
            <TableCell className="capitalize text-muted-foreground">{patient.gender}</TableCell>
            <TableCell className="text-muted-foreground">{patient.primaryCondition ?? '—'}</TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-foreground hover:bg-accent"
                      onClick={() => onEdit(patient)}
                    >
                      <Pencil className="size-3.5" />
                      <span className="sr-only">Edit patient</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Edit patient</TooltipContent>
                </Tooltip>
                {isAdmin && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => onDelete(patient)}
                      >
                        <Trash2 className="size-3.5" />
                        <span className="sr-only">Delete patient</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Delete patient</TooltipContent>
                  </Tooltip>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
