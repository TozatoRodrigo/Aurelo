"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Shift } from "@/store/useShiftsStore"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useShiftsStore } from "@/store/useShiftsStore"

interface EditShiftDialogProps {
  shift: Shift
  onSave: (shift: Shift) => void
  children: React.ReactNode
}

export function EditShiftDialog({ shift, onSave, children }: EditShiftDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [workRelations, setWorkRelations] = useState<any[]>([])
  const { updateShift, deleteShift } = useShiftsStore()
  
  // Form State
  const [relationId, setRelationId] = useState(shift.work_relation_id || "")
  const [startTime, setStartTime] = useState(format(new Date(shift.start_time), "HH:mm"))
  const [endTime, setEndTime] = useState(format(new Date(shift.end_time), "HH:mm"))
  const [value, setValue] = useState(shift.estimated_value?.toString() || "")
  const [notes, setNotes] = useState(shift.notes || "")
  const [status, setStatus] = useState(shift.status)

  useEffect(() => {
    if (open) {
      fetchRelations()
    }
  }, [open])

  const fetchRelations = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    
    const { data } = await supabase.from('work_relations').select('*').eq('user_id', user.id)
    if (data) setWorkRelations(data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const startDate = new Date(shift.start_time)
      const [startH, startM] = startTime.split(':')
      startDate.setHours(parseInt(startH), parseInt(startM))

      const endDate = new Date(shift.end_time)
      const [endH, endM] = endTime.split(':')
      endDate.setHours(parseInt(endH), parseInt(endM))
      
      if (endDate < startDate) {
        endDate.setDate(endDate.getDate() + 1)
      }

      await updateShift(shift.id, {
        work_relation_id: relationId,
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
        estimated_value: value ? parseFloat(value) : 0,
        notes: notes.trim() || null,
        status: status,
      })
      toast.success("Plantão atualizado com sucesso!")
      setOpen(false)
      onSave(updatedShift)
    } catch (error: any) {
      toast.error("Erro ao atualizar plantão: " + (error.message || "Erro desconhecido"))
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir este plantão?")) return
    
    setLoading(true)
    try {
      await deleteShift(shift.id)
      toast.success("Plantão excluído com sucesso!")
      setOpen(false)
    } catch (error: any) {
      toast.error("Erro ao excluir plantão")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-3xl">
        <DialogHeader>
          <DialogTitle>Editar Plantão</DialogTitle>
          <DialogDescription>
            {format(new Date(shift.start_time), "d 'de' MMMM", { locale: ptBR })}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Local de Trabalho</Label>
            <Select value={relationId} onValueChange={setRelationId} required>
              <SelectTrigger className="bg-white/50">
                <SelectValue placeholder="Selecione o hospital..." />
              </SelectTrigger>
              <SelectContent>
                {workRelations.map((rel) => (
                  <SelectItem key={rel.id} value={rel.id}>
                    {rel.institution_name} ({rel.contract_type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Início</Label>
              <Input 
                type="time" 
                value={startTime} 
                onChange={(e) => setStartTime(e.target.value)} 
                required
                className="bg-white/50"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Fim</Label>
              <Input 
                type="time" 
                value={endTime} 
                onChange={(e) => setEndTime(e.target.value)} 
                required
                className="bg-white/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Valor Estimado (R$)</Label>
            <Input 
              type="number" 
              step="0.01"
              value={value} 
              onChange={(e) => setValue(e.target.value)} 
              placeholder="Opcional"
              className="bg-white/50"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Status</Label>
            <Select value={status} onValueChange={(value: any) => setStatus(value)}>
              <SelectTrigger className="bg-white/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">Agendado</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Notas</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Adicione observações sobre este plantão..."
              className="bg-white/50 min-h-20"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button 
              type="button" 
              variant="destructive" 
              className="flex-1"
              onClick={handleDelete}
              disabled={loading}
            >
              Excluir
            </Button>
            <Button 
              type="submit" 
              className="flex-1 shadow-lg shadow-primary/20" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Alterações"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

