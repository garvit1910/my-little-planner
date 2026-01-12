import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface PomodoroStats {
  totalSessions: number
  totalFocusMinutes: number
  totalBreaks: number
  sessionsToday: number
}

export function usePomodoroStats() {
  const { user } = useAuth()
  const [stats, setStats] = useState<PomodoroStats>({
    totalSessions: 0,
    totalFocusMinutes: 0,
    totalBreaks: 0,
    sessionsToday: 0
  })

  useEffect(() => {
    if (user) {
      loadStats()
    }
  }, [user])

  const loadStats = async () => {
    if (!user) return

    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('pomodoro_sessions')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', today)

    if (!error && data) {
      const totalSessions = data.length
      const totalFocusMinutes = data.reduce((sum, session) => sum + session.duration_minutes, 0)
      const totalBreaks = data.filter(s => s.type === 'break').length

      setStats({
        totalSessions,
        totalFocusMinutes,
        totalBreaks,
        sessionsToday: totalSessions
      })
    }
  }

  const addSession = async (durationMinutes: number) => {
    if (!user) return

    await supabase.from('pomodoro_sessions').insert({
      user_id: user.id,
      type: 'work',
      duration_minutes: durationMinutes,
      created_at: new Date().toISOString()
    })

    loadStats()
  }

  const addBreak = async (durationMinutes: number) => {
    if (!user) return

    await supabase.from('pomodoro_sessions').insert({
      user_id: user.id,
      type: 'break',
      duration_minutes: durationMinutes,
      created_at: new Date().toISOString()
    })

    loadStats()
  }

  const incrementSkippedBreak = async () => {
    // Track skipped breaks for gentle reminders
    if (!user) return

    await supabase.from('pomodoro_sessions').insert({
      user_id: user.id,
      type: 'break_skipped',
      duration_minutes: 0,
      created_at: new Date().toISOString()
    })
  }

  return { stats, addSession, addBreak, incrementSkippedBreak }
}
