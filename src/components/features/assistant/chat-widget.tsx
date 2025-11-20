"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MessageCircle, X, Send, Loader2, Sparkles, AlertCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { chatWithAI } from "@/app/actions/chat"
import { toast } from "sonner"

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: 'Olá! Sou o assistente IA do Aurelo. Como posso ajudar com sua escala hoje?' }
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const hasLoadedRef = useRef(false)
  const isSavingRef = useRef(false)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isOpen])

  // Load messages from localStorage on mount ONLY ONCE
  useEffect(() => {
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true
      try {
        const savedMessages = localStorage.getItem('aurelo-chat-messages')
        if (savedMessages) {
          const parsed = JSON.parse(savedMessages)
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed)
          }
        }
      } catch (e) {
        console.error('Error loading chat history:', e)
      }
    }
  }, []) // Array vazio - executa apenas uma vez

  // Save messages to localStorage (evitando loops)
  useEffect(() => {
    // Evitar salvar durante o carregamento inicial
    if (hasLoadedRef.current && !isSavingRef.current && messages.length > 1) {
      isSavingRef.current = true
      requestAnimationFrame(() => {
        try {
          localStorage.setItem('aurelo-chat-messages', JSON.stringify(messages))
        } catch (e) {
          console.error('Error saving chat history:', e)
        } finally {
          isSavingRef.current = false
        }
      })
    }
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input.trim() }
    setMessages(prev => [...prev, userMsg])
    setInput("")
    setLoading(true)

    try {
      const result = await chatWithAI(userMsg.content)
      
      if (result.error) {
        setMessages(prev => [...prev, { 
          id: (Date.now() + 1).toString(), 
          role: 'assistant', 
          content: `Desculpe, ocorreu um erro: ${result.error}` 
        }])
        toast.error(result.error)
      } else if (result.response) {
        setMessages(prev => [...prev, { 
          id: (Date.now() + 1).toString(), 
          role: 'assistant', 
          content: result.response 
        }])
      } else {
        setMessages(prev => [...prev, { 
          id: (Date.now() + 1).toString(), 
          role: 'assistant', 
          content: 'Desculpe, não consegui processar sua mensagem. Tente novamente.' 
        }])
      }
    } catch (error: any) {
      console.error('Chat error:', error)
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: 'Erro ao conectar com o assistente. Verifique sua conexão e tente novamente.' 
      }])
      toast.error("Erro ao enviar mensagem")
    } finally {
      setLoading(false)
    }
  }

  const handleClearHistory = () => {
    setMessages([{ id: '1', role: 'assistant', content: 'Olá! Sou o assistente IA do Aurelo. Como posso ajudar com sua escala hoje?' }])
    localStorage.removeItem('aurelo-chat-messages')
    toast.info("Histórico limpo")
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-20 right-4 w-[90vw] max-w-[350px] z-50 md:right-8 md:bottom-24"
          >
            <Card className="border-none shadow-2xl bg-white/90 backdrop-blur-xl overflow-hidden">
              <CardHeader className="bg-primary p-4 flex flex-row justify-between items-center">
                <div className="flex items-center gap-2 text-white">
                  <Sparkles className="w-5 h-5" />
                  <CardTitle className="text-base">Aurelo AI</CardTitle>
                </div>
                <div className="flex gap-1">
                  {messages.length > 1 && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-white hover:bg-white/20 h-8 w-8" 
                      onClick={handleClearHistory}
                      title="Limpar histórico"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 h-8 w-8" onClick={() => setIsOpen(false)}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0 h-[400px] flex flex-col">
                <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl p-3 text-sm whitespace-pre-wrap ${
                          msg.role === 'user'
                            ? 'bg-primary text-primary-foreground rounded-br-none'
                            : 'bg-muted/50 text-foreground rounded-bl-none'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </motion.div>
                  ))}
                  {loading && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="bg-muted/50 rounded-2xl p-3 rounded-bl-none flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Pensando...</span>
                      </div>
                    </motion.div>
                  )}
                </div>
                <form onSubmit={handleSend} className="p-3 border-t bg-white/50 flex gap-2">
                  <Input 
                    value={input} 
                    onChange={e => setInput(e.target.value)} 
                    placeholder="Pergunte sobre sua escala..." 
                    className="flex-1 bg-white"
                    disabled={loading}
                  />
                  <Button type="submit" size="icon" disabled={loading || !input.trim()} className="shrink-0">
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 right-4 md:right-8 md:bottom-8 z-40 h-14 w-14 rounded-full bg-primary text-white shadow-xl shadow-primary/30 flex items-center justify-center hover:bg-primary/90 transition-all backdrop-blur-sm"
        whileHover={{ scale: 1.1, boxShadow: "0 10px 30px rgba(58, 123, 248, 0.4)" }}
        whileTap={{ scale: 0.9 }}
        animate={isOpen ? {} : {
          scale: [1, 1.05, 1],
        }}
        transition={{
          scale: {
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }
        }}
      >
        <MessageCircle className="w-7 h-7" strokeWidth={2} />
      </motion.button>
    </>
  )
}
