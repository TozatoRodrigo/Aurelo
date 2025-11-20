"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export interface ShiftSwap {
  id: string
  user_id: string
  shift_id: string | null
  swap_type: 'offer' | 'request' | 'exchange'
  desired_date: string | null
  desired_institution_id: string | null
  status: 'open' | 'matched' | 'completed' | 'cancelled'
  description: string | null
  created_at: string
  updated_at: string
  // Joined data
  user?: {
    full_name: string
    role: string
  }
  shift?: {
    start_time: string
    end_time: string
    institution_name: string
  }
  desired_institution?: {
    institution_name: string
  }
  interests_count?: number
}

export interface SwapInterest {
  id: string
  swap_id: string
  interested_user_id: string
  message: string | null
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
  updated_at: string
  // Joined data
  interested_user?: {
    full_name: string
    role: string
  }
}

export async function createShiftSwap(data: {
  shift_id?: string | null
  swap_type: 'offer' | 'request' | 'exchange'
  desired_date?: string | null
  desired_institution_id?: string | null
  description?: string | null
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: "Usuário não autenticado" }
  }

  const { data: swap, error } = await supabase
    .from('shift_swaps')
    .insert({
      user_id: user.id,
      shift_id: data.shift_id || null,
      swap_type: data.swap_type,
      desired_date: data.desired_date || null,
      desired_institution_id: data.desired_institution_id || null,
      description: data.description || null,
      status: 'open',
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/trocas')
  return { data: swap }
}

export async function getShiftSwaps(filters?: {
  swap_type?: 'offer' | 'request' | 'exchange'
  status?: 'open' | 'matched' | 'completed' | 'cancelled'
  exclude_own?: boolean
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: "Usuário não autenticado", data: [] }
  }

  let query = supabase
    .from('shift_swaps')
    .select(`
      *,
      user:profiles!shift_swaps_user_id_fkey(full_name, role),
      shift:shifts!shift_swaps_shift_id_fkey(
        start_time,
        end_time,
        work_relations(institution_name)
      ),
      desired_institution:work_relations!shift_swaps_desired_institution_id_fkey(institution_name),
      interests:swap_interests(count)
    `)
    .eq('status', filters?.status || 'open')
    .order('created_at', { ascending: false })

  if (filters?.swap_type) {
    query = query.eq('swap_type', filters.swap_type)
  }

  if (filters?.exclude_own) {
    query = query.neq('user_id', user.id)
  }

  const { data, error } = await query

  if (error) {
    return { error: error.message, data: [] }
  }

  // Transform the data to flatten nested structures
  const transformed = (data || []).map((swap: any) => ({
    ...swap,
    user: swap.user || null,
    shift: swap.shift ? {
      ...swap.shift,
      institution_name: swap.shift.work_relations?.[0]?.institution_name || null,
    } : null,
    desired_institution: swap.desired_institution || null,
    interests_count: swap.interests?.[0]?.count || 0,
  }))

  return { data: transformed }
}

export async function createSwapInterest(swapId: string, message?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: "Usuário não autenticado" }
  }

  // Check if swap exists and is open
  const { data: swap } = await supabase
    .from('shift_swaps')
    .select('status, user_id')
    .eq('id', swapId)
    .single()

  if (!swap) {
    return { error: "Troca não encontrada" }
  }

  if (swap.status !== 'open') {
    return { error: "Esta troca não está mais disponível" }
  }

  if (swap.user_id === user.id) {
    return { error: "Você não pode demonstrar interesse na sua própria troca" }
  }

  // Check if interest already exists
  const { data: existing } = await supabase
    .from('swap_interests')
    .select('id')
    .eq('swap_id', swapId)
    .eq('interested_user_id', user.id)
    .single()

  if (existing) {
    return { error: "Você já demonstrou interesse nesta troca" }
  }

  const { data: interest, error } = await supabase
    .from('swap_interests')
    .insert({
      swap_id: swapId,
      interested_user_id: user.id,
      message: message || null,
      status: 'pending',
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/trocas')
  return { data: interest }
}

export async function getSwapInterests(swapId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: "Usuário não autenticado", data: [] }
  }

  // Verify user owns the swap
  const { data: swap } = await supabase
    .from('shift_swaps')
    .select('user_id')
    .eq('id', swapId)
    .single()

  if (!swap || swap.user_id !== user.id) {
    return { error: "Você não tem permissão para ver os interesses desta troca", data: [] }
  }

  const { data, error } = await supabase
    .from('swap_interests')
    .select(`
      *,
      interested_user:profiles!swap_interests_interested_user_id_fkey(full_name, role)
    `)
    .eq('swap_id', swapId)
    .order('created_at', { ascending: false })

  if (error) {
    return { error: error.message, data: [] }
  }

  return { data: data || [] }
}

export async function updateSwapInterestStatus(
  interestId: string,
  status: 'accepted' | 'rejected'
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: "Usuário não autenticado" }
  }

  // Get the interest and verify ownership
  const { data: interest } = await supabase
    .from('swap_interests')
    .select(`
      *,
      swap:shift_swaps!swap_interests_swap_id_fkey(user_id, status)
    `)
    .eq('id', interestId)
    .single()

  if (!interest) {
    return { error: "Interesse não encontrado" }
  }

  if (interest.swap.user_id !== user.id) {
    return { error: "Você não tem permissão para atualizar este interesse" }
  }

  if (interest.swap.status !== 'open') {
    return { error: "Esta troca não está mais disponível" }
  }

  const { data: updated, error } = await supabase
    .from('swap_interests')
    .update({ status })
    .eq('id', interestId)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  // If accepted, mark swap as matched and reject other interests
  if (status === 'accepted') {
    // Buscar dados completos do swap
    const { data: swapData } = await supabase
      .from('shift_swaps')
      .select('*')
      .eq('id', interest.swap_id)
      .single()

    if (!swapData) {
      return { error: "Troca não encontrada" }
    }

    // Buscar dados do shift se houver
    let shiftData: any = null
    if (swapData.shift_id) {
      const { data: shift } = await supabase
        .from('shifts')
        .select('*')
        .eq('id', swapData.shift_id)
        .single()
      
      if (shift) {
        shiftData = shift
      }
    }

    // Atualizar status do swap
    await supabase
      .from('shift_swaps')
      .update({ status: 'matched' })
      .eq('id', interest.swap_id)

    // Rejeitar outros interesses
    await supabase
      .from('swap_interests')
      .update({ status: 'rejected' })
      .eq('swap_id', interest.swap_id)
      .neq('id', interestId)

    // Atualizar escalas baseado no tipo de swap
    if (swapData.swap_type === 'offer' && shiftData) {
      // OFERTA: O interessado recebe o plantão oferecido
      // Criar novo plantão para o interessado com os dados do plantão oferecido
      const { error: shiftError } = await supabase
        .from('shifts')
        .insert({
          user_id: interest.interested_user_id,
          work_relation_id: shiftData.work_relation_id,
          start_time: shiftData.start_time,
          end_time: shiftData.end_time,
          estimated_value: shiftData.estimated_value,
          notes: `Plantão recebido via troca de ${swapData.user_id}`,
          status: 'scheduled',
          is_manual_entry: false,
        })

      if (shiftError) {
        console.error("Erro ao criar plantão para interessado:", shiftError)
        return { error: "Erro ao atualizar escala: " + shiftError.message }
      }

      // Remover plantão original do anunciante (marcar como cancelado)
      await supabase
        .from('shifts')
        .update({ status: 'cancelled' })
        .eq('id', swapData.shift_id)
        .eq('user_id', user.id)
    }
    // Para 'request' e 'exchange', apenas marcamos como matched
    // O interessado pode criar o plantão manualmente depois
  }

  revalidatePath('/trocas')
  revalidatePath('/escala')
  return { data: updated }
}

export async function cancelShiftSwap(swapId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: "Usuário não autenticado" }
  }

  const { error } = await supabase
    .from('shift_swaps')
    .update({ status: 'cancelled' })
    .eq('id', swapId)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/trocas')
  return { success: true }
}

