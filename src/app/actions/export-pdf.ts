"use server"

import { createClient } from "@/lib/supabase/server"
import { startOfMonth, endOfMonth, format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { generateFinancialReportPDF } from "@/lib/pdf/generate-financial-report"
import type { Shift } from "@/store/useShiftsStore"

export async function exportFinancialReportPDF(monthDate: Date) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: "Usuário não autenticado" }
  }

  const start = startOfMonth(monthDate)
  const end = endOfMonth(monthDate)

  // Fetch shifts
  const { data: shiftsData, error } = await supabase
    .from('shifts')
    .select(`
      *,
      work_relations(institution_name)
    `)
    .eq('user_id', user.id)
    .gte('start_time', start.toISOString())
    .lte('end_time', end.toISOString())
    .order('start_time', { ascending: false })

  if (error) {
    return { error: error.message }
  }

  const shifts: Shift[] = (shiftsData || []).map((shift: any) => ({
    ...shift,
    institution_name: shift.work_relations?.institution_name,
  }))

  // Calculate totals
  const totalEarnings = shifts.reduce((acc, shift) => acc + (shift.estimated_value || 0), 0)
  
  const byInstitution: Record<string, number> = {}
  shifts.forEach(shift => {
    const name = shift.institution_name || "Sem Vínculo"
    byInstitution[name] = (byInstitution[name] || 0) + (shift.estimated_value || 0)
  })

  const byInstitutionArray = Object.entries(byInstitution).map(([name, value]) => ({
    name,
    value,
  }))

  // Generate PDF
  const pdfBlob = generateFinancialReportPDF({
    month: format(monthDate, "MMMM", { locale: ptBR }),
    year: monthDate.getFullYear(),
    totalEarnings,
    shiftsCount: shifts.length,
    byInstitution: byInstitutionArray,
    shifts,
  })

  // Convert blob to base64 for download
  const arrayBuffer = await pdfBlob.arrayBuffer()
  const base64 = Buffer.from(arrayBuffer).toString('base64')

  return {
    data: {
      base64,
      filename: `relatorio-financeiro-${format(monthDate, 'yyyy-MM', { locale: ptBR })}.pdf`,
    },
  }
}

