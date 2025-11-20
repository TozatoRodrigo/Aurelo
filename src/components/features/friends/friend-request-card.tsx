"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { UserCheck, UserX, Clock } from "lucide-react"
import { motion } from "framer-motion"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import type { FriendRequest } from "@/app/actions/friends"

interface FriendRequestCardProps {
  request: FriendRequest
  type: 'sent' | 'received'
  onAccept?: (requestId: string) => void
  onReject?: (requestId: string) => void
}

export function FriendRequestCard({ request, type, onAccept, onReject }: FriendRequestCardProps) {
  const userData = type === 'received' ? request.from_user : request.to_user
  const initials = userData?.full_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="p-4 border-none shadow-sm bg-white/50 backdrop-blur-sm hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3">
          <Avatar className="w-12 h-12">
            <AvatarImage src={userData?.avatar_url} alt={userData?.full_name} />
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">{userData?.full_name || request.to_email}</h3>
            <p className="text-xs text-muted-foreground truncate">{userData?.role || 'Usuário não cadastrado'}</p>
            {request.message && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{request.message}</p>
            )}
            <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground">
              <Clock className="w-3 h-3" />
              {formatDistanceToNow(new Date(request.created_at), { addSuffix: true, locale: ptBR })}
            </div>
          </div>

          {type === 'received' && (
            <div className="flex gap-2 shrink-0">
              <Button
                size="sm"
                variant="default"
                onClick={() => onAccept?.(request.id)}
                className="rounded-full"
              >
                <UserCheck className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onReject?.(request.id)}
                className="rounded-full"
              >
                <UserX className="w-4 h-4" />
              </Button>
            </div>
          )}

          {type === 'sent' && (
            <div className="text-xs text-muted-foreground shrink-0">
              Pendente
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  )
}

