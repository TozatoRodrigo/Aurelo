"use client"

import { useState, useCallback, useRef, useEffect, memo } from "react"
import { Button } from "@/components/ui/button"
import { Bell } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { Notification } from "@/app/actions/notifications"

const notificationIcons = {
  reminder: "🔔",
  swap_match: "✨",
  swap_interest: "💬",
  burnout_alert: "⚠️",
  goal_achieved: "🎉",
}

const notificationColors = {
  reminder: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  swap_match: "bg-green-500/10 text-green-700 dark:text-green-400",
  swap_interest: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  burnout_alert: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  goal_achieved: "bg-primary/10 text-primary",
}

// Componente memoizado para o botão do trigger
const NotificationButton = memo(({ unreadCount }: { unreadCount: number }) => (
  <Button variant="ghost" size="icon" className="relative">
    <Bell className="w-5 h-5" />
    {unreadCount > 0 && (
      <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-white text-[10px] font-bold flex items-center justify-center">
        {unreadCount > 9 ? '9+' : unreadCount}
      </span>
    )}
  </Button>
))
NotificationButton.displayName = "NotificationButton"

function NotificationBellComponent() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  
  // Usar useRef para manter o cliente Supabase estável
  const supabaseRef = useRef(createClient())
  const isFetchingRef = useRef(false)
  const hasLoadedRef = useRef(false)
  const lastOpenStateRef = useRef<boolean | null>(null)

  // Função para buscar notificações - memoizada com useCallback
  const fetchNotifications = useCallback(async () => {
    if (isFetchingRef.current) return
    
    isFetchingRef.current = true
    setLoading(true)
    
    try {
      const { data: { user }, error: userError } = await supabaseRef.current.auth.getUser()
      
      if (userError) {
        console.error("Auth error:", userError)
        return
      }
      
      if (!user) {
        return
      }

      const { data, error } = await supabaseRef.current
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        console.error("Database error:", error)
        return
      }

      const notificationsData = data || []
      setNotifications(notificationsData)
      setUnreadCount(notificationsData.filter(n => !n.read).length)
      hasLoadedRef.current = true
    } catch (error) {
      console.error("Fetch error:", error)
    } finally {
      setLoading(false)
      isFetchingRef.current = false
    }
  }, [])

  // Handler para quando o popover abre/fecha - memoizado e com proteção rigorosa contra loops
  const handleOpenChange = useCallback((newOpen: boolean) => {
    // Proteção rigorosa: só processar se o estado realmente mudou
    if (lastOpenStateRef.current === newOpen) {
      return
    }
    lastOpenStateRef.current = newOpen
    
    // Se está abrindo e ainda não carregou, carregar notificações
    if (newOpen && !hasLoadedRef.current && !isFetchingRef.current) {
      // Usar setTimeout com delay mínimo para evitar chamadas síncronas
      setTimeout(() => {
        if (lastOpenStateRef.current === true) {
          fetchNotifications()
        }
      }, 0)
    }
  }, [fetchNotifications])

  // Carregar contagem inicial de não lidas apenas uma vez
  useEffect(() => {
    let mounted = true
    
    const loadUnreadCount = async () => {
      try {
        const { data: { user } } = await supabaseRef.current.auth.getUser()
        if (!user || !mounted) return

        const { count, error } = await supabaseRef.current
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('read', false)

        if (error) {
          console.error("Error loading unread count:", error)
          return
        }

        if (mounted) {
          setUnreadCount(count || 0)
        }
      } catch (error) {
        console.error("Error loading unread count:", error)
      }
    }

    loadUnreadCount()
    
    return () => {
      mounted = false
    }
  }, [])

  const handleNotificationClick = useCallback(async (notification: Notification) => {
    if (!notification.read) {
      try {
        const { data: { user } } = await supabaseRef.current.auth.getUser()
        if (!user) return

        await supabaseRef.current
          .from('notifications')
          .update({ read: true })
          .eq('id', notification.id)
          .eq('user_id', user.id)

        setNotifications(prev =>
          prev.map(n => (n.id === notification.id ? { ...n, read: true } : n))
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      } catch (error) {
        console.error("Error marking as read:", error)
      }
    }

    if (notification.link) {
      router.push(notification.link)
      lastOpenStateRef.current = false
    }
  }, [router])

  const handleMarkAllRead = useCallback(async () => {
    try {
      const { data: { user } } = await supabaseRef.current.auth.getUser()
      if (!user) return

      await supabaseRef.current
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false)

      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error("Error marking all as read:", error)
    }
  }, [])

  return (
    <Popover onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <NotificationButton unreadCount={unreadCount} />
      </PopoverTrigger>
      <PopoverContent className="w-[350px] p-0 rounded-3xl" align="end">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-semibold text-sm">Notificações</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              className="text-xs h-7"
            >
              Marcar todas como lidas
            </Button>
          )}
        </div>
        <ScrollArea className="h-[400px]">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhuma notificação</p>
            </div>
          ) : (
            <div className="divide-y">
              <AnimatePresence mode="popLayout">
                {notifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                    className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                      !notification.read ? 'bg-primary/5' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex gap-3">
                      <div className={`text-2xl shrink-0 ${notificationColors[notification.type]}`}>
                        {notificationIcons[notification.type]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-semibold text-sm">{notification.title}</h4>
                          {!notification.read && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5"
                            />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mb-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <span className="text-[10px] text-muted-foreground">
                          {formatDistanceToNow(new Date(notification.created_at), { 
                            addSuffix: true, 
                            locale: ptBR 
                          })}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}

// Memoizar o componente para evitar re-renders desnecessários
export const NotificationBell = memo(NotificationBellComponent)
NotificationBell.displayName = "NotificationBell"
