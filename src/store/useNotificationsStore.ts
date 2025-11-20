import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import type { Notification } from '@/app/actions/notifications'

interface NotificationsState {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  fetchNotifications: () => Promise<void>
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  refreshUnreadCount: () => Promise<void>
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  fetchNotifications: async () => {
    // Evitar múltiplas chamadas simultâneas
    if (get().loading) return
    
    set({ loading: true })
    const supabase = createClient()
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        set({ loading: false })
        return
      }

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error

      const notificationsData = data || []
      set({ 
        notifications: notificationsData,
        // Update unread count
        unreadCount: notificationsData.filter(n => !n.read).length
      })
    } catch (error: any) {
      console.error("Error fetching notifications:", error)
    } finally {
      set({ loading: false })
    }
  },
  markAsRead: async (id: string) => {
    const supabase = createClient()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error

      set((state) => ({
        notifications: state.notifications.map(n => 
          n.id === id ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }))
    } catch (error: any) {
      console.error("Error marking notification as read:", error)
    }
  },
  markAllAsRead: async () => {
    const supabase = createClient()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false)

      if (error) throw error

      set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, read: true })),
        unreadCount: 0,
      }))
    } catch (error: any) {
      console.error("Error marking all as read:", error)
    }
  },
  refreshUnreadCount: async () => {
    const supabase = createClient()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('read', false)

      if (error) throw error

      set({ unreadCount: count || 0 })
    } catch (error: any) {
      console.error("Error refreshing unread count:", error)
    }
  },
}))
