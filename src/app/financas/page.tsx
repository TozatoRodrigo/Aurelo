"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useShiftsStore } from "@/store/useShiftsStore"
import { startOfMonth, endOfMonth, format, startOfYear, eachMonthOfInterval } from "date-fns"
import { ptBR } from "date-fns/locale"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from "recharts"
import { Loader2, Download, TrendingUp, Calendar } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

const COLORS = ['#3A7BF8', '#8FE6FF', '#1C335D', '#F7FF80', '#FF8F8F'];

export default function FinancasPage() {
  const { shifts, fetchShifts, loading } = useShiftsStore()
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString())
  const [checkingOnboarding, setCheckingOnboarding] = useState(true)
  const currentDate = useMemo(() => new Date(selectedMonth), [selectedMonth])
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const checkOnboarding = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }

      const { data: relations } = await supabase
        .from('work_relations')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)

      if (!relations || relations.length === 0) {
        toast.info("Complete seu cadastro adicionando seus vínculos de trabalho")
        router.push("/onboarding")
        return
      }

      setCheckingOnboarding(false)
    }

    checkOnboarding()
  }, [])

  useEffect(() => {
    if (!checkingOnboarding) {
      fetchShifts(startOfMonth(currentDate), endOfMonth(currentDate))
    }
  }, [currentDate, fetchShifts, checkingOnboarding])

  const financialData = useMemo(() => {
    const total = shifts.reduce((acc, shift) => acc + (shift.estimated_value || 0), 0)
    
    const byInstitution: Record<string, number> = {}
    shifts.forEach(shift => {
      const name = shift.institution_name || "Sem Vínculo"
      byInstitution[name] = (byInstitution[name] || 0) + (shift.estimated_value || 0)
    })

    const chartData = Object.entries(byInstitution).map(([name, value]) => ({
      name,
      value
    }))

    return { total, chartData }
  }, [shifts])

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  const handleExportPDF = async () => {
    try {
      const { exportFinancialReportPDF } = await import("@/app/actions/export-pdf")
      const result = await exportFinancialReportPDF(currentDate)
      
      if (result.error) {
        toast.error("Erro ao gerar PDF: " + result.error)
        return
      }

      if (result.data) {
        // Convert base64 to blob and download
        const byteCharacters = atob(result.data.base64)
        const byteNumbers = new Array(byteCharacters.length)
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i)
        }
        const byteArray = new Uint8Array(byteNumbers)
        const blob = new Blob([byteArray], { type: 'application/pdf' })
        
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = result.data.filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        
        toast.success("PDF gerado com sucesso!")
      }
    } catch (error: any) {
      console.error("Export error:", error)
      toast.error("Erro ao exportar PDF: " + (error.message || "Erro desconhecido"))
    }
  }

  const months = eachMonthOfInterval({
    start: startOfYear(new Date()),
    end: new Date()
  })

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
    <div className="space-y-6 pb-24">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Finanças</h1>
          <p className="text-muted-foreground text-sm">Acompanhe seus ganhos e receitas</p>
        </div>
        <Button variant="outline" size="icon" onClick={handleExportPDF} className="shadow-sm">
          <Download className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex gap-2 items-center bg-card/50 p-2 rounded-xl border border-white/40">
        <Calendar className="w-4 h-4 text-muted-foreground ml-2" />
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="border-none bg-transparent shadow-none focus:ring-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {months.map((date) => (
              <SelectItem key={date.toISOString()} value={date.toISOString()}>
                {format(date, "MMMM 'de' yyyy", { locale: ptBR })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
         <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary" /></div>
      ) : (
        <>
          <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-none shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <TrendingUp className="w-24 h-24" />
            </div>
            <CardHeader className="pb-2 relative z-10">
              <CardTitle className="text-sm font-medium opacity-90">Ganhos em {format(currentDate, "MMMM", { locale: ptBR })}</CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-bold tracking-tight">{formatCurrency(financialData.total)}</div>
              <p className="text-sm opacity-80 mt-1 flex items-center gap-1">
                <span className="bg-white/20 px-1.5 rounded text-xs">{shifts.length} plantões</span>
                confirmados neste mês
              </p>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-none shadow-lg bg-white/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-base">Por Instituição (Barra)</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={financialData.chartData}>
                    <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} interval={0} />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `R$${val}`} />
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value), 'Valor']}
                      cursor={{ fill: 'var(--muted)' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {financialData.chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-white/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-base">Distribuição (Pizza)</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={financialData.chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {financialData.chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-3">
            <h2 className="font-semibold text-lg px-1">Extrato Detalhado</h2>
            
            {/* Resumo por Instituição */}
            {financialData.chartData.length > 0 && (
              <div className="space-y-2 mb-6">
                {financialData.chartData.map((item, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex justify-between items-center p-4 bg-white/60 backdrop-blur-sm border rounded-2xl shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="font-medium">{item.name}</span>
                    </div>
                    <span className="font-bold text-foreground">{formatCurrency(item.value)}</span>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Lista de Plantões */}
            <div>
              <h3 className="font-medium text-sm text-muted-foreground mb-3 px-1">Histórico de Plantões</h3>
              {shifts.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {shifts
                    .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())
                    .map((shift, i) => {
                      const startDate = new Date(shift.start_time)
                      return (
                        <motion.div
                          key={shift.id}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.02 }}
                          className="flex justify-between items-center p-3 bg-white/40 backdrop-blur-sm border border-white/50 rounded-xl hover:bg-white/60 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-sm">{shift.institution_name || "Sem vínculo"}</span>
                              <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">
                                {format(startDate, "dd/MM", { locale: ptBR })}
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {format(startDate, "HH:mm", { locale: ptBR })} - {format(new Date(shift.end_time), "HH:mm", { locale: ptBR })}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-sm text-green-600 dark:text-green-400">
                              {shift.estimated_value ? formatCurrency(shift.estimated_value) : "-"}
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-2xl border-dashed border">
                  Nenhum plantão registrado para este período.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
