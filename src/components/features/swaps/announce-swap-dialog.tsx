"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useShiftSwapsStore } from "@/store/useShiftSwapsStore"
import { useShiftsStore } from "@/store/useShiftsStore"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Loader2, Calendar, Clock, Building2, FileText } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface AnnounceSwapDialogProps {
  onSuccess?: () => void
}

export function AnnounceSwapDialog({ onSuccess }: AnnounceSwapDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [workRelations, setWorkRelations] = useState<any[]>([])
  const [shifts, setShifts] = useState<any[]>([])
  const { createSwap, fetchSwaps } = useShiftSwapsStore()
  const { shifts: userShifts } = useShiftsStore()
  const supabase = createClient()

  // Form state
  const [swapType, setSwapType] = useState<'offer' | 'request' | 'exchange'>('offer')
  const [shiftId, setShiftId] = useState<string>("")
  const [desiredDate, setDesiredDate] = useState<string>("")
  const [desiredInstitutionId, setDesiredInstitutionId] = useState<string>("")
  const [description, setDescription] = useState<string>("")

  useEffect(() => {
    if (open) {
      fetchData()
    } else {
      // Reset form when dialog closes
      setSwapType('offer')
      setShiftId("")
      setDesiredDate("")
      setDesiredInstitutionId("")
      setDescription("")
    }
  }, [open])

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      // Fetch work relations
      const { data: relations } = await supabase
        .from('work_relations')
        .select('*')
        .eq('user_id', user.id)
      if (relations) setWorkRelations(relations)

      // Fetch user's upcoming shifts
      const now = new Date()
      const { data: shiftsData } = await supabase
        .from('shifts')
        .select(`
          *,
          work_relations(institution_name)
        `)
        .eq('user_id', user.id) // FILTRO EXPLÍCITO POR USER_ID
        .gte('start_time', now.toISOString())
        .order('start_time', { ascending: true })
      
      if (shiftsData) {
        setShifts(shiftsData.map((s: any) => ({
          ...s,
          institution_name: s.work_relations?.institution_name,
        })))
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (swapType === 'offer' && !shiftId) {
      toast.error("Selecione um plantão para oferecer")
      return
    }

    if (swapType === 'exchange' && !shiftId) {
      toast.error("Selecione o plantão que você quer trocar")
      return
    }

    if ((swapType === 'request' || swapType === 'exchange') && !desiredDate) {
      toast.error("Informe a data desejada")
      return
    }

    setLoading(true)

    try {
      await createSwap({
        shift_id: (swapType === 'offer' || swapType === 'exchange') ? shiftId : null,
        swap_type: swapType,
        desired_date: (swapType === 'request' || swapType === 'exchange') ? desiredDate : null,
        desired_institution_id: desiredInstitutionId || null,
        description: description || null,
      })

      toast.success("Troca anunciada com sucesso!")
      setOpen(false)
      fetchSwaps({ exclude_own: false })
      onSuccess?.()
    } catch (error: any) {
      toast.error("Erro ao anunciar troca: " + (error.message || "Erro desconhecido"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" className="whitespace-nowrap shadow-lg">
          Anunciar
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-3xl max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Anunciar Plantão
          </DialogTitle>
          <DialogDescription>
            Escolha o tipo de anúncio. Apenas seus amigos poderão ver e aceitar.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              Tipo de Anúncio
            </Label>
            <Select value={swapType} onValueChange={(value: any) => setSwapType(value)}>
              <SelectTrigger className="bg-white/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="offer">Oferta - Tenho um plantão e quero passar/vender</SelectItem>
                <SelectItem value="request">Solicitação - Preciso de um plantão em data específica</SelectItem>
                <SelectItem value="exchange">Troca - Quero trocar meu plantão por outro em data diferente</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              {swapType === 'offer' && 'Você tem um plantão agendado e quer passar para alguém'}
              {swapType === 'request' && 'Você precisa de um plantão em uma data específica'}
              {swapType === 'exchange' && 'Você quer trocar um plantão seu por outro em data diferente'}
            </p>
          </div>

          {swapType === 'offer' && (
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" />
                Plantão que Você Quer Passar/Vender
              </Label>
              <Select value={shiftId} onValueChange={setShiftId} required>
                <SelectTrigger className="bg-white/50">
                  <SelectValue placeholder="Selecione um plantão..." />
                </SelectTrigger>
                <SelectContent>
                  {shifts.length === 0 ? (
                    <SelectItem value="none" disabled>Nenhum plantão futuro disponível</SelectItem>
                  ) : (
                    shifts.map((shift) => (
                      <SelectItem key={shift.id} value={shift.id}>
                        {format(new Date(shift.start_time), "dd/MM/yyyy", { locale: ptBR })} - {format(new Date(shift.start_time), "HH:mm", { locale: ptBR })} ({shift.institution_name || "Sem vínculo"})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          {swapType === 'exchange' && (
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" />
                Plantão que Você Quer Trocar
              </Label>
              <Select value={shiftId} onValueChange={setShiftId} required>
                <SelectTrigger className="bg-white/50">
                  <SelectValue placeholder="Selecione um plantão..." />
                </SelectTrigger>
                <SelectContent>
                  {shifts.length === 0 ? (
                    <SelectItem value="none" disabled>Nenhum plantão futuro disponível</SelectItem>
                  ) : (
                    shifts.map((shift) => (
                      <SelectItem key={shift.id} value={shift.id}>
                        {format(new Date(shift.start_time), "dd/MM/yyyy", { locale: ptBR })} - {format(new Date(shift.start_time), "HH:mm", { locale: ptBR })} ({shift.institution_name || "Sem vínculo"})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          {(swapType === 'request' || swapType === 'exchange') && (
            <>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" />
                  {swapType === 'request' ? 'Data que Você Precisa' : 'Data Desejada para Troca'}
                </Label>
                <Input 
                  type="date" 
                  value={desiredDate}
                  onChange={(e) => setDesiredDate(e.target.value)}
                  className="bg-white/50"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5" />
                  Instituição Desejada (Opcional)
                </Label>
                <Select value={desiredInstitutionId} onValueChange={setDesiredInstitutionId}>
                  <SelectTrigger className="bg-white/50">
                    <SelectValue placeholder="Qualquer instituição" />
                  </SelectTrigger>
                  <SelectContent>
                    {workRelations.map(rel => (
                      <SelectItem key={rel.id} value={rel.id}>
                        {rel.institution_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              Descrição (Opcional)
            </Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Preciso folgar neste dia..."
              className="bg-white/50 min-h-20"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full shadow-lg shadow-primary/20" 
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Anunciando...
              </>
            ) : (
              "Confirmar Anúncio"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

