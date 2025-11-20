"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { AureloLogo } from "@/components/ui/logo/aurelo-logo"
import { motion } from "framer-motion"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast.error("Preencha todos os campos")
      return
    }
    
    setLoading(true)

    try {
      console.log("Attempting login...")
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Login error:", error)
        toast.error(error.message)
        setLoading(false)
        return
      }

      console.log("Login successful:", data)
      toast.success("Login realizado com sucesso!")
      router.push("/")
      router.refresh()
    } catch (error: any) {
      console.error("Login exception:", error)
      toast.error("Erro ao fazer login: " + (error.message || "Erro desconhecido"))
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async () => {
    if (!email || !password) {
      toast.error("Preencha todos os campos")
      return
    }
    
    setLoading(true)
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        toast.error(error.message)
        return
      }

      toast.success("Conta criada! Verifique seu email.")
    } catch (error: any) {
      toast.error("Erro ao criar conta: " + (error.message || "Erro desconhecido"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[85vh] flex-col items-center justify-center p-4 bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <motion.div 
        className="mb-8 flex flex-col items-center gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="p-4 rounded-3xl bg-white/60 shadow-xl shadow-primary/10 backdrop-blur-xl border border-white/60"
          initial={{ scale: 0.9, rotate: -5 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
        >
          <AureloLogo className="w-16 h-16" />
        </motion.div>
        <motion.h1 
          className="text-3xl font-bold tracking-tight text-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Aurelo
        </motion.h1>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="w-full max-w-sm border-white/40 bg-white/70 backdrop-blur-xl shadow-xl shadow-primary/5">
          <CardHeader className="space-y-1 text-center pb-8">
            <CardTitle className="text-xl font-semibold">Bem-vindo de volta</CardTitle>
            <CardDescription>Entre para organizar sua vida profissional</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-5">
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Label htmlFor="email" className="pl-1 text-xs uppercase tracking-wider text-muted-foreground font-semibold">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white/50"
                />
              </motion.div>
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Label htmlFor="password" className="pl-1 text-xs uppercase tracking-wider text-muted-foreground font-semibold">Senha</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white/50"
                />
              </motion.div>
              
              <motion.div 
                className="pt-4 space-y-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Button type="submit" className="w-full shadow-lg shadow-primary/20" size="lg" disabled={loading}>
                  {loading ? "Entrando..." : "Entrar"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-muted-foreground hover:text-foreground"
                  onClick={handleSignUp}
                  disabled={loading}
                >
                  Criar conta
                </Button>
              </motion.div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
