"use client"

import { useState, useEffect } from "react"
import { AddFriendDialog } from "@/components/features/friends/add-friend-dialog"
import { FriendCard } from "@/components/features/friends/friend-card"
import { FriendRequestCard } from "@/components/features/friends/friend-request-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Loader2, Users, UserPlus, UserCheck, Mail } from "lucide-react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { 
  getFriends, 
  getFriendRequests, 
  acceptFriendRequest, 
  rejectFriendRequest, 
  removeFriend 
} from "@/app/actions/friends"
import type { Friend, FriendRequest } from "@/app/actions/friends"

export default function AmigosPage() {
  const [friends, setFriends] = useState<Friend[]>([])
  const [receivedRequests, setReceivedRequests] = useState<FriendRequest[]>([])
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("friends")

  const loadData = async () => {
    setLoading(true)
    try {
      const [friendsResult, receivedResult, sentResult] = await Promise.all([
        getFriends('accepted'),
        getFriendRequests('received'),
        getFriendRequests('sent'),
      ])

      if (friendsResult.error) {
        console.error("Erro ao buscar amigos:", friendsResult.error)
      }
      if (receivedResult.error) {
        console.error("Erro ao buscar recebidas:", receivedResult.error)
      }
      if (sentResult.error) {
        console.error("Erro ao buscar enviadas:", sentResult.error)
      }

      if (friendsResult.data) {
        setFriends(friendsResult.data)
        console.log("Amigos carregados:", friendsResult.data.length)
      }
      if (receivedResult.data) {
        setReceivedRequests(receivedResult.data)
        console.log("Recebidas carregadas:", receivedResult.data.length)
      }
      if (sentResult.data) {
        setSentRequests(sentResult.data)
        console.log("Enviadas carregadas:", sentResult.data.length)
      }
    } catch (error: any) {
      console.error("Erro ao carregar dados:", error)
      toast.error("Erro ao carregar dados: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleAcceptRequest = async (requestId: string) => {
    console.log(`🔄 Aceitando solicitação: ${requestId}`)
    try {
      const result = await acceptFriendRequest(requestId)
      if (result.error) {
        console.error("Erro ao aceitar:", result.error)
        toast.error(result.error)
      } else {
        console.log("✅ Solicitação aceita com sucesso!")
        toast.success("Amizade aceita!")
        // Aguardar um pouco antes de recarregar
        setTimeout(() => {
          loadData()
        }, 500)
      }
    } catch (error: any) {
      console.error("Erro ao aceitar solicitação:", error)
      toast.error("Erro ao aceitar solicitação: " + (error.message || "Erro desconhecido"))
    }
  }

  const handleRejectRequest = async (requestId: string) => {
    try {
      const result = await rejectFriendRequest(requestId)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Solicitação rejeitada")
        loadData()
      }
    } catch (error: any) {
      toast.error("Erro ao rejeitar solicitação")
    }
  }

  const handleRemoveFriend = async (friendId: string) => {
    try {
      const result = await removeFriend(friendId)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Amigo removido")
        loadData()
      }
    } catch (error: any) {
      toast.error("Erro ao remover amigo")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-24">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Amigos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Conecte-se com seus colegas e compartilhe oportunidades
          </p>
        </div>
        <AddFriendDialog onSuccess={loadData} />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="friends">
            <Users className="w-4 h-4 mr-2" />
            Amigos ({friends.length})
          </TabsTrigger>
          <TabsTrigger value="received">
            <Mail className="w-4 h-4 mr-2" />
            Recebidas ({receivedRequests.length})
          </TabsTrigger>
          <TabsTrigger value="sent">
            <UserPlus className="w-4 h-4 mr-2" />
            Enviadas ({sentRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="friends" className="space-y-4">
          {friends.length > 0 ? (
            <div className="grid gap-3">
              {friends.map((friend) => (
                <FriendCard
                  key={friend.id}
                  friend={friend}
                  onRemove={handleRemoveFriend}
                />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center border-dashed bg-transparent border-2">
              <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="font-semibold mb-2">Nenhum amigo ainda</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Comece adicionando seus colegas para compartilhar oportunidades
              </p>
              <AddFriendDialog onSuccess={loadData} />
            </Card>
          )}
        </TabsContent>

        <TabsContent value="received" className="space-y-4">
          {receivedRequests.length > 0 ? (
            <div className="grid gap-3">
              {receivedRequests.map((request) => (
                <FriendRequestCard
                  key={request.id}
                  request={request}
                  type="received"
                  onAccept={handleAcceptRequest}
                  onReject={handleRejectRequest}
                />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center border-dashed bg-transparent border-2">
              <Mail className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="font-semibold mb-2">Nenhuma solicitação recebida</h3>
              <p className="text-sm text-muted-foreground">
                Quando alguém te adicionar, aparecerá aqui
              </p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="sent" className="space-y-4">
          {sentRequests.length > 0 ? (
            <div className="grid gap-3">
              {sentRequests.map((request) => (
                <FriendRequestCard
                  key={request.id}
                  request={request}
                  type="sent"
                />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center border-dashed bg-transparent border-2">
              <UserPlus className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="font-semibold mb-2">Nenhuma solicitação enviada</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Envie convites para seus colegas
              </p>
              <AddFriendDialog onSuccess={loadData} />
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

