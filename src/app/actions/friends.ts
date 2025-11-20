"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export interface Friend {
  id: string
  user_id: string
  friend_id: string
  status: 'pending' | 'accepted' | 'blocked'
  created_at: string
  updated_at: string
  // Joined data
  friend?: {
    id: string
    full_name: string
    role: string
    avatar_url?: string
  }
  user?: {
    id: string
    full_name: string
    role: string
    avatar_url?: string
  }
}

export interface FriendRequest {
  id: string
  from_user_id: string
  to_user_id: string | null
  to_email: string | null
  invite_code: string | null
  status: 'pending' | 'accepted' | 'rejected' | 'expired'
  message: string | null
  created_at: string
  updated_at: string
  expires_at: string
  // Joined data
  from_user?: {
    id: string
    full_name: string
    role: string
    avatar_url?: string
  }
  to_user?: {
    id: string
    full_name: string
    role: string
    avatar_url?: string
  }
}

// Buscar amigos do usuário
export async function getFriends(status: 'pending' | 'accepted' = 'accepted') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: "Usuário não autenticado", data: [] }
  }

  const { data, error } = await supabase
    .from('friends')
    .select(`
      *,
      friend:profiles!friends_friend_id_fkey(id, full_name, role, avatar_url),
      user:profiles!friends_user_id_fkey(id, full_name, role, avatar_url)
    `)
    .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
    .eq('status', status)
    .order('created_at', { ascending: false })

  if (error) {
    return { error: error.message, data: [] }
  }

  // Transformar para sempre mostrar o amigo (não o usuário atual)
  const transformed = (data || []).map((friendship: any) => {
    const friend = friendship.user_id === user.id 
      ? friendship.friend 
      : friendship.user
    
    return {
      ...friendship,
      friend,
    }
  })

  return { data: transformed }
}

// Buscar solicitações de amizade
export async function getFriendRequests(type: 'sent' | 'received' = 'received') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: "Usuário não autenticado", data: [] }
  }

  // Buscar solicitações - usar query simples primeiro
  let query = supabase
    .from('friend_requests')
    .select('*')
    .eq('status', 'pending')

  if (type === 'sent') {
    query = query.eq('from_user_id', user.id)
    console.log(`🔍 Buscando solicitações ENVIADAS para usuário: ${user.id}`)
  } else {
    query = query.eq('to_user_id', user.id)
    console.log(`🔍 Buscando solicitações RECEBIDAS para usuário: ${user.id}`)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) {
    console.error(`❌ Erro ao buscar friend_requests (${type}):`, error)
    return { error: error.message, data: [] }
  }

  console.log(`✅ Solicitações encontradas (${type}):`, data?.length || 0, data)

  if (!data || data.length === 0) {
    console.log(`⚠️ Nenhuma solicitação ${type} encontrada`)
    return { data: [] }
  }

  // Buscar dados dos usuários separadamente
  const fromUserIds = [...new Set(data.map((r: any) => r.from_user_id))]
  const toUserIds = [...new Set(data.map((r: any) => r.to_user_id).filter(Boolean))]

  console.log(`📋 IDs de remetentes:`, fromUserIds)
  console.log(`📋 IDs de destinatários:`, toUserIds)

  // Buscar dados dos remetentes
  let fromUsersMap = new Map()
  if (fromUserIds.length > 0) {
    const { data: fromUsers, error: fromUsersError } = await supabase
      .from('profiles')
      .select('id, full_name, role, avatar_url')
      .in('id', fromUserIds)
    
    if (fromUsersError) {
      console.error("Erro ao buscar remetentes:", fromUsersError)
    } else {
      console.log(`✅ Remetentes encontrados:`, fromUsers?.length || 0)
      if (fromUsers) {
        fromUsersMap = new Map(fromUsers.map((u: any) => [u.id, u]))
      }
    }
  }

  // Buscar dados dos destinatários
  let toUsersMap = new Map()
  if (toUserIds.length > 0) {
    const { data: toUsers, error: toUsersError } = await supabase
      .from('profiles')
      .select('id, full_name, role, avatar_url')
      .in('id', toUserIds)
    
    if (toUsersError) {
      console.error("Erro ao buscar destinatários:", toUsersError)
    } else {
      console.log(`✅ Destinatários encontrados:`, toUsers?.length || 0)
      if (toUsers) {
        toUsersMap = new Map(toUsers.map((u: any) => [u.id, u]))
      }
    }
  }

  // Montar resposta com dados dos usuários
  const requests = data.map((request: any) => ({
    ...request,
    from_user: fromUsersMap.get(request.from_user_id) || null,
    to_user: request.to_user_id ? (toUsersMap.get(request.to_user_id) || null) : null,
  }))

  console.log(`✅ Solicitações montadas (${type}):`, requests.length)
  return { data: requests }
}

// Enviar solicitação de amizade por email
export async function sendFriendRequest(data: {
  email?: string
  inviteCode?: string
  friendCode?: string
  targetUserId?: string
  message?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: "Usuário não autenticado" }
  }

  // Se for por código de convite, buscar o request
  if (data.inviteCode) {
    const { data: request, error: requestError } = await supabase
      .from('friend_requests')
      .select('*')
      .eq('invite_code', data.inviteCode.toUpperCase())
      .eq('status', 'pending')
      .single()

    if (requestError || !request) {
      return { error: "Código de convite inválido ou expirado" }
    }

    // Aceitar o convite
    const { error: acceptError } = await supabase
      .from('friend_requests')
      .update({ 
        status: 'accepted',
        to_user_id: user.id 
      })
      .eq('id', request.id)

    if (acceptError) {
      return { error: acceptError.message }
    }

    // Criar amizade bidirecional
    const { error: friendError1 } = await supabase
      .from('friends')
      .insert({
        user_id: request.from_user_id,
        friend_id: user.id,
        status: 'accepted'
      })

    const { error: friendError2 } = await supabase
      .from('friends')
      .insert({
        user_id: user.id,
        friend_id: request.from_user_id,
        status: 'accepted'
      })

    if (friendError1 || friendError2) {
      return { error: "Erro ao criar amizade" }
    }

    revalidatePath('/amigos')
    return { success: true }
  }

  // Se for por código de amigo (código público do perfil)
  if (data.friendCode) {
    const friendCode = data.friendCode.trim().toUpperCase()

    // Tentar primeiro usar a função de segurança (se disponível)
    let targetProfile: any = null
    
    try {
      const { data: functionResult, error: functionError } = await supabase
        .rpc('get_profile_by_friend_code', { code: friendCode })

      if (!functionError && functionResult && functionResult.length > 0) {
        targetProfile = functionResult[0]
      }
    } catch (error) {
      // Se a função não existir, tentar query direta
      console.warn("Função get_profile_by_friend_code não encontrada, usando query direta")
    }

    // Se a função não funcionou, tentar query direta (requer política RLS)
    if (!targetProfile) {
      const { data: queryResult, error: codeError } = await supabase
        .from('profiles')
        .select('id, friend_code, full_name, role, avatar_url')
        .eq('friend_code', friendCode)
        .maybeSingle()

      if (codeError) {
        console.error("Erro ao buscar por friend_code:", codeError)
        // Se for erro de coluna não encontrada
        if (codeError.code === '42703' || codeError.message?.includes('column') || codeError.message?.includes('friend_code')) {
          return { error: "Coluna friend_code não encontrada. Execute a migration: supabase/migrations/05_add_friend_code_to_profiles.sql" }
        }
        // Se for erro de permissão, sugerir executar migration
        if (codeError.code === '42501' || codeError.message?.includes('permission')) {
          return { error: "Permissão negada. Execute a migration: supabase/migrations/07_allow_friend_code_search.sql" }
        }
        return { error: "Erro ao buscar código: " + codeError.message }
      }

      targetProfile = queryResult
    }

    if (!targetProfile || !targetProfile.id) {
      console.error("Código não encontrado:", friendCode)
      return { error: `Código "${friendCode}" não encontrado. Verifique se o código está correto e se a migration foi executada.` }
    }

    if (targetProfile.id === user.id) {
      return { error: "Você não pode se adicionar" }
    }

    // Verificar se já são amigos
    const { data: existingFriend } = await supabase
      .from('friends')
      .select('id')
      .or(`and(user_id.eq.${user.id},friend_id.eq.${targetProfile.id}),and(user_id.eq.${targetProfile.id},friend_id.eq.${user.id})`)
      .maybeSingle()

    if (existingFriend) {
      return { error: "Vocês já são amigos" }
    }

    // Verificar solicitações pendentes
    const { data: existingRequest } = await supabase
      .from('friend_requests')
      .select('id')
      .or(`and(from_user_id.eq.${user.id},to_user_id.eq.${targetProfile.id}),and(from_user_id.eq.${targetProfile.id},to_user_id.eq.${user.id})`)
      .eq('status', 'pending')
      .maybeSingle()

    if (existingRequest) {
      return { error: "Já existe uma solicitação pendente" }
    }

    const { data: newRequest, error } = await supabase
      .from('friend_requests')
      .insert({
        from_user_id: user.id,
        to_user_id: targetProfile.id,
        message: data.message || null,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      console.error("Erro ao criar friend_request:", error)
      return { error: error.message }
    }

    console.log("Friend request criada com sucesso:", newRequest)
    revalidatePath('/amigos')
    return { success: true, data: newRequest }
  }

  // Se selecionou um usuário da busca
  if (data.targetUserId) {
    const targetUserId = data.targetUserId
    if (targetUserId === user.id) {
      return { error: "Você não pode se adicionar" }
    }

    const { data: targetProfile, error: targetError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', targetUserId)
      .single()

    if (targetError || !targetProfile) {
      return { error: "Usuário não encontrado" }
    }

    const { data: existingFriend } = await supabase
      .from('friends')
      .select('id')
      .or(`and(user_id.eq.${user.id},friend_id.eq.${targetUserId}),and(user_id.eq.${targetUserId},friend_id.eq.${user.id})`)
      .maybeSingle()

    if (existingFriend) {
      return { error: "Vocês já são amigos" }
    }

    const { data: existingRequest } = await supabase
      .from('friend_requests')
      .select('id')
      .or(`and(from_user_id.eq.${user.id},to_user_id.eq.${targetUserId}),and(from_user_id.eq.${targetUserId},to_user_id.eq.${user.id})`)
      .eq('status', 'pending')
      .maybeSingle()

    if (existingRequest) {
      return { error: "Já existe uma solicitação pendente" }
    }

    const { error } = await supabase
      .from('friend_requests')
      .insert({
        from_user_id: user.id,
        to_user_id: targetUserId,
        message: data.message || null,
        status: 'pending',
      })

    if (error) {
      return { error: error.message }
    }

    revalidatePath('/amigos')
    return { success: true }
  }

  // Se for por email, criar novo request
  if (data.email) {
    // Não podemos verificar se o email está cadastrado diretamente (auth.users não é acessível)
    // Vamos criar a solicitação e o sistema pode verificar depois quando o usuário se cadastrar
    // Se o usuário já existir, podemos tentar encontrar pelo perfil (mas não temos email em profiles)
    // Por enquanto, criamos com to_user_id null e to_email preenchido

    // Gerar código de convite único
    const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase()

    const { error } = await supabase
      .from('friend_requests')
      .insert({
        from_user_id: user.id,
        to_user_id: null, // Será preenchido quando o usuário aceitar o convite
        to_email: data.email,
        invite_code: inviteCode,
        message: data.message || null,
        status: 'pending'
      })

    if (error) {
      return { error: error.message }
    }

    revalidatePath('/amigos')
    return { success: true, inviteCode }
  }

  return { error: "Email ou código de convite necessário" }
}

// Aceitar solicitação de amizade
export async function acceptFriendRequest(requestId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: "Usuário não autenticado" }
  }

  console.log(`🔍 Aceitando solicitação: ${requestId} para usuário: ${user.id}`)

  // Buscar o request - primeiro sem filtro de to_user_id para ver se existe
  const { data: request, error: requestError } = await supabase
    .from('friend_requests')
    .select('*')
    .eq('id', requestId)
    .eq('status', 'pending')
    .maybeSingle()

  console.log(`📋 Solicitação encontrada:`, request)
  console.log(`❌ Erro na busca:`, requestError)

  if (requestError) {
    console.error("Erro ao buscar solicitação:", requestError)
    return { error: `Erro ao buscar solicitação: ${requestError.message}` }
  }

  if (!request) {
    console.error("Solicitação não encontrada com ID:", requestId)
    return { error: "Solicitação não encontrada ou já foi processada" }
  }

  // Verificar se o usuário é o destinatário
  if (request.to_user_id !== user.id) {
    console.error(`Usuário ${user.id} não é o destinatário. Destinatário: ${request.to_user_id}`)
    return { error: "Você não tem permissão para aceitar esta solicitação" }
  }

  console.log(`✅ Solicitação válida encontrada. Atualizando status...`)

  // Atualizar status do request
  const { error: updateError } = await supabase
    .from('friend_requests')
    .update({ status: 'accepted', updated_at: new Date().toISOString() })
    .eq('id', requestId)
    .eq('to_user_id', user.id) // Garantir que só atualiza se for o destinatário

  if (updateError) {
    console.error("Erro ao atualizar solicitação:", updateError)
    return { error: `Erro ao atualizar solicitação: ${updateError.message}` }
  }

  console.log(`✅ Status atualizado. Criando amizade bidirecional...`)

  // Verificar se já existe amizade antes de criar
  const { data: existingFriend } = await supabase
    .from('friends')
    .select('id')
    .or(`and(user_id.eq.${request.from_user_id},friend_id.eq.${user.id}),and(user_id.eq.${user.id},friend_id.eq.${request.from_user_id})`)
    .maybeSingle()

  if (existingFriend) {
    console.log(`⚠️ Amizade já existe, pulando criação`)
    revalidatePath('/amigos')
    return { success: true }
  }

  // Criar amizade bidirecional (apenas uma entrada, já que é bidirecional)
  const { error: friendError } = await supabase
    .from('friends')
    .insert({
      user_id: request.from_user_id,
      friend_id: user.id,
      status: 'accepted'
    })

  if (friendError) {
    console.error("Erro ao criar amizade:", friendError)
    // Tentar criar a amizade reversa também
    const { error: friendError2 } = await supabase
      .from('friends')
      .insert({
        user_id: user.id,
        friend_id: request.from_user_id,
        status: 'accepted'
      })
    
    if (friendError2) {
      return { error: `Erro ao criar amizade: ${friendError.message || friendError2.message}` }
    }
  }

  console.log(`✅ Amizade criada com sucesso!`)

  revalidatePath('/amigos')
  return { success: true }
}

// Rejeitar solicitação de amizade
export async function rejectFriendRequest(requestId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: "Usuário não autenticado" }
  }

  const { error } = await supabase
    .from('friend_requests')
    .update({ status: 'rejected' })
    .eq('id', requestId)
    .eq('to_user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/amigos')
  return { success: true }
}

// Remover amigo
export async function removeFriend(friendId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: "Usuário não autenticado" }
  }

  // Remover ambas as direções da amizade
  const { error: error1 } = await supabase
    .from('friends')
    .delete()
    .or(`and(user_id.eq.${user.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user.id})`)

  if (error1) {
    return { error: error1.message }
  }

  revalidatePath('/amigos')
  return { success: true }
}

// Buscar usuários para adicionar (busca)
export async function searchUsers(query: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: "Usuário não autenticado", data: [] }
  }

  if (!query || query.length < 2) {
    return { data: [] }
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, role, avatar_url, friend_code')
    .or(`full_name.ilike.%${query}%,role.ilike.%${query}%,friend_code.ilike.%${query.toUpperCase()}%`)
    .neq('id', user.id)
    .limit(10)

  if (error) {
    return { error: error.message, data: [] }
  }

  // Filtrar usuários que já são amigos
  const { data: friends } = await supabase
    .from('friends')
    .select('friend_id, user_id')
    .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
    .eq('status', 'accepted')

  const friendIds = new Set(
    (friends || []).map((f: any) => 
      f.user_id === user.id ? f.friend_id : f.user_id
    )
  )

  const filtered = (data || []).filter((u: any) => !friendIds.has(u.id))

  return { data: filtered }
}

