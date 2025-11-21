"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { ProfileForm } from "@/components/features/onboarding/profile-form"
import { WorkRelationForm } from "@/components/features/onboarding/work-relation-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Check, Trash2, ArrowLeft } from "lucide-react"
import { AureloLogo } from "@/components/ui/logo/aurelo-logo"
import { motion, AnimatePresence } from "framer-motion"

type Step = 1 | 2

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>(1)
  const [profileData, setProfileData] = useState<any>(null)
  const [workRelations, setWorkRelations] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Verificar se já tem perfil e vínculos
    const checkExistingData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      const { data: relations } = await supabase
        .from('work_relations')
        .select('*')
        .eq('user_id', user.id)

      if (profile && relations && relations.length > 0) {
        // Já completou onboarding, redirecionar para home
        router.push("/")
        return
      }

      // Se tem perfil mas não tem vínculos, ir para passo 2
      if (profile && (!relations || relations.length === 0)) {
        setProfileData({
          fullName: profile.full_name,
          role: profile.role,
        })
        setStep(2)
      }
    }

    checkExistingData()
  }, [])

  const handleProfileSubmit = (data: any) => {
    setProfileData(data)
    setStep(2)
  }

  const handleAddWorkRelation = (data: any) => {
    setWorkRelations([...workRelations, data])
    toast.success("Vínculo adicionado!", { icon: "🏥" })
  }

  const handleRemoveWorkRelation = (index: number) => {
    setWorkRelations(workRelations.filter((_, i) => i !== index))
  }

  const handleFinish = async () => {
    if (workRelations.length === 0) {
      toast.error("Adicione pelo menos um vínculo de trabalho antes de concluir")
      return
    }

    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error("Usuário não autenticado")
        return
      }

      // 1. Update Profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: profileData.fullName,
          role: profileData.role,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (profileError) throw profileError

      // 2. Insert Work Relations
      const relationsToInsert = workRelations.map(rel => ({
        user_id: user.id,
        institution_name: rel.institutionName,
        contract_type: rel.contractType,
        hourly_rate: rel.hourlyRate ? parseFloat(rel.hourlyRate) : null,
      }))

      if (relationsToInsert.length > 0) {
        const { error: relationsError } = await supabase
          .from('work_relations')
          .insert(relationsToInsert)
        
        if (relationsError) throw relationsError
      }

      toast.success("Configuração inicial concluída!", { icon: "🎉" })
      router.push("/")
      router.refresh()
    } catch (error: any) {
      toast.error("Erro ao finalizar onboarding: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container max-w-md mx-auto py-10 min-h-screen flex flex-col justify-center bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <motion.div 
        className="mb-8 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <motion.div 
          className="inline-flex p-4 rounded-3xl bg-white/60 backdrop-blur-xl shadow-xl shadow-primary/10 border border-white/40 mb-4"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
        >
          <AureloLogo className="w-10 h-10" />
        </motion.div>
        <div className="flex justify-center gap-2 mb-2">
          <motion.div 
            className={`h-2 w-10 rounded-full transition-all duration-500 ${step === 1 ? 'bg-primary shadow-lg shadow-primary/30' : 'bg-muted'}`}
            animate={step === 1 ? { scale: 1.1 } : { scale: 1 }}
          />
          <motion.div 
            className={`h-2 w-10 rounded-full transition-all duration-500 ${step === 2 ? 'bg-primary shadow-lg shadow-primary/30' : 'bg-muted'}`}
            animate={step === 2 ? { scale: 1.1 } : { scale: 1 }}
          />
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20, filter: "blur(5px)" }}
          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, x: -20, filter: "blur(5px)" }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          <Card className="border-none shadow-xl bg-white/70 backdrop-blur-xl border border-white/40">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl text-center font-bold">
                {step === 1 ? "Vamos nos conhecer" : "Onde você trabalha?"}
              </CardTitle>
              <CardDescription className="text-center text-base">
                {step === 1 
                  ? "Precisamos de alguns dados para personalizar sua experiência." 
                  : "Adicione pelo menos um vínculo de trabalho para organizar a escala."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {step === 1 && (
                <ProfileForm onSubmit={handleProfileSubmit} defaultValues={profileData} />
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <WorkRelationForm onAdd={handleAddWorkRelation} />

                  {workRelations.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-muted-foreground pl-1">Vínculos Adicionados:</h3>
                      <div className="space-y-2">
                        {workRelations.map((relation, index) => (
                          <motion.div 
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center justify-between p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/40 shadow-sm hover:shadow-md transition-shadow"
                          >
                            <div>
                              <p className="font-semibold text-foreground">{relation.institutionName}</p>
                              <p className="text-xs text-muted-foreground font-medium mt-0.5">
                                <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded-lg text-[10px] uppercase tracking-wider mr-2">
                                  {relation.contractType}
                                </span>
                                {relation.hourlyRate && `R$ ${relation.hourlyRate}/h`}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => handleRemoveWorkRelation(index)}
                              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {workRelations.length === 0 && (
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200 text-center">
                        ⚠️ Você precisa adicionar pelo menos um vínculo de trabalho para continuar.
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <Button variant="outline" className="w-full" onClick={() => setStep(1)}>
                      <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                    </Button>
                    <Button 
                      className="w-full shadow-lg shadow-primary/20" 
                      onClick={handleFinish} 
                      disabled={loading || workRelations.length === 0}
                    >
                      {loading ? "Finalizando..." : "Concluir"}
                      {!loading && <Check className="w-4 h-4 ml-2" />}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
