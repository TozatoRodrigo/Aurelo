"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { UserMinus, UserCheck } from "lucide-react"
import { motion } from "framer-motion"
import type { Friend } from "@/app/actions/friends"

interface FriendCardProps {
  friend: Friend
  onRemove?: (friendId: string) => void
}

export function FriendCard({ friend, onRemove }: FriendCardProps) {
  const friendData = friend.friend
  const initials = friendData?.full_name
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
            <AvatarImage src={friendData?.avatar_url} alt={friendData?.full_name} />
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">{friendData?.full_name}</h3>
            <p className="text-xs text-muted-foreground truncate">{friendData?.role}</p>
          </div>

          {onRemove && (
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0"
              onClick={() => onRemove(friendData?.id || '')}
            >
              <UserMinus className="w-4 h-4 text-muted-foreground" />
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  )
}

