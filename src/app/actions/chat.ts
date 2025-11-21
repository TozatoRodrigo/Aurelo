"use server"

import OpenAI from "openai"
import { createClient } from "@/lib/supabase/server"
import { startOfMonth, endOfMonth, differenceInHours } from "date-fns"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "mock-key",
})

interface ChatContext {
  shifts: any[]
  workRelations: any[]
  profile: any
  stats: {
    totalHours: number
    estimatedEarnings: number
    burnoutRisk: string
    nextShift?: any
  }
}

async function buildUserContext(): Promise<ChatContext> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("Usuário não autenticado")
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch work relations
  const { data: workRelations } = await supabase
    .from('work_relations')
    .select('*')
    .eq('user_id', user.id)

  // Fetch current month shifts
  const now = new Date()
  const start = startOfMonth(now)
  const end = endOfMonth(now)

  const { data: shiftsData } = await supabase
    .from('shifts')
    .select(`
      *,
      work_relations (
        institution_name,
        color
      )
    `)
    .eq('user_id', user.id) // FILTRO EXPLÍCITO POR USER_ID
    .gte('start_time', start.toISOString())
    .lte('end_time', end.toISOString())
    .order('start_time', { ascending: true })

  const shifts = (shiftsData || []).map((shift: any) => ({
    ...shift,
    institution_name: shift.work_relations?.institution_name,
    color: shift.work_relations?.color,
  }))

  // Calculate stats
  const totalHours = shifts.reduce((acc, shift) => {
    const start = new Date(shift.start_time)
    const end = new Date(shift.end_time)
    return acc + Math.abs(differenceInHours(end, start))
  }, 0)

  const burnoutRisk = totalHours > 160 ? "Alto" : totalHours > 120 ? "Médio" : "Baixo"
  const estimatedEarnings = shifts.reduce((acc, shift) => acc + (shift.estimated_value || 0), 0)

  const nextShift = shifts
    .filter(s => new Date(s.start_time) > new Date())
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())[0]

  return {
    shifts,
    workRelations: workRelations || [],
    profile: profile || {},
    stats: {
      totalHours,
      estimatedEarnings,
      burnoutRisk,
      nextShift,
    },
  }
}

function buildSystemPrompt(context: ChatContext): string {
  const { shifts, workRelations, profile, stats } = context

  return `Você é o Aurelo AI, um assistente inteligente especializado em ajudar profissionais da saúde a gerenciar suas escalas de trabalho, carreira e bem-estar.

CONTEXTO DO USUÁRIO:
- Nome: ${profile.full_name || 'Não informado'}
- Função: ${profile.role || 'Não informada'}
- Meta financeira mensal: ${profile.monthly_goal ? `R$ ${profile.monthly_goal.toFixed(2)}` : 'Não definida'}
- Limite de horas semanais: ${profile.weekly_hours_limit || 'Não definido'}h

ESTATÍSTICAS ATUAIS:
- Total de horas trabalhadas este mês: ${stats.totalHours.toFixed(1)}h
- Ganhos estimados: R$ ${stats.estimatedEarnings.toFixed(2)}
- Risco de burnout: ${stats.burnoutRisk}
- Próximo plantão: ${stats.nextShift ? new Date(stats.nextShift.start_time).toLocaleDateString('pt-BR') + ' às ' + new Date(stats.nextShift.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : 'Nenhum agendado'}

VÍNCULOS DE TRABALHO (${workRelations.length}):
${workRelations.map((rel, i) => `${i + 1}. ${rel.institution_name} (${rel.contract_type})${rel.hourly_rate ? ` - R$ ${rel.hourly_rate}/h` : ''}`).join('\n')}

PLANTÕES DO MÊS (${shifts.length}):
${shifts.length > 0 ? shifts.slice(0, 10).map((shift, i) => {
  const date = new Date(shift.start_time)
  return `${i + 1}. ${date.toLocaleDateString('pt-BR')} - ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} (${shift.institution_name || 'Sem vínculo'})${shift.estimated_value ? ` - R$ ${shift.estimated_value.toFixed(2)}` : ''}`
}).join('\n') : 'Nenhum plantão cadastrado'}

INSTRUÇÕES:
- Seja amigável, profissional e empático
- Use os dados reais do usuário para responder perguntas
- Forneça insights e sugestões práticas quando relevante
- Se não souber algo específico, seja honesto mas ofereça ajuda alternativa
- Responda em português brasileiro
- Mantenha respostas concisas mas informativas
- Se o usuário perguntar sobre ganhos, use os valores estimados dos plantões
- Se perguntar sobre carga de trabalho, mencione o risco de burnout atual
- Se perguntar sobre próximos plantões, use a informação do próximo plantão agendado`
}

export async function chatWithAI(userMessage: string): Promise<{ response: string; error?: string }> {
  // Mock fallback if no API key
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "mock-key") {
    return {
      response: "Desculpe, o serviço de IA não está configurado. Configure a OPENAI_API_KEY para usar o chat inteligente.",
    }
  }

  try {
    // Build context
    const context = await buildUserContext()
    const systemPrompt = buildSystemPrompt(context)

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Using mini for cost efficiency, can upgrade to gpt-4o if needed
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    })

    const response = completion.choices[0].message.content
    if (!response) {
      throw new Error("Nenhuma resposta recebida da API")
    }

    return { response }
  } catch (error: any) {
    console.error("Chat AI Error:", error)
    
    // Provide user-friendly error messages
    if (error.message?.includes('autenticado')) {
      return { response: "", error: "Você precisa estar logado para usar o chat." }
    }
    if (error.message?.includes('rate limit')) {
      return { response: "", error: "Limite de requisições excedido. Tente novamente em alguns instantes." }
    }
    
    return { 
      response: "", 
      error: error.message || "Erro ao processar sua mensagem. Tente novamente." 
    }
  }
}

