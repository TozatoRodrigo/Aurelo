import type { ShiftSwap } from "@/app/actions/shift-swaps"

interface MatchingScore {
  swap: ShiftSwap
  score: number
  reasons: string[]
}

/**
 * Algoritmo de matching inteligente para trocas de plantão
 * Calcula um score de compatibilidade baseado em múltiplos fatores
 */
export function calculateMatchingScore(
  userSwap: ShiftSwap,
  candidateSwap: ShiftSwap
): MatchingScore {
  let score = 0
  const reasons: string[] = []

  // Não fazer match com a própria troca
  if (userSwap.user_id === candidateSwap.user_id) {
    return { swap: candidateSwap, score: 0, reasons: ["Sua própria troca"] }
  }

  // 1. Match por tipo complementar (oferta <-> solicitação)
  if (
    (userSwap.swap_type === 'offer' && candidateSwap.swap_type === 'request') ||
    (userSwap.swap_type === 'request' && candidateSwap.swap_type === 'offer')
  ) {
    score += 30
    reasons.push("Tipos complementares")
  }

  // 2. Match por data próxima (±3 dias)
  if (userSwap.shift && candidateSwap.desired_date) {
    const userDate = new Date(userSwap.shift.start_time)
    const desiredDate = new Date(candidateSwap.desired_date)
    const daysDiff = Math.abs(
      Math.floor((desiredDate.getTime() - userDate.getTime()) / (1000 * 60 * 60 * 24))
    )

    if (daysDiff <= 3) {
      score += 25
      reasons.push(`Data próxima (${daysDiff} dia${daysDiff > 1 ? 's' : ''})`)
    } else if (daysDiff <= 7) {
      score += 15
      reasons.push(`Data próxima (${daysDiff} dias)`)
    }
  }

  if (candidateSwap.shift && userSwap.desired_date) {
    const candidateDate = new Date(candidateSwap.shift.start_time)
    const desiredDate = new Date(userSwap.desired_date)
    const daysDiff = Math.abs(
      Math.floor((desiredDate.getTime() - candidateDate.getTime()) / (1000 * 60 * 60 * 24))
    )

    if (daysDiff <= 3) {
      score += 25
      reasons.push(`Data próxima (${daysDiff} dia${daysDiff > 1 ? 's' : ''})`)
    } else if (daysDiff <= 7) {
      score += 15
      reasons.push(`Data próxima (${daysDiff} dias)`)
    }
  }

  // 3. Match por mesma instituição
  const userInstitution = userSwap.shift?.institution_name || userSwap.desired_institution?.institution_name
  const candidateInstitution = candidateSwap.shift?.institution_name || candidateSwap.desired_institution?.institution_name

  if (userInstitution && candidateInstitution && userInstitution === candidateInstitution) {
    score += 20
    reasons.push("Mesma instituição")
  }

  // 4. Match por horário similar (mesmo turno)
  if (userSwap.shift && candidateSwap.shift) {
    const userStart = new Date(userSwap.shift.start_time).getHours()
    const candidateStart = new Date(candidateSwap.shift.start_time).getHours()

    // Manhã: 6-12, Tarde: 12-18, Noite: 18-6
    const userShift = userStart >= 6 && userStart < 12 ? 'morning' :
                     userStart >= 12 && userStart < 18 ? 'afternoon' : 'night'
    const candidateShift = candidateStart >= 6 && candidateStart < 12 ? 'morning' :
                          candidateStart >= 12 && candidateStart < 18 ? 'afternoon' : 'night'

    if (userShift === candidateShift) {
      score += 15
      reasons.push("Mesmo turno")
    }
  }

  // 5. Match por tipo de troca (exchange com exchange)
  if (userSwap.swap_type === 'exchange' && candidateSwap.swap_type === 'exchange') {
    score += 10
    reasons.push("Ambos querem trocar")
  }

  // 6. Penalidade por muitos interesses (pode estar resolvido)
  if (candidateSwap.interests_count && candidateSwap.interests_count > 3) {
    score -= 10
    reasons.push("Muitos interesses já")
  }

  // Normalizar score para 0-100
  const normalizedScore = Math.min(100, Math.max(0, score))

  return {
    swap: candidateSwap,
    score: normalizedScore,
    reasons,
  }
}

/**
 * Encontra os melhores matches para uma troca específica
 */
export function findBestMatches(
  userSwap: ShiftSwap,
  allSwaps: ShiftSwap[],
  limit: number = 5
): MatchingScore[] {
  const scores = allSwaps
    .filter(swap => swap.id !== userSwap.id && swap.status === 'open')
    .map(swap => calculateMatchingScore(userSwap, swap))
    .filter(result => result.score > 0) // Apenas matches com score > 0
    .sort((a, b) => b.score - a.score) // Ordenar por score decrescente

  return scores.slice(0, limit)
}

/**
 * Verifica se há matches automáticos que devem ser notificados
 */
export function checkAutoMatches(userSwap: ShiftSwap, allSwaps: ShiftSwap[]): MatchingScore[] {
  const matches = findBestMatches(userSwap, allSwaps, 3)
  
  // Considerar apenas matches com score >= 50 como "bons matches"
  return matches.filter(m => m.score >= 50)
}

