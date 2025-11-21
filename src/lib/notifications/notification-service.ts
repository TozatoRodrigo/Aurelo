import { createClient } from '@/lib/supabase/client'
import { startOfMonth, endOfMonth, differenceInHours, addDays, isBefore } from 'date-fns'
import { createNotification } from '@/app/actions/notifications'

/**
 * Serviço para criar notificações automáticas baseadas em eventos
 */
export class NotificationService {
  /**
   * Cria notificação de lembrete de plantão (24h antes)
   */
  static async checkShiftReminders(userId: string) {
    const supabase = createClient()
    const tomorrow = addDays(new Date(), 1)
    const tomorrowEnd = addDays(tomorrow, 1)

    const { data: shifts } = await supabase
      .from('shifts')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'scheduled')
      .gte('start_time', tomorrow.toISOString())
      .lte('start_time', tomorrowEnd.toISOString())

    if (shifts && shifts.length > 0) {
      for (const shift of shifts) {
        await createNotification({
          userId,
          type: 'reminder',
          title: 'Lembrete de Plantão',
          message: `Você tem um plantão amanhã às ${new Date(shift.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
          link: `/escala?date=${new Date(shift.start_time).toISOString().split('T')[0]}`,
        })
      }
    }
  }

  /**
   * Cria notificação de alerta de burnout
   */
  static async checkBurnoutAlerts(userId: string) {
    const supabase = createClient()
    const now = new Date()
    const start = startOfMonth(now)
    const end = endOfMonth(now)

    // Get user's weekly limit
    const { data: profile } = await supabase
      .from('profiles')
      .select('weekly_hours_limit')
      .eq('id', userId)
      .single()

    const weeklyLimit = profile?.weekly_hours_limit || 44

    // Get current week shifts
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - now.getDay())
    weekStart.setHours(0, 0, 0, 0)
    const weekEnd = addDays(weekStart, 7)

    const { data: shifts } = await supabase
      .from('shifts')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'scheduled')
      .gte('start_time', weekStart.toISOString())
      .lte('start_time', weekEnd.toISOString())

    if (shifts) {
      const totalHours = shifts.reduce((acc, shift) => {
        const start = new Date(shift.start_time)
        const end = new Date(shift.end_time)
        return acc + Math.abs(differenceInHours(end, start))
      }, 0)

      if (totalHours > weeklyLimit) {
        await createNotification({
          userId,
          type: 'burnout_alert',
          title: 'Alerta de Carga de Trabalho',
          message: `Você já trabalhou ${totalHours.toFixed(1)}h esta semana, acima do seu limite de ${weeklyLimit}h. Considere descansar.`,
          link: '/',
        })
      }
    }
  }

  /**
   * Cria notificação quando há interesse em uma troca
   */
  static async notifySwapInterest(userId: string, swapId: string, interestedUserName: string) {
    await createNotification({
      userId,
      type: 'swap_interest',
      title: 'Novo Interesse na Sua Troca',
      message: `${interestedUserName} demonstrou interesse na sua troca de plantão.`,
      link: `/trocas?swap=${swapId}`,
    })
  }

  /**
   * Cria notificação quando há match de troca
   */
  static async notifySwapMatch(userId: string, matchedSwapId: string) {
    await createNotification({
      userId,
      type: 'swap_match',
      title: 'Match Encontrado!',
      message: 'Encontramos uma troca compatível com o que você procura.',
      link: `/trocas?swap=${matchedSwapId}`,
    })
  }

  /**
   * Cria notificação quando meta financeira é alcançada
   */
  static async checkGoalAchievement(userId: string) {
    const supabase = createClient()
    const now = new Date()
    const start = startOfMonth(now)
    const end = endOfMonth(now)

    const { data: profile } = await supabase
      .from('profiles')
      .select('monthly_goal')
      .eq('id', userId)
      .single()

    if (!profile?.monthly_goal) return

    const { data: shifts } = await supabase
      .from('shifts')
      .select('estimated_value')
      .eq('user_id', userId)
      .gte('start_time', start.toISOString())
      .lte('start_time', end.toISOString())

    if (shifts) {
      const totalEarnings = shifts.reduce((acc, shift) => acc + (shift.estimated_value || 0), 0)

      if (totalEarnings >= profile.monthly_goal) {
        await createNotification({
          userId,
          type: 'goal_achieved',
          title: 'Meta Alcançada! 🎉',
          message: `Parabéns! Você alcançou sua meta financeira de R$ ${profile.monthly_goal.toFixed(2)} este mês.`,
          link: '/financas',
        })
      }
    }
  }
}

