"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Sparkles, Filter, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import { useShiftSwapsStore } from "@/store/useShiftSwapsStore"
import { SwapCard } from "@/components/features/swaps/swap-card"
import { AnnounceSwapDialog } from "@/components/features/swaps/announce-swap-dialog"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export default function TrocasPage() {
  const [filterType, setFilterType] = useState<string>("all")
  const [checkingOnboarding, setCheckingOnboarding] = useState(true)
  const { swaps, loading, fetchSwaps } = useShiftSwapsStore()
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
      fetchSwaps({ exclude_own: true })
    }

    checkOnboarding()
  }, [])

  const handleRefresh = () => {
    fetchSwaps({ 
      exclude_own: true,
      swap_type: filterType === "all" ? undefined : filterType as any
    })
  }

  const filteredSwaps = swaps.filter(swap => {
    if (filterType === "all") return true
    return swap.swap_type === filterType
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
          <h1 className="text-2xl font-bold">Troca de Plantão</h1>
          <p className="text-muted-foreground text-sm">Encontre oportunidades ou anuncie.</p>
        </div>
      </div>

      <Card className="bg-gradient-to-r from-primary via-primary/90 to-secondary text-white border-none shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Sparkles className="w-24 h-24" />
        </div>
        <CardContent className="p-6 flex justify-between items-center relative z-10">
          <div>
            <h3 className="font-bold text-lg mb-1">Precisa folgar?</h3>
            <p className="text-white/80 text-sm">Anuncie seu plantão para seus amigos.</p>
            <p className="text-white/60 text-xs mt-1">Apenas seus amigos podem ver seus anúncios.</p>
          </div>
          <AnnounceSwapDialog onSuccess={handleRefresh} />
        </CardContent>
      </Card>

      <div className="flex gap-3 items-center">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <Select 
          value={filterType} 
          onValueChange={(value) => {
            setFilterType(value)
            fetchSwaps({ 
              exclude_own: true,
              swap_type: value === "all" ? undefined : value as any
            })
          }}
        >
          <SelectTrigger className="w-[200px] bg-white/50 backdrop-blur-sm">
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="offer">Ofertas</SelectItem>
            <SelectItem value="request">Solicitações</SelectItem>
            <SelectItem value="exchange">Trocas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg px-1">Oportunidades Recentes</h3>
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : filteredSwaps.length > 0 ? (
          filteredSwaps.map((swap, i) => (
            <SwapCard 
              key={swap.id} 
              swap={swap}
              onInterest={handleRefresh}
            />
          ))
        ) : (
          <Card className="p-12 text-center border-dashed bg-transparent border-2">
            <p className="text-muted-foreground">
              {filterType === "all" 
                ? "Nenhuma oportunidade de troca encontrada no momento." 
                : `Nenhuma ${filterType === "offer" ? "oferta" : filterType === "request" ? "solicitação" : "troca"} encontrada.`}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Seja o primeiro a anunciar!
            </p>
          </Card>
        )}
      </div>
    </div>
  )
}
