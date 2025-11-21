import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { ShiftSwap, SwapInterest } from '@/app/actions/shift-swaps'

interface ShiftSwapsState {
  swaps: ShiftSwap[]
  loading: boolean
  fetchSwaps: (filters?: { swap_type?: 'offer' | 'request' | 'exchange', exclude_own?: boolean }) => Promise<void>
  createSwap: (data: {
    shift_id?: string | null
    swap_type: 'offer' | 'request' | 'exchange'
    desired_date?: string | null
    desired_institution_id?: string | null
    description?: string | null
  }) => Promise<void>
  cancelSwap: (swapId: string) => Promise<void>
}

export const useShiftSwapsStore = create<ShiftSwapsState>((set, get) => ({
  swaps: [],
  loading: false,
  fetchSwaps: async (filters) => {
    set({ loading: true })
    const supabase = createClient()
    
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError) {
        console.error("Auth error:", authError)
        throw new Error("Erro de autenticação")
      }
      
      if (!user) {
        console.warn("No user found")
        set({ swaps: [] })
        return
      }

      // Buscar dados básicos primeiro - usar query mais simples
      let query = supabase
        .from('shift_swaps')
        .select(`
          *,
          profiles(full_name, role),
          shifts(
            start_time,
            end_time,
            work_relation_id
          )
        `)
        .eq('status', 'open')
        .order('created_at', { ascending: false })

      if (filters?.swap_type) {
        query = query.eq('swap_type', filters.swap_type)
      }

      if (filters?.exclude_own) {
        query = query.neq('user_id', user.id)
      }

      const { data, error } = await query

      if (error) {
        console.error("Database error:", error)
        if (error.code === '42P01' || error.message?.includes('does not exist')) {
          console.warn("Tabela shift_swaps não encontrada. Execute a migração: supabase/migrations/02_create_shift_swaps.sql")
          set({ swaps: [] })
          return
        }
        throw error
      }

      // Filtrar apenas plantões de amigos
      let filteredData = data || []
      if (filteredData.length > 0) {
        // Buscar lista de amigos
        const { data: friendsData } = await supabase
          .from('friends')
          .select('friend_id, user_id')
          .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
          .eq('status', 'accepted')

        const friendIds = new Set(
          (friendsData || []).map((f: any) => 
            f.user_id === user.id ? f.friend_id : f.user_id
          )
        )

        // Filtrar swaps para mostrar apenas de amigos (ou do próprio usuário)
        filteredData = filteredData.filter((swap: any) => 
          friendIds.has(swap.user_id) || swap.user_id === user.id
        )
      }

      // Buscar dados adicionais separadamente para evitar problemas com foreign keys
      const swapIds = filteredData.map((swap: any) => swap.id)
      let interestsCounts: Record<string, number> = {}
      let shiftInstitutions: Record<string, string> = {}
      let desiredInstitutions: Record<string, string> = {}
      
      if (swapIds.length > 0) {
        // Buscar contagem de interesses
        const { data: interestsData } = await supabase
          .from('swap_interests')
          .select('swap_id')
          .in('swap_id', swapIds)
        
        if (interestsData) {
          interestsCounts = interestsData.reduce((acc: Record<string, number>, interest: any) => {
            acc[interest.swap_id] = (acc[interest.swap_id] || 0) + 1
            return acc
          }, {})
        }

        // Buscar instituições dos shifts
        const shiftIds = (data || []).filter((s: any) => s.shift_id).map((s: any) => s.shift_id)
        if (shiftIds.length > 0) {
          const { data: shiftsData } = await supabase
            .from('shifts')
            .select('id, work_relation_id, work_relations(institution_name)')
            .in('id', shiftIds)
          
          if (shiftsData) {
            shiftsData.forEach((shift: any) => {
              const institution = Array.isArray(shift.work_relations) 
                ? shift.work_relations[0]?.institution_name 
                : shift.work_relations?.institution_name
              if (institution) {
                shiftInstitutions[shift.id] = institution
              }
            })
          }
        }

        // Buscar instituições desejadas
        const desiredIds = (data || []).filter((s: any) => s.desired_institution_id).map((s: any) => s.desired_institution_id)
        if (desiredIds.length > 0) {
          const { data: institutionsData } = await supabase
            .from('work_relations')
            .select('id, institution_name')
            .in('id', desiredIds)
          
          if (institutionsData) {
            institutionsData.forEach((inst: any) => {
              desiredInstitutions[inst.id] = inst.institution_name
            })
          }
        }
      }

        const transformed = filteredData.map((swap: any) => {
        // profiles pode ser um objeto ou array
        const userData = Array.isArray(swap.profiles) ? swap.profiles[0] : swap.profiles
        // shifts pode ser um objeto ou array
        const shiftData = Array.isArray(swap.shifts) ? swap.shifts[0] : swap.shifts
        
        return {
          ...swap,
          user: userData ? {
            full_name: userData.full_name,
            role: userData.role,
          } : null,
          shift: shiftData ? {
            start_time: shiftData.start_time,
            end_time: shiftData.end_time,
            institution_name: swap.shift_id ? shiftInstitutions[swap.shift_id] || null : null,
          } : null,
          desired_institution: swap.desired_institution_id ? {
            institution_name: desiredInstitutions[swap.desired_institution_id] || null,
          } : null,
          interests_count: interestsCounts[swap.id] || 0,
        }
      })

      set({ swaps: transformed })
    } catch (error: any) {
      console.error("Error fetching swaps:", error)
      const errorMessage = error?.message || error?.toString() || "Erro desconhecido"
      console.error("Error details:", {
        message: errorMessage,
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
      })
      toast.error(`Erro ao carregar trocas: ${errorMessage}`)
      set({ swaps: [] })
    } finally {
      set({ loading: false })
    }
  },
  createSwap: async (swapData) => {
    const supabase = createClient()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("No user")

      const { error } = await supabase
        .from('shift_swaps')
        .insert({
          user_id: user.id,
          shift_id: swapData.shift_id || null,
          swap_type: swapData.swap_type,
          desired_date: swapData.desired_date || null,
          desired_institution_id: swapData.desired_institution_id || null,
          description: swapData.description || null,
          status: 'open',
        })

      if (error) throw error
      
      toast.success("Troca anunciada com sucesso!")
      get().fetchSwaps() // Refresh list
    } catch (error: any) {
      toast.error("Erro ao anunciar troca: " + error.message)
      throw error
    }
  },
  cancelSwap: async (swapId) => {
    const supabase = createClient()
    try {
      const { error } = await supabase
        .from('shift_swaps')
        .update({ status: 'cancelled' })
        .eq('id', swapId)

      if (error) throw error

      set((state) => ({
        swaps: state.swaps.filter((s) => s.id !== swapId),
      }))
      toast.success("Troca cancelada!")
    } catch (error: any) {
      toast.error("Erro ao cancelar troca: " + error.message)
      throw error
    }
  },
}))

