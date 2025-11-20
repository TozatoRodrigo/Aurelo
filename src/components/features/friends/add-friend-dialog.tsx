"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserPlus, Mail, Hash, Search, Loader2, UserCheck } from "lucide-react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { sendFriendRequest, searchUsers } from "@/app/actions/friends"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface AddFriendDialogProps {
  onSuccess?: () => void
}

export function AddFriendDialog({ onSuccess }: AddFriendDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [friendCodeInput, setFriendCodeInput] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast.error("Digite um email")
      return
    }

    setLoading(true)
    try {
      const result = await sendFriendRequest({ email })
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Convite enviado com sucesso!")
        setEmail("")
        setOpen(false)
        // Aguardar um pouco antes de recarregar para garantir que o banco foi atualizado
        setTimeout(() => {
          onSuccess?.()
        }, 500)
      }
    } catch (error: any) {
      toast.error("Erro ao enviar convite: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleFriendCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!friendCodeInput) {
      toast.error("Digite um código")
      return
    }

    setLoading(true)
    try {
      const result = await sendFriendRequest({ friendCode: friendCodeInput })
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Solicitação enviada!")
        setFriendCodeInput("")
        setOpen(false)
        // Aguardar um pouco antes de recarregar para garantir que o banco foi atualizado
        setTimeout(() => {
          onSuccess?.()
        }, 500)
      }
    } catch (error: any) {
      toast.error("Erro ao usar código: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (query.length < 2) {
      setSearchResults([])
      return
    }

    setSearching(true)
    try {
      const result = await searchUsers(query)
      if (result.error) {
        toast.error(result.error)
      } else {
        setSearchResults(result.data || [])
      }
    } catch (error: any) {
      toast.error("Erro ao buscar usuários")
    } finally {
      setSearching(false)
    }
  }

  const handleAddUser = async (userId: string) => {
    setLoading(true)
    try {
      const result = await sendFriendRequest({ targetUserId: userId })
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Solicitação enviada!")
        setSearchQuery("")
        setSearchResults([])
        // Aguardar um pouco antes de recarregar para garantir que o banco foi atualizado
        setTimeout(() => {
          onSuccess?.()
        }, 500)
      }
    } catch (error: any) {
      toast.error("Erro ao enviar solicitação")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30">
          <UserPlus className="w-4 h-4" /> Adicionar Amigo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary" />
              Adicionar Amigo
            </DialogTitle>
            <DialogDescription>
              Conecte-se com seus colegas e compartilhe oportunidades
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="search" className="mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="search">
                <Search className="w-4 h-4 mr-2" />
                Buscar
              </TabsTrigger>
              <TabsTrigger value="email">
                <Mail className="w-4 h-4 mr-2" />
                Email
              </TabsTrigger>
              <TabsTrigger value="code">
                <Hash className="w-4 h-4 mr-2" />
                Código
              </TabsTrigger>
            </TabsList>

            <TabsContent value="search" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Buscar por nome ou profissão</Label>
                <Input
                  placeholder="Digite o nome ou profissão..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="bg-white/50"
                />
              </div>

              {searching && (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                </div>
              )}

              {searchResults.length > 0 && (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {searchResults.map((user) => {
                    const initials = user.full_name
                      ?.split(' ')
                      .map((n: string) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2) || '?'

                    return (
                      <motion.div
                        key={user.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3 p-3 rounded-xl bg-white/50 hover:bg-white/70 transition-colors"
                      >
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={user.avatar_url} alt={user.full_name} />
                          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{user.full_name}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.role}</p>
                          {user.friend_code && (
                            <p className="text-[10px] text-primary/80 font-mono tracking-[0.4em] mt-1">
                              {user.friend_code}
                            </p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleAddUser(user.id)}
                          disabled={loading}
                        >
                          <UserPlus className="w-4 h-4 mr-1" />
                          Adicionar
                        </Button>
                      </motion.div>
                    )
                  })}
                </div>
              )}

              {searchQuery.length >= 2 && !searching && searchResults.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  Nenhum usuário encontrado
                </div>
              )}
            </TabsContent>

            <TabsContent value="email" className="space-y-4 mt-4">
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Email do colega</Label>
                  <Input
                    type="email"
                    placeholder="colega@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white/50"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Enviaremos um convite por email. Se o colega ainda não estiver cadastrado, ele receberá um código de convite.
                  </p>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Enviar Convite
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="code" className="space-y-4 mt-4">
              <form onSubmit={handleFriendCodeSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Código de Convite</Label>
                  <Input
                    placeholder="ABC12345"
                    value={friendCodeInput}
                    onChange={(e) => setFriendCodeInput(e.target.value.toUpperCase())}
                    className="bg-white/50 font-mono text-center text-lg tracking-widest"
                    maxLength={8}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Peça ao seu colega o código exibido no perfil dele e conectem-se rapidamente
                  </p>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4 mr-2" />
                      Enviar Solicitação
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}

