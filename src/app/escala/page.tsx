"use client"

import { useState, useEffect, useMemo } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AddShiftDialog } from "@/components/features/shifts/add-shift-dialog"
import { ShiftCard } from "@/components/features/shifts/shift-card"
import { useShiftsStore } from "@/store/useShiftsStore"
import { format, startOfMonth, endOfMonth, isSameDay, startOfDay, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { Loader2, Filter } from "lucide-react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type { Shift } from "@/store/useShiftsStore"

export default function EscalaPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [filterInstitution, setFilterInstitution] = useState<string>("all")
  const [workRelations, setWorkRelations] = useState<any[]>([])
  const [checkingOnboarding, setCheckingOnboarding] = useState(true)
  const { shifts, fetchShifts, loading, updateShift, deleteShift } = useShiftsStore()
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const checkOnboarding = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }

      // Verificar se tem vínculos de trabalho
      const { data: relations } = await supabase
        .from('work_relations')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)

      if (!relations || relations.length === 0) {
        toast.info("Complete seu cadastro adicionando seus vínculos de trabalho")
        router.push("/onboarding")
        return
      }

      setWorkRelations(relations)
      setCheckingOnboarding(false)
    }

    checkOnboarding()
  }, [])

  // Carregar plantões quando a página carregar ou quando mudar o mês
  useEffect(() => {
    if (!checkingOnboarding) {
      const currentDate = date || new Date()
      const start = startOfMonth(currentDate)
      const end = endOfMonth(currentDate)
      fetchShifts(start, end)
    }
  }, [date, checkingOnboarding, fetchShifts])

  useEffect(() => {
    const fetchRelations = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('work_relations').select('*').eq('user_id', user.id)
        if (data) setWorkRelations(data)
      }
    }
    if (!checkingOnboarding) {
      fetchRelations()
    }
  }, [checkingOnboarding])

  const filteredShifts = useMemo(() => {
    let filtered = shifts

    if (date) {
      // Normalizar a data selecionada para comparar apenas dia/mês/ano (sem hora)
      const selectedDateNormalized = startOfDay(date)
      
      filtered = filtered.filter(shift => {
        // Normalizar a data do plantão para comparar apenas dia/mês/ano
        const shiftDate = startOfDay(new Date(shift.start_time))
        return isSameDay(shiftDate, selectedDateNormalized)
      })
    }

    if (filterInstitution !== "all") {
      filtered = filtered.filter(shift => shift.work_relation_id === filterInstitution)
    }

    return filtered.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
  }, [shifts, date, filterInstitution])

  const daysWithShifts = useMemo(() => {
    // Normalizar todas as datas para comparar apenas dia/mês/ano (sem hora/timezone)
    const dates = shifts.map(shift => {
      const shiftDate = new Date(shift.start_time)
      // Usar startOfDay para normalizar e evitar problemas de timezone
      return startOfDay(shiftDate)
    })
    
    // Remover duplicatas comparando strings de data
    const uniqueDateStrings = Array.from(new Set(dates.map(d => format(d, 'yyyy-MM-dd'))))
    
    // Converter de volta para Date objects normalizados
    return uniqueDateStrings.map(dateStr => {
      // Parse a data sem timezone para evitar problemas
      const [year, month, day] = dateStr.split('-').map(Number)
      return new Date(year, month - 1, day)
    })
  }, [shifts])

  const handleMonthChange = (month: Date) => {
    fetchShifts(startOfMonth(month), endOfMonth(month))
  }

  if (checkingOnboarding) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Verificando configuração...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-24">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Minha Escala</h1>
        <AddShiftDialog onShiftAdded={() => fetchShifts(startOfMonth(new Date()), endOfMonth(new Date()))} />
      </div>

      <Card className="border-none shadow-lg bg-white/50 backdrop-blur-sm">
        <CardContent className="p-4 flex flex-col items-center gap-4">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-2xl border-none bg-transparent"
            locale={ptBR}
            modifiers={{
              booked: daysWithShifts
            }}
            modifiersStyles={{
              booked: { 
                fontWeight: 'bold', 
                backgroundColor: 'var(--primary)',
                color: 'white',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(58, 123, 248, 0.3)',
                position: 'relative'
              }
            }}
            onMonthChange={handleMonthChange}
          />
          {daysWithShifts.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-primary shadow-sm"></div>
              <span>{daysWithShifts.length} dia{daysWithShifts.length > 1 ? 's' : ''} com plantão</span>
            </div>
          )}
        </CardContent>
      </Card>

      <div>
        <h2 className="text-lg font-semibold mb-4 px-1">
          Plantões em {date ? format(date, "d 'de' MMMM", { locale: ptBR }) : "Carregando..."}
        </h2>

        {workRelations.length > 0 && (
          <div className="flex gap-3 items-center mb-4">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={filterInstitution} onValueChange={setFilterInstitution}>
              <SelectTrigger className="w-[200px] bg-white/50 backdrop-blur-sm">
                <SelectValue placeholder="Filtrar por hospital" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os hospitais</SelectItem>
                {workRelations.map(rel => (
                  <SelectItem key={rel.id} value={rel.id}>
                    {rel.institution_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary" /></div>
        ) : filteredShifts.length > 0 ? (
          <div className="space-y-3">
            {filteredShifts.map((shift, i) => (
              <motion.div
                key={shift.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <ShiftCard 
                  shift={shift} 
                  onEdit={(updatedShift) => {
                    updateShift(shift.id, updatedShift)
                    fetchShifts(startOfMonth(new Date()), endOfMonth(new Date()))
                  }}
                  onDelete={(shiftId) => {
                    deleteShift(shiftId)
                    fetchShifts(startOfMonth(new Date()), endOfMonth(new Date()))
                  }}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center text-muted-foreground border-dashed bg-transparent border-2">
            <p>Nenhum plantão agendado para esta data.</p>
            <div className="mt-4">
              <AddShiftDialog selectedDate={date} onShiftAdded={() => fetchShifts(startOfMonth(new Date()), endOfMonth(new Date()))} />
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
