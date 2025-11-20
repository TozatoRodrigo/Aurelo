"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format, differenceInHours } from "date-fns"
import { ptBR } from "date-fns/locale"
import type { Shift } from "@/store/useShiftsStore"
import { MapPin, Clock, DollarSign, Edit2, Trash2, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EditShiftDialog } from "./edit-shift-dialog"

interface ShiftCardProps {
  shift: Shift
  onEdit?: (shift: Shift) => void
  onDelete?: (shiftId: string) => void
}

export function ShiftCard({ shift, onEdit, onDelete }: ShiftCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false)
  const startDate = new Date(shift.start_time)
  const endDate = new Date(shift.end_time)
  const hours = Math.abs(differenceInHours(endDate, startDate))

  return (
    <Card className="border-l-4 shadow-sm overflow-hidden hover:shadow-md transition-shadow bg-white/60 backdrop-blur-sm" style={{ borderLeftColor: shift.color || '#3A7BF8' }}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="font-bold text-foreground text-base">{shift.institution_name || 'Plantão'}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {format(startDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
            </p>
          </div>
          <Badge 
            variant={shift.status === 'completed' ? 'secondary' : 'outline'}
            className="text-[10px] h-5 px-2"
          >
            {shift.status === 'scheduled' ? 'Agendado' : shift.status === 'completed' ? 'Concluído' : 'Cancelado'}
          </Badge>
        </div>
        
        <div className="flex items-center gap-4 text-sm mb-3">
          <div className="flex items-center gap-1.5 bg-primary/10 px-2 py-1 rounded-lg">
            <Clock className="w-4 h-4 text-primary" />
            <span className="font-semibold text-primary">
              {format(startDate, "HH:mm")} - {format(endDate, "HH:mm")}
            </span>
            <span className="text-xs text-muted-foreground ml-1">({hours}h)</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span className="text-xs">Presencial</span>
          </div>
        </div>

        {shift.notes && (
          <div className="mt-3 pt-3 border-t border-border/50">
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <FileText className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span className="line-clamp-2">{shift.notes}</span>
            </div>
          </div>
        )}

        {(shift.estimated_value && shift.estimated_value > 0) || (onEdit || onDelete) ? (
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            {shift.estimated_value && shift.estimated_value > 0 && (
              <div className="flex items-center gap-1.5 text-sm font-bold text-green-600 dark:text-green-400">
                <DollarSign className="w-4 h-4" />
                <span>R$ {shift.estimated_value.toFixed(2)}</span>
              </div>
            )}
            <div className="flex gap-1 ml-auto">
              {onEdit && (
                <EditShiftDialog shift={shift} onSave={onEdit}>
                  <Button variant="ghost" size="icon-sm" className="h-7 w-7">
                    <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                  </Button>
                </EditShiftDialog>
              )}
              {onDelete && (
                <Button 
                  variant="ghost" 
                  size="icon-sm" 
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={() => onDelete(shift.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
