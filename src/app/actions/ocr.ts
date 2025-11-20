"use server"

import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "mock-key",
})

interface ParsedShift {
  date: string // YYYY-MM-DD
  start_time: string // HH:MM
  end_time: string // HH:MM
  institution?: string
  estimated_value?: number
}

interface OCRResponse {
  shifts?: ParsedShift[]
  error?: string
}

function validateDate(dateStr: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/
  if (!dateRegex.test(dateStr)) return false
  const date = new Date(dateStr)
  return date instanceof Date && !isNaN(date.getTime())
}

function validateTime(timeStr: string): boolean {
  const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/
  return timeRegex.test(timeStr)
}

function validateShift(shift: any): shift is ParsedShift {
  if (!shift.date || !shift.start_time || !shift.end_time) {
    return false
  }
  
  if (!validateDate(shift.date)) {
    return false
  }
  
  if (!validateTime(shift.start_time) || !validateTime(shift.end_time)) {
    return false
  }
  
  return true
}

function normalizeShifts(shifts: any[]): ParsedShift[] {
  const currentYear = new Date().getFullYear()
  
  return shifts
    .map((shift) => {
      // Normalize date format
      let date = shift.date
      if (date && !date.includes('-')) {
        // Try to parse formats like "20/05" or "20/05/2024"
        const parts = date.split('/')
        if (parts.length === 2) {
          date = `${currentYear}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`
        } else if (parts.length === 3) {
          date = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`
        }
      }
      
      // Normalize time format
      let start_time = shift.start_time || shift.startTime || shift.start
      let end_time = shift.end_time || shift.endTime || shift.end
      
      // Remove spaces and ensure HH:MM format
      if (start_time) {
        start_time = start_time.replace(/\s/g, '').substring(0, 5)
        if (!start_time.includes(':')) {
          start_time = `${start_time.substring(0, 2)}:${start_time.substring(2)}`
        }
      }
      
      if (end_time) {
        end_time = end_time.replace(/\s/g, '').substring(0, 5)
        if (!end_time.includes(':')) {
          end_time = `${end_time.substring(0, 2)}:${end_time.substring(2)}`
        }
      }
      
      return {
        date,
        start_time,
        end_time,
        institution: shift.institution || shift.hospital || shift.local || undefined,
        estimated_value: shift.estimated_value || shift.value || shift.valor || undefined,
      }
    })
    .filter(validateShift)
}

export async function parseScheduleImage(formData: FormData): Promise<OCRResponse> {
  const file = formData.get("file") as File
  
  if (!file) {
    return { error: "Nenhum arquivo fornecido" }
  }

  // Validate file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']
  if (!validTypes.includes(file.type)) {
    return { error: "Tipo de arquivo não suportado. Use JPG, PNG ou PDF" }
  }

  // Validate file size (max 10MB)
  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    return { error: "Arquivo muito grande. Tamanho máximo: 10MB" }
  }

  // Mock Fallback if no API Key (for development)
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "mock-key") {
    console.log("⚠️ Usando dados mock - Configure OPENAI_API_KEY para usar OCR real")
    await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate delay
    return {
      shifts: [
        {
          date: new Date().toISOString().split('T')[0],
          start_time: "07:00",
          end_time: "19:00",
          institution: "Hospital Mock",
        },
        {
          date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          start_time: "19:00",
          end_time: "07:00",
          institution: "Hospital Mock",
        },
      ]
    }
  }

  try {
    let imageData: string
    let mimeType: string

    if (file.type === 'application/pdf') {
      // For PDF, we'll need to convert to image first
      // For now, return error suggesting to use image format
      return { error: "PDF ainda não suportado. Por favor, converta para imagem (JPG/PNG) ou tire uma foto da escala." }
    } else {
      // Convert image to base64
      const buffer = await file.arrayBuffer()
      const base64Image = Buffer.from(buffer).toString("base64")
      mimeType = file.type
      imageData = `data:${mimeType};base64,${base64Image}`
    }

    const systemPrompt = `Você é um assistente especializado em extrair informações de escalas de trabalho de profissionais da saúde.

Analise a imagem da escala e extraia TODAS as informações de plantões encontradas.

Retorne APENAS um objeto JSON válido com a seguinte estrutura:
{
  "shifts": [
    {
      "date": "YYYY-MM-DD",
      "start_time": "HH:MM",
      "end_time": "HH:MM",
      "institution": "Nome do hospital/clínica (se visível)",
      "estimated_value": número (opcional, se houver valor mencionado)
    }
  ]
}

REGRAS IMPORTANTES:
- Use o formato de data YYYY-MM-DD (ex: 2024-05-20)
- Use o formato de hora HH:MM em 24h (ex: 07:00, 19:00)
- Se o ano não estiver visível, assuma o ano atual (${new Date().getFullYear()})
- Se o mês não estiver visível, assuma o mês atual
- Para plantões noturnos que terminam no dia seguinte, mantenha a data de início
- Se houver múltiplas escalas na mesma imagem, extraia todas
- Se não conseguir identificar algum campo, use null ou omita o campo
- Retorne APENAS o JSON, sem texto adicional`

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: [
            { 
              type: "text", 
              text: "Extraia todos os plantões desta escala de trabalho. Retorne apenas o JSON válido." 
            },
            {
              type: "image_url",
              image_url: {
                url: imageData,
                detail: "high" // High detail for better OCR accuracy
              },
            },
          ],
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 2000,
      temperature: 0.1, // Low temperature for more consistent results
    })

    const content = response.choices[0].message.content
    if (!content) {
      throw new Error("Nenhuma resposta recebida da API")
    }
    
    let parsedContent: any
    try {
      parsedContent = JSON.parse(content)
    } catch (parseError) {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/)
      if (jsonMatch) {
        parsedContent = JSON.parse(jsonMatch[1])
      } else {
        throw new Error("Resposta da API não é um JSON válido")
      }
    }

    if (!parsedContent.shifts || !Array.isArray(parsedContent.shifts)) {
      return { error: "Formato de resposta inválido. Nenhum plantão encontrado." }
    }

    if (parsedContent.shifts.length === 0) {
      return { error: "Nenhum plantão foi identificado na imagem. Verifique se a escala está legível." }
    }

    // Normalize and validate shifts
    const normalizedShifts = normalizeShifts(parsedContent.shifts)

    if (normalizedShifts.length === 0) {
      return { error: "Nenhum plantão válido foi encontrado após validação. Verifique os dados extraídos." }
    }

    return { shifts: normalizedShifts }
  } catch (error: any) {
    console.error("OCR Error:", error)
    
    // Provide user-friendly error messages
    if (error.message?.includes('API key')) {
      return { error: "Erro de autenticação com a API. Verifique a configuração." }
    }
    if (error.message?.includes('rate limit')) {
      return { error: "Limite de requisições excedido. Tente novamente em alguns instantes." }
    }
    if (error.message?.includes('invalid image')) {
      return { error: "Imagem inválida ou corrompida. Tente com outra imagem." }
    }
    
    return { error: error.message || "Erro ao processar a imagem. Tente novamente." }
  }
}
