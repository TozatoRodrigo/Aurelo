"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Trash2, Edit2, Plus, LogOut, Copy, Check, Mail, User } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { ProfileForm } from "@/components/features/onboarding/profile-form"
import { WorkRelationForm } from "@/components/features/onboarding/work-relation-form"

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [userEmail, setUserEmail] = useState<string>("")
  const [workRelations, setWorkRelations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)
  const [isAddRelationOpen, setIsAddRelationOpen] = useState(false)
  const [editingRelationId, setEditingRelationId] = useState<string | null>(null)
  const [codeCopied, setCodeCopied] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  
  // Preferences state
  const [monthlyGoal, setMonthlyGoal] = useState("")
  const [weeklyLimit, setWeeklyLimit] = useState("")
  const [savingPrefs, setSavingPrefs] = useState(false)

  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    fetchData()
  }, [])

  // Não redirecionar do perfil - permitir acesso para cadastrar vínculos

  // Função para gerar código único
  const generateFriendCode = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase()
  }

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push("/login")
      return
    }

    // Buscar email do usuário
    if (user.email) {
      setUserEmail(user.email)
    }

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    // Se o perfil não tem friend_code, gerar e salvar
    if (profileData && !profileData.friend_code) {
      try {
        let newCode = generateFriendCode()
        let attempts = 0
        const maxAttempts = 10

        // Tentar gerar um código único (verificar se já existe)
        while (attempts < maxAttempts) {
          const { data: existing } = await supabase
            .from('profiles')
            .select('id')
            .eq('friend_code', newCode)
            .single()

          if (!existing) {
            // Código único encontrado, salvar
            const { data: updatedProfile, error } = await supabase
              .from('profiles')
              .update({ friend_code: newCode })
              .eq('id', user.id)
              .select()
              .single()

            if (!error && updatedProfile) {
              profileData.friend_code = newCode
              break
            } else if (error) {
              // Se der erro (ex: coluna não existe), tentar novamente com outro código
              console.warn("Erro ao salvar friend_code:", error)
            }
          }
          
          newCode = generateFriendCode()
          attempts++
        }

        // Se não conseguiu gerar código único após várias tentativas, usar timestamp
        if (!profileData.friend_code) {
          const fallbackCode = `A${Date.now().toString(36).substring(2, 8).toUpperCase()}`
          const { data: updatedProfile, error: fallbackError } = await supabase
            .from('profiles')
            .update({ friend_code: fallbackCode })
            .eq('id', user.id)
            .select()
            .single()

          if (!fallbackError && updatedProfile) {
            profileData.friend_code = fallbackCode
          } else if (fallbackError) {
            // Se a coluna não existe, usar código temporário apenas na UI
            console.warn("Coluna friend_code não encontrada. Execute a migration: supabase/migrations/05_add_friend_code_to_profiles.sql")
            profileData.friend_code = generateFriendCode() // Código temporário para exibição
          }
        }
      } catch (error) {
        console.error("Erro ao gerar friend_code:", error)
        // Usar código temporário para exibição
        profileData.friend_code = generateFriendCode()
      }
    }

    const { data: relationsData } = await supabase
      .from('work_relations')
      .select('*')
      .eq('user_id', user.id)

    setProfile(profileData)
    setWorkRelations(relationsData || [])
    
    if (profileData) {
      setMonthlyGoal(profileData.monthly_goal?.toString() || "")
      setWeeklyLimit(profileData.weekly_hours_limit?.toString() || "")
    }
    
    setLoading(false)
  }

  const handleCopyFriendCode = async () => {
    if (!profile?.friend_code) return
    try {
      await navigator.clipboard.writeText(profile.friend_code)
      setCodeCopied(true)
      setTimeout(() => setCodeCopied(false), 2000)
    } catch (error) {
      toast.error("Não foi possível copiar o código")
    }
  }

  const handleSignOut = async () => {
    if (signingOut) return
    
    setSigningOut(true)
    try {
      const { error } = await supabase.auth.signOut()
      
      // Limpar dados locais independente de erro
      try {
        localStorage.clear()
        sessionStorage.clear()
      } catch (e) {
        // Ignorar erros de limpeza de storage
      }
      
      if (error) {
        console.error("Erro ao fazer logout:", error)
        // Mesmo com erro, forçar redirecionamento
        toast.info("Redirecionando...")
      } else {
        toast.success("Logout realizado com sucesso")
      }
      
      // Forçar redirecionamento completo para garantir limpeza
      setTimeout(() => {
        window.location.href = "/login"
      }, 500)
    } catch (error: any) {
      console.error("Erro ao fazer logout:", error)
      toast.error("Erro ao fazer logout")
      // Mesmo com erro, tentar redirecionar
      setTimeout(() => {
        window.location.href = "/login"
      }, 1000)
    } finally {
      setSigningOut(false)
    }
  }

  const handleUpdateProfile = async (data: any) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: data.fullName,
          role: data.role,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id)

      if (error) throw error

      setProfile({ ...profile, full_name: data.fullName, role: data.role })
      setIsEditProfileOpen(false)
      toast.success("Perfil atualizado!")
    } catch (error) {
      toast.error("Erro ao atualizar perfil")
    }
  }

  const handleSavePreferences = async () => {
    setSavingPrefs(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          monthly_goal: monthlyGoal ? parseFloat(monthlyGoal) : null,
          weekly_hours_limit: weeklyLimit ? parseFloat(weeklyLimit) : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id)

      if (error) throw error
      toast.success("Preferências salvas!")
    } catch (error) {
      toast.error("Erro ao salvar preferências")
    } finally {
      setSavingPrefs(false)
    }
  }

  const handleAddRelation = async (data: any) => {
    try {
      const { data: newRelation, error } = await supabase
        .from('work_relations')
        .insert({
          user_id: profile.id,
          institution_name: data.institutionName,
          contract_type: data.contractType,
          hourly_rate: data.hourlyRate ? parseFloat(data.hourlyRate) : null,
        })
        .select()
        .single()

      if (error) throw error

      setWorkRelations([...workRelations, newRelation])
      setIsAddRelationOpen(false)
      toast.success("Vínculo adicionado!")
    } catch (error) {
      toast.error("Erro ao adicionar vínculo")
    }
  }

  const handleUpdateRelation = async (id: string, data: any) => {
    try {
      const { error } = await supabase
        .from('work_relations')
        .update({
          institution_name: data.institutionName,
          contract_type: data.contractType,
          hourly_rate: data.hourlyRate ? parseFloat(data.hourlyRate) : null,
        })
        .eq('id', id)

      if (error) throw error

      setWorkRelations(workRelations.map(r => r.id === id ? { ...r, ...data } : r))
      setEditingRelationId(null)
      toast.success("Vínculo atualizado!")
    } catch (error) {
      toast.error("Erro ao atualizar vínculo")
    }
  }

  const handleDeleteRelation = async (id: string) => {
    if (!confirm("Tem certeza que deseja remover este vínculo?")) return
    
    const { error } = await supabase.from('work_relations').delete().eq('id', id)
    if (error) {
      toast.error("Erro ao remover vínculo")
      return
    }
    setWorkRelations(workRelations.filter(r => r.id !== id))
    toast.success("Vínculo removido")
  }

  if (loading) return <div className="p-8 text-center flex justify-center"><div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div></div>

  return (
    <div className="space-y-6 pb-24">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Meu Perfil</h1>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleSignOut} 
          disabled={signingOut}
          className="text-destructive hover:bg-destructive/10"
          title="Sair"
        >
          {signingOut ? (
            <div className="w-5 h-5 border-2 border-destructive border-t-transparent rounded-full animate-spin" />
          ) : (
            <LogOut className="w-5 h-5" />
          )}
        </Button>
      </div>

      <Card className="border-none shadow-lg bg-gradient-to-br from-white to-white/50 relative overflow-hidden">
        <div className="absolute top-2 right-2">
          <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-black/5">
                <Edit2 className="w-4 h-4 text-muted-foreground" />
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-3xl">
              <DialogHeader>
                <DialogTitle>Editar Perfil</DialogTitle>
              </DialogHeader>
              <ProfileForm 
                onSubmit={handleUpdateProfile} 
                defaultValues={{ fullName: profile?.full_name, role: profile?.role }} 
              />
            </DialogContent>
          </Dialog>
        </div>
        
        <CardContent className="pt-6 flex flex-col items-center gap-4">
          <Avatar className="w-24 h-24 border-4 border-white shadow-xl" showStatus status="online">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback className="text-2xl bg-gradient-to-br from-primary/20 to-accent/20 text-primary font-bold">
              {profile?.full_name?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="text-center space-y-2 w-full">
            <h2 className="text-xl font-bold">{profile?.full_name || "Usuário"}</h2>
            <p className="text-muted-foreground capitalize">{profile?.role || "Não informado"}</p>
            
            {/* Email - Informação mais importante */}
            {userEmail && (
              <div className="flex items-center justify-center gap-2 mt-3 p-2 bg-primary/5 rounded-xl border border-primary/20">
                <Mail className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">{userEmail}</span>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4 w-full mt-4">
            <div className="bg-primary/5 p-3 rounded-2xl text-center border border-white/40">
              <div className="text-2xl font-bold text-primary">{workRelations.length}</div>
              <div className="text-xs text-muted-foreground">Vínculos</div>
            </div>
            <div className="bg-accent/10 p-3 rounded-2xl text-center border border-white/40">
              <div className="text-2xl font-bold text-secondary">4.8</div>
              <div className="text-xs text-muted-foreground">Avaliação IA</div>
            </div>
          </div>

          <div className="w-full bg-white/60 border border-white/50 rounded-2xl p-4 text-center space-y-3 shadow-sm">
            <div className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
              Meu Código Aurelo
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="font-mono text-2xl tracking-[0.4em] text-primary">
                {profile?.friend_code || "------"}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full"
                onClick={handleCopyFriendCode}
              >
                {codeCopied ? (
                  <Check className="w-4 h-4 text-primary" />
                ) : (
                  <Copy className="w-4 h-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Compartilhe este código para que seus colegas possam te adicionar em Amigos.
            </p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="vinculos" className="w-full">
        <TabsList className="w-full bg-white/50 p-1 rounded-2xl">
          <TabsTrigger value="vinculos" className="flex-1 rounded-xl">Meus Vínculos</TabsTrigger>
          <TabsTrigger value="prefs" className="flex-1 rounded-xl">Preferências</TabsTrigger>
        </TabsList>
        
        <TabsContent value="vinculos" className="space-y-4 mt-4">
          {workRelations.map((relation) => (
            <Card key={relation.id} className="border border-white/40 shadow-sm bg-white/60 backdrop-blur-sm">
              <CardContent className="p-4 flex justify-between items-center">
                <div className="space-y-1 flex-1">
                  <div className="font-semibold flex items-center gap-2">
                    {relation.institution_name}
                    <Badge variant="secondary" className="text-[10px] h-5">{relation.contract_type}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {relation.hourly_rate ? `R$ ${relation.hourly_rate}/hora` : 'Valor não definido'}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Dialog open={editingRelationId === relation.id} onOpenChange={(open) => !open && setEditingRelationId(null)}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon-sm" onClick={() => setEditingRelationId(relation.id)}>
                        <Edit2 className="w-4 h-4 text-muted-foreground hover:text-primary" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-3xl">
                      <DialogHeader>
                        <DialogTitle>Editar Vínculo</DialogTitle>
                      </DialogHeader>
                      <WorkRelationForm 
                        onAdd={(data) => handleUpdateRelation(relation.id, data)} 
                        defaultValues={{
                          institutionName: relation.institution_name,
                          contractType: relation.contract_type,
                          hourlyRate: relation.hourly_rate?.toString() || ""
                        }}
                      />
                    </DialogContent>
                  </Dialog>
                  <Button variant="ghost" size="icon-sm" onClick={() => handleDeleteRelation(relation.id)}>
                    <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          
          <Dialog open={isAddRelationOpen} onOpenChange={setIsAddRelationOpen}>
            <DialogTrigger asChild>
              <Button className="w-full rounded-2xl py-6 border-dashed border-2 border-muted-foreground/20 bg-transparent text-muted-foreground hover:bg-muted/10 shadow-none">
                <Plus className="mr-2 h-4 w-4" /> Adicionar Novo Vínculo
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-3xl">
              <DialogHeader>
                <DialogTitle>Adicionar Vínculo</DialogTitle>
              </DialogHeader>
              <WorkRelationForm onAdd={handleAddRelation} />
            </DialogContent>
          </Dialog>
        </TabsContent>
        
        <TabsContent value="prefs">
          <Card className="border-none shadow-lg bg-white/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Configurações de Carreira</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Meta Financeira Mensal (R$)</Label>
                <Input 
                  type="number" 
                  placeholder="Ex: 5000" 
                  value={monthlyGoal}
                  onChange={(e) => setMonthlyGoal(e.target.value)}
                  className="bg-white/50"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Limite de Horas Semanais</Label>
                <Input 
                  type="number" 
                  placeholder="Ex: 44" 
                  value={weeklyLimit}
                  onChange={(e) => setWeeklyLimit(e.target.value)}
                  className="bg-white/50"
                />
              </div>
              <Button className="w-full shadow-lg shadow-primary/20" onClick={handleSavePreferences} disabled={savingPrefs}>
                {savingPrefs ? "Salvando..." : "Salvar Preferências"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
