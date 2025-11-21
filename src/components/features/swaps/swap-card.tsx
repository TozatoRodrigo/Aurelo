"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Clock, MapPin, ArrowRight, Building2, MessageSquare } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { motion } from "framer-motion"
import type { ShiftSwap } from "@/app/actions/shift-swaps"
import { createSwapInterest } from "@/app/actions/shift-swaps"
import { toast } from "sonner"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface SwapCardProps {
  swap: ShiftSwap
  onInterest?: () => void
}

export function SwapCard({ swap, onInterest }: SwapCardProps) {
  const [showInterestDialog, setShowInterestDialog] = useState(false)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const handleInterest = async () => {
    setLoading(true)
    try {
      const result = await createSwapInterest(swap.id, message)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Interesse enviado! O anunciante será notificado.")
        setShowInterestDialog(false)
        setMessage("")
        onInterest?.()
      }
    } catch (error: any) {
      toast.error("Erro ao enviar interesse: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  const getSwapTypeLabel = (type: string) => {
    switch (type) {
      case 'offer': return 'Oferta'
      case 'request': return 'Solicitação'
      case 'exchange': return 'Troca'
      default: return type
    }
  }

  const getSwapTypeColor = (type: string) => {
    switch (type) {
      case 'offer': return 'bg-green-500/10 text-green-700 dark:text-green-400'
      case 'request': return 'bg-blue-500/10 text-blue-700 dark:text-blue-400'
      case 'exchange': return 'bg-purple-500/10 text-purple-700 dark:text-purple-400'
      default: return 'bg-muted'
    }
  }

  // Determinar informações a exibir baseado no tipo
  const getDisplayInfo = () => {
    if (swap.swap_type === 'offer') {
      // Oferta: mostra o plantão que está sendo oferecido
      return {
        title: "Plantão Disponível",
        date: swap.shift ? format(new Date(swap.shift.start_time), "dd/MM/yyyy", { locale: ptBR }) : "Data não especificada",
        time: swap.shift 
          ? `${format(new Date(swap.shift.start_time), "HH:mm", { locale: ptBR })} - ${format(new Date(swap.shift.end_time), "HH:mm", { locale: ptBR })}`
          : "Horário não especificado",
        institution: swap.shift?.institution_name || "Instituição não especificada",
      }
    } else if (swap.swap_type === 'request') {
      // Solicitação: mostra a data que precisa
      return {
        title: "Precisa de Plantão",
        date: swap.desired_date ? format(new Date(swap.desired_date), "dd/MM/yyyy", { locale: ptBR }) : "Data não especificada",
        time: "Qualquer horário",
        institution: swap.desired_institution?.institution_name || "Qualquer instituição",
      }
    } else {
      // Troca: mostra o plantão que tem e a data desejada
      return {
        title: "Quer Trocar",
        date: swap.shift 
          ? `${format(new Date(swap.shift.start_time), "dd/MM", { locale: ptBR })} ↔ ${swap.desired_date ? format(new Date(swap.desired_date), "dd/MM", { locale: ptBR }) : "??"}`
          : swap.desired_date 
          ? format(new Date(swap.desired_date), "dd/MM/yyyy", { locale: ptBR })
          : "Data não especificada",
        time: swap.shift 
          ? `${format(new Date(swap.shift.start_time), "HH:mm", { locale: ptBR })} - ${format(new Date(swap.shift.end_time), "HH:mm", { locale: ptBR })}`
          : "Horário não especificado",
        institution: swap.shift?.institution_name || swap.desired_institution?.institution_name || "Instituição não especificada",
      }
    }
  }

  const displayInfo = getDisplayInfo()

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="overflow-hidden border-white/40 shadow-sm bg-white/60 backdrop-blur-sm hover:shadow-md transition-shadow">
        <CardContent className="p-0">
          <div className="p-4 flex gap-4 items-start">
            <Avatar className="border-2 border-primary/20 shrink-0">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {swap.user?.full_name?.slice(0, 2).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-semibold text-base">{swap.user?.full_name || "Usuário"}</h4>
                  <p className="text-xs text-muted-foreground font-medium">{swap.user?.role || ""}</p>
                </div>
                <Badge 
                  className={`text-[10px] h-5 ${getSwapTypeColor(swap.swap_type)}`}
                >
                  {getSwapTypeLabel(swap.swap_type)}
                </Badge>
              </div>
              
              <div className="mt-3 p-3 bg-muted/20 rounded-2xl space-y-2 border border-white/40">
                <div className="text-xs text-muted-foreground mb-1 font-semibold uppercase tracking-wider">
                  {displayInfo.title}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-primary shrink-0" />
                  <span className="font-medium">{displayInfo.date} • {displayInfo.time}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 shrink-0" />
                  <span className="truncate">{displayInfo.institution}</span>
                </div>
                {swap.description && (
                  <div className="flex items-start gap-2 text-sm text-muted-foreground mt-2">
                    <MessageSquare className="w-4 h-4 shrink-0 mt-0.5" />
                    <span className="text-xs">{swap.description}</span>
                  </div>
                )}
                {(swap.interests_count || 0) > 0 && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {swap.interests_count || 0} interesse{(swap.interests_count || 0) > 1 ? 's' : ''}
                  </div>
                )}
              </div>

              <Dialog open={showInterestDialog} onOpenChange={setShowInterestDialog}>
                <DialogTrigger asChild>
                  <Button className="w-full mt-4 shadow-sm" size="sm">
                    Tenho Interesse <ArrowRight className="w-3 h-3 ml-2" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-3xl">
                  <DialogHeader>
                    <DialogTitle>Demonstrar Interesse</DialogTitle>
                    <DialogDescription>
                      Envie uma mensagem para {swap.user?.full_name || "o anunciante"}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-2">
                    <div className="space-y-2">
                      <Label>Mensagem (opcional)</Label>
                      <Textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={
                          swap.swap_type === 'offer'
                            ? "Ex: Posso trabalhar neste horário..."
                            : swap.swap_type === 'request'
                            ? "Ex: Tenho disponibilidade neste dia..."
                            : "Ex: Posso fazer a troca..."
                        }
                        className="min-h-24"
                      />
                    </div>
                    <Button 
                      className="w-full" 
                      onClick={handleInterest}
                      disabled={loading}
                    >
                      {loading ? "Enviando..." : "Enviar Interesse"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

