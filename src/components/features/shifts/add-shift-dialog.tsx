"use client"

import { useState, useEffect, useCallback, memo } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { useShiftsStore } from "@/store/useShiftsStore"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Plus, Loader2, Calendar as CalendarIcon, Clock, Building2, DollarSign } from "lucide-react"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface AddShiftDialogProps {
  selectedDate?: Date
  onShiftAdded?: () => void
}

// Componente memoizado para o popover do calendário
const CalendarPopover = memo(({ 
  shiftDate, 
  onDateSelect 
}: { 
  shiftDate: Date | undefined
  onDateSelect: (date: Date | undefined) => void 
}) => {
  const handleSelect = useCallback((date: Date | undefined) => {
    if (date) {
      onDateSelect(date)
    }
  }, [onDateSelect])

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="bg-white/50 shrink-0"
        >
          <CalendarIcon className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={shiftDate}
          onSelect={handleSelect}
          initialFocus
          locale={ptBR}
        />
      </PopoverContent>
    </Popover>
  )
})
CalendarPopover.displayName = "CalendarPopover"

export function AddShiftDialog({ selectedDate, onShiftAdded }: AddShiftDialogProps) {
  const [open, setOpen] = useState(false)
  const [workRelations, setWorkRelations] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const { addShift } = useShiftsStore()

  // Form State
  const [shiftDate, setShiftDate] = useState<Date | undefined>(selectedDate || new Date())
  const [relationId, setRelationId] = useState("")
  const [startTime, setStartTime] = useState("07:00")
  const [endTime, setEndTime] = useState("19:00")
  const [value, setValue] = useState("")
  const [notes, setNotes] = useState("")

  // Memoizar a função de seleção de data
  const handleDateSelect = useCallback((date: Date | undefined) => {
    setShiftDate(date)
  }, [])

  useEffect(() => {
    if (open) {
      fetchRelations()
      // Reset date to selectedDate or today when dialog opens
      setShiftDate(selectedDate || new Date())
    } else {
      // Reset form when dialog closes
      setShiftDate(selectedDate || new Date())
      setRelationId("")
      setStartTime("07:00")
      setEndTime("19:00")
      setValue("")
      setNotes("")
    }
  }, [open, selectedDate])

  // Verificar vínculos ao abrir
  useEffect(() => {
    if (open && workRelations.length === 0) {
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
    
    if (!relationId) {
      toast.error("Selecione um local de trabalho")
      return
    }
    
    setLoading(true)

    try {
      if (!shiftDate) {
        toast.error("Selecione uma data para o plantão")
        return
      }

      const dateBase = shiftDate
      const startDateTime = new Date(dateBase)
      const [startH, startM] = startTime.split(':')
      startDateTime.setHours(parseInt(startH), parseInt(startM), 0, 0)

      const endDateTime = new Date(dateBase)
      const [endH, endM] = endTime.split(':')
      endDateTime.setHours(parseInt(endH), parseInt(endM), 0, 0)
      
      // Handle overnight shifts (end time before start time)
      if (endDateTime < startDateTime) {
        endDateTime.setDate(endDateTime.getDate() + 1)
      }

              await addShift({
                work_relation_id: relationId,
                start_time: startDateTime.toISOString(),
                end_time: endDateTime.toISOString(),
                estimated_value: value ? parseFloat(value) : 0,
                notes: notes.trim() || null,
              })

      toast.success("Plantão agendado com sucesso!")
      setOpen(false)
      onShiftAdded?.()
    } catch (error: any) {
      toast.error("Erro ao agendar plantão: " + (error.message || "Erro desconhecido"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30">
          <Plus className="w-4 h-4" /> Novo Plantão
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-primary" />
              Adicionar Plantão
            </DialogTitle>
            <DialogDescription>
              Selecione a data e preencha os dados do plantão
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-5 py-2">
            <motion.div 
              className="space-y-2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 }}
            >
              <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-2">
                <CalendarIcon className="w-3.5 h-3.5" />
                Data do Plantão
              </Label>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={shiftDate ? format(shiftDate, "yyyy-MM-dd") : ""}
                  onChange={(e) => {
                    if (e.target.value) {
                      const selectedDate = new Date(e.target.value + "T00:00:00")
                      setShiftDate(selectedDate)
                    }
                  }}
                  className="bg-white/50 flex-1"
                  required
                />
                <CalendarPopover 
                  shiftDate={shiftDate} 
                  onDateSelect={handleDateSelect}
                />
              </div>
              {shiftDate && (
                <p className="text-xs text-muted-foreground">
                  {format(shiftDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              )}
            </motion.div>

            <motion.div 
              className="space-y-2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5" />
                Local de Trabalho
              </Label>
                    {workRelations.length === 0 ? (
                      <div className="space-y-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200 text-center">
                          ⚠️ Você precisa cadastrar um vínculo de trabalho primeiro.
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            setOpen(false)
                            window.location.href = '/perfil'
                          }}
                        >
                          Ir para Perfil e Cadastrar Vínculo
                        </Button>
                      </div>
                    ) : (
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
                    )}
                  </motion.div>

            <motion.div 
              className="grid grid-cols-2 gap-4"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" />
                  Início
                </Label>
                <Input 
                  type="time" 
                  value={startTime} 
                  onChange={(e) => setStartTime(e.target.value)} 
                  required
                  className="bg-white/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" />
                  Fim
                </Label>
                <Input 
                  type="time" 
                  value={endTime} 
                  onChange={(e) => setEndTime(e.target.value)} 
                  required
                  className="bg-white/50"
                />
              </div>
            </motion.div>

            <motion.div 
              className="space-y-2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-2">
                <DollarSign className="w-3.5 h-3.5" />
                Valor Estimado (R$)
              </Label>
              <Input 
                type="number" 
                step="0.01"
                value={value} 
                onChange={(e) => setValue(e.target.value)} 
                placeholder="Opcional"
                className="bg-white/50"
              />
            </motion.div>

            <motion.div 
              className="space-y-2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 }}
            >
              <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                Notas (Opcional)
              </Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Adicione observações sobre este plantão..."
                className="bg-white/50 min-h-20"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Button 
                type="submit" 
                className="w-full shadow-lg shadow-primary/20" 
                disabled={loading || workRelations.length === 0 || !relationId || !shiftDate}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Agendar Plantão
                  </>
                )}
              </Button>
            </motion.div>
          </form>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}
