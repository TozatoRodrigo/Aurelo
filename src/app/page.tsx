"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Clock, TrendingUp, Zap, Calendar, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import { AddShiftDialog } from "@/components/features/shifts/add-shift-dialog"
import { ShiftCard } from "@/components/features/shifts/shift-card"
import { useShiftsStore } from "@/store/useShiftsStore"
import { startOfMonth, endOfMonth, differenceInHours, format, isToday, isTomorrow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { toast } from "sonner"

export default function Home() {
  const { shifts, fetchShifts } = useShiftsStore()
  const [checkingOnboarding, setCheckingOnboarding] = useState(true)
  const [userName, setUserName] = useState<string>("")
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkOnboarding = async () => {
      // Aguardar um pouco para garantir que a sessão foi estabelecida após login
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Tentar obter a sessão várias vezes se necessário
      let user = null
      let attempts = 0
      const maxAttempts = 5
      
      while (!user && attempts < maxAttempts) {
        // Primeiro verificar a sessão diretamente
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          // Se tem sessão, tentar obter o usuário
          const { data: { user: currentUser }, error } = await supabase.auth.getUser()
          if (currentUser && !error) {
            user = currentUser
            break
          }
        }
        attempts++
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 300))
        }
      }
      
      if (!user) {
        // Última tentativa: verificar sessão e usuário novamente
        const { data: { session: finalSession } } = await supabase.auth.getSession()
        if (!finalSession) {
          console.log("No session found, redirecting to login")
          router.push("/login")
          return
        }
        const { data: { user: finalUser } } = await supabase.auth.getUser()
        if (!finalUser) {
          console.log("No user found, redirecting to login")
          router.push("/login")
          return
        }
        user = finalUser
      }

      // Buscar nome do usuário
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()

      if (profile?.full_name) {
        // Pegar apenas o primeiro nome
        const firstName = profile.full_name.split(' ')[0]
        setUserName(firstName)
      } else {
        setUserName("Usuário")
      }

      // Verificar se tem vínculos de trabalho
      const { data: relations } = await supabase
        .from('work_relations')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)

      if (!relations || relations.length === 0) {
        // Não tem vínculos, redirecionar para onboarding
        toast.info("Complete seu cadastro adicionando seus vínculos de trabalho")
        router.push("/onboarding")
        return
      }

      setCheckingOnboarding(false)
      
      // Carregar plantões
      const now = new Date()
      fetchShifts(startOfMonth(now), endOfMonth(now))
    }

    checkOnboarding()
  }, [router, supabase, fetchShifts])

  const stats = useMemo(() => {
    const totalHours = shifts.reduce((acc, shift) => {
      const start = new Date(shift.start_time)
      const end = new Date(shift.end_time)
      return acc + Math.abs(differenceInHours(end, start))
    }, 0)

    const burnoutRisk = totalHours > 160 ? "Alto" : totalHours > 120 ? "Médio" : "Baixo"
    const estimatedEarnings = shifts.reduce((acc, shift) => acc + (shift.estimated_value || 0), 0)

    // Próximo plantão real
    const nextShift = shifts
      .filter(s => new Date(s.start_time) > new Date())
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())[0]

    return { totalHours, burnoutRisk, estimatedEarnings, nextShift }
  }, [shifts])

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  const formatNextShiftDate = (date: Date) => {
    if (isToday(date)) return "Hoje"
    if (isTomorrow(date)) return "Amanhã"
    return format(date, "d 'de' MMMM", { locale: ptBR })
  }

  const formatNextShiftTime = (date: Date) => {
    return format(date, "HH:mm", { locale: ptBR })
  }

  const getNextShiftHours = (start: Date, end: Date) => {
    return Math.abs(differenceInHours(end, start))
  }

  if (checkingOnboarding) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Verificando configuração...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Olá, <span className="text-primary">{userName || "Usuário"}!</span>
          </h1>
          <p className="text-muted-foreground mt-1">Sua rotina, organizada.</p>
        </div>
        
        <AddShiftDialog />
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Próximo Plantão (Com lógica real) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/10 h-full">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-primary">Próximo Plantão</CardTitle>
              <Clock className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              {stats.nextShift ? (
                <>
                  <div className="text-2xl font-bold text-foreground">
                    {formatNextShiftDate(new Date(stats.nextShift.start_time))}, {formatNextShiftTime(new Date(stats.nextShift.start_time))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.nextShift.institution_name || "Plantão"} ({getNextShiftHours(new Date(stats.nextShift.start_time), new Date(stats.nextShift.end_time))}h)
                  </p>
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold text-foreground">Nenhum agendado</div>
                  <p className="text-xs text-muted-foreground mt-1">Adicione um plantão para começar</p>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Ganhos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/10 h-full">
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-secondary">Ganhos Estimados</CardTitle>
              <TrendingUp className="w-4 h-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{formatCurrency(stats.estimatedEarnings)}</div>
              <p className="text-xs text-muted-foreground mt-1">Baseado na escala atual</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Burnout Widget */}
        <motion.div
          className="md:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-none bg-gradient-to-r from-white/80 to-white/40 backdrop-blur-sm shadow-lg shadow-black/5 border border-white/60">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${
                  stats.burnoutRisk === 'Alto' 
                    ? 'bg-destructive/10 text-destructive' 
                    : stats.burnoutRisk === 'Médio'
                    ? 'bg-lemon-pulse/20 text-[#B8A000] dark:text-lemon-pulse'
                    : 'bg-accent/20 text-accent'
                }`}>
                  <Zap className="w-6 h-6 fill-current" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Carga Mensal</h3>
                  <div className="text-2xl font-bold flex items-center gap-2 mt-1 text-foreground">
                    {stats.totalHours}h 
                    <span className="text-sm font-normal text-muted-foreground">/ 160h</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Risco de Burnout</div>
                <div className={`text-xl font-bold ${
                  stats.burnoutRisk === 'Alto' 
                    ? 'text-destructive' 
                    : stats.burnoutRisk === 'Médio'
                    ? 'text-[#B8A000] dark:text-lemon-pulse'
                    : 'text-accent'
                }`}>{stats.burnoutRisk}</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <section>
        <h2 className="text-xl font-semibold mb-4 px-1">Escala da Semana</h2>
        {shifts.length > 0 ? (
           <div className="space-y-3">
             {shifts
               .filter(s => new Date(s.start_time) >= new Date())
               .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
               .slice(0, 3)
               .map((shift, i) => (
               <motion.div
                 key={shift.id}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: i * 0.1 }}
               >
                 <ShiftCard shift={shift} />
               </motion.div>
             ))}
             <Button 
               variant="ghost" 
               className="w-full text-primary text-sm hover:bg-primary/10" 
               onClick={() => window.location.href='/escala'}
             >
               Ver todos os plantões
             </Button>
           </div>
        ) : (
          <Card className="p-8 text-center text-muted-foreground border-dashed bg-transparent border-2">
            <p>Nenhum plantão cadastrado.</p>
            <div className="mt-4">
              <AddShiftDialog />
            </div>
          </Card>
        )}
      </section>
    </div>
  )
}
