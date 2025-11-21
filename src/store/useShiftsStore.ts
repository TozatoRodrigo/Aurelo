import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

// Define the Shift type based on Database type, or simpler
export interface Shift {
  id: string
  work_relation_id: string | null
  start_time: string
  end_time: string
  status: 'scheduled' | 'completed' | 'cancelled'
  estimated_value: number | null
  notes: string | null
  institution_name?: string // Joined data
  color?: string // Joined data
}

interface ShiftsState {
  shifts: Shift[]
  loading: boolean
  fetchShifts: (start: Date, end: Date) => Promise<void>
  addShift: (shift: Omit<Shift, 'id' | 'status'>) => Promise<void>
  updateShift: (id: string, shift: Partial<Shift>) => Promise<void>
  deleteShift: (id: string) => Promise<void>
}

export const useShiftsStore = create<ShiftsState>((set, get) => ({
  shifts: [],
  loading: false,
  fetchShifts: async (start, end) => {
    set({ loading: true })
    const supabase = createClient()
    
    try {
      // Sempre verificar autenticação e filtrar por user_id
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        set({ shifts: [], loading: false })
        return
      }

      const { data, error } = await supabase
        .from('shifts')
        .select(`
          *,
          work_relations (
            institution_name,
            color
          )
        `)
        .eq('user_id', user.id) // FILTRO EXPLÍCITO POR USER_ID
        .gte('start_time', start.toISOString())
        .lte('end_time', end.toISOString())

      if (error) throw error

      // Flatten the data structure for easier consumption
      const formattedShifts = data.map((shift: any) => ({
        ...shift,
        institution_name: shift.work_relations?.institution_name,
        color: shift.work_relations?.color,
      }))

      set({ shifts: formattedShifts })
    } catch (error: any) {
      console.error("Error fetching shifts:", error)
      toast.error("Erro ao carregar plantões")
    } finally {
      set({ loading: false })
    }
  },
  addShift: async (shiftData) => {
    const supabase = createClient()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("No user")

      const { data, error } = await supabase
        .from('shifts')
        .insert({
          user_id: user.id,
          work_relation_id: shiftData.work_relation_id,
          start_time: shiftData.start_time,
          end_time: shiftData.end_time,
          estimated_value: shiftData.estimated_value,
          notes: shiftData.notes || null,
          status: 'scheduled'
        })
        .select()
        .single()

      if (error) throw error

      toast.success("Plantão agendado!")
    } catch (error: any) {
      toast.error("Erro ao agendar plantão: " + error.message)
      throw error
    }
  },
  updateShift: async (id, shiftData) => {
    const supabase = createClient()
    try {
      // Sempre verificar que o shift pertence ao usuário
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Usuário não autenticado")

      const { error } = await supabase
        .from('shifts')
        .update({
          work_relation_id: shiftData.work_relation_id,
          start_time: shiftData.start_time,
          end_time: shiftData.end_time,
          estimated_value: shiftData.estimated_value,
          notes: shiftData.notes,
          status: shiftData.status,
        })
        .eq('id', id)
        .eq('user_id', user.id) // FILTRO EXPLÍCITO POR USER_ID

      if (error) throw error

      // Update local state
      set((state) => ({
        shifts: state.shifts.map((shift) =>
          shift.id === id ? { ...shift, ...shiftData } : shift
        ),
      }))

      toast.success("Plantão atualizado!")
    } catch (error: any) {
      toast.error("Erro ao atualizar plantão: " + error.message)
      throw error
    }
  },
  deleteShift: async (id) => {
    const supabase = createClient()
    try {
      // Sempre verificar que o shift pertence ao usuário
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Usuário não autenticado")

      const { error } = await supabase
        .from('shifts')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id) // FILTRO EXPLÍCITO POR USER_ID

      if (error) throw error

      // Update local state
      set((state) => ({
        shifts: state.shifts.filter((shift) => shift.id !== id),
      }))

      toast.success("Plantão excluído!")
    } catch (error: any) {
      toast.error("Erro ao excluir plantão: " + error.message)
      throw error
    }
  },
}))
