"use server"

import { createClient } from "@/lib/supabase/server"

export interface Notification {
  id: string
  user_id: string
  type: 'reminder' | 'swap_match' | 'swap_interest' | 'burnout_alert' | 'goal_achieved'
  title: string
  message: string
  link: string | null
  read: boolean
  created_at: string
}

export async function createNotification(data: {
  userId: string
  type: Notification['type']
  title: string
  message: string
  link?: string | null
}) {
  const supabase = await createClient()

  const { data: notification, error } = await supabase
    .from('notifications')
    .insert({
      user_id: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      link: data.link || null,
      read: false,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating notification:", error)
    return { error: error.message }
  }

  return { data: notification }
}

export async function getUserNotifications(limit: number = 20) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: "Usuário não autenticado", data: [] }
  }

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    return { error: error.message, data: [] }
  }

  return { data: data || [] }
}

export async function markNotificationAsRead(notificationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: "Usuário não autenticado" }
  }

  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function markAllNotificationsAsRead() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: "Usuário não autenticado" }
  }

  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', user.id)
    .eq('read', false)

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function getUnreadCount() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: "Usuário não autenticado", count: 0 }
  }

  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('read', false)

  if (error) {
    return { error: error.message, count: 0 }
  }

  return { count: count || 0 }
}

