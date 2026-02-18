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
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <Users className="mb-3 size-10 opacity-40" />
        <p className="text-sm">No patients found</p>
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
            <TableCell>{formatDOB(patient.dateOfBirth)}</TableCell>
            <TableCell className="capitalize">{patient.gender}</TableCell>
            <TableCell>{patient.primaryCondition ?? '—'}</TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={() => onEdit(patient)}
                    >
                      <Pencil className="size-4" />
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
                        className="size-8 hover:text-destructive"
                        onClick={() => onDelete(patient)}
                      >
                        <Trash2 className="size-4" />
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
