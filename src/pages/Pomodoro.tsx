import { useState, useEffect, useRef } from 'react'
import { AppLayout } from '@/components/AppLayout'
import { AnimatedBackground } from '@/components/animations'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Play, Pause, RotateCcw, Star } from 'lucide-react'
import { toast } from 'sonner'
import { usePomodoroStats } from '@/hooks/usePomodoroStats'
import { usePomodoroSettings } from '@/hooks/usePomodoroSettings'

type TimerMode = 'work' | 'break'
type PresetType = '25-5' | '50-10' | '90-20' | '15-3' | 'custom'

interface Preset {
  id: PresetType
  name: string
  workMinutes: number
  breakMinutes: number
  description: string
}

export default function Pomodoro() {
  const [mode, setMode] = useState<TimerMode>('work')
  const [timeLeft, setTimeLeft] = useState(25 * 60) // seconds
  const [isRunning, setIsRunning] = useState(false)
  const [selectedPreset, setSelectedPreset] = useState<PresetType>('25-5')
  const [customWork, setCustomWork] = useState(25)
  const [customBreak, setCustomBreak] = useState(5)
  const [sessionsCompleted, setSessionsCompleted] = useState(0)
  const [breaksSkipped, setBreaksSkipped] = useState(0)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const { stats, addSession, addBreak, incrementSkippedBreak } = usePomodoroStats()
  const { favoritePresets, saveFavorite, removeFavorite } = usePomodoroSettings()

  const presets: Preset[] = [
    {
      id: '25-5',
      name: 'Classic Pomodoro',
      workMinutes: 25,
      breakMinutes: 5,
      description: 'Traditional 25/5 method'
    },
    {
      id: '50-10',
      name: 'Deep Work',
      workMinutes: 50,
      breakMinutes: 10,
      description: 'Extended focus sessions'
    },
    {
      id: '90-20',
      name: 'Ultradian',
      workMinutes: 90,
      breakMinutes: 20,
      description: 'Natural focus cycles'
    },
    {
      id: '15-3',
      name: 'ADHD-Friendly',
      workMinutes: 15,
      breakMinutes: 3,
      description: 'Short, frequent breaks'
    },
    {
      id: 'custom',
      name: 'Custom',
      workMinutes: customWork,
      breakMinutes: customBreak,
      description: 'Your own settings'
    }
  ]

  const currentPreset = presets.find(p => p.id === selectedPreset)!

  // Timer logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimerComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, timeLeft])

  // Notification on timer complete
  const handleTimerComplete = () => {
    setIsRunning(false)

    if (mode === 'work') {
      setSessionsCompleted(prev => prev + 1)
      addSession(currentPreset.workMinutes)
      toast.success('Work session completed! Time for a break.')

      // Auto-start break
      setMode('break')
      setTimeLeft(currentPreset.breakMinutes * 60)
    } else {
      addBreak(currentPreset.breakMinutes)
      toast.success('Break completed! Ready for another session?')

      setMode('work')
      setTimeLeft(currentPreset.workMinutes * 60)
    }

    // Browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Presto AI Pomodoro', {
        body: mode === 'work' ? 'Work session complete! Take a break.' : 'Break complete! Ready to focus?',
        icon: '/favicon.ico'
      })
    }
  }

  const handlePresetChange = (presetId: PresetType) => {
    setSelectedPreset(presetId)
    const preset = presets.find(p => p.id === presetId)!
    setTimeLeft(preset.workMinutes * 60)
    setMode('work')
    setIsRunning(false)
  }

  const handleTogglePlay = () => {
    setIsRunning(!isRunning)
  }

  const handleReset = () => {
    setIsRunning(false)
    setMode('work')
    setTimeLeft(currentPreset.workMinutes * 60)
  }

  const handleSkipBreak = () => {
    if (mode === 'break') {
      setBreaksSkipped(prev => prev + 1)
      incrementSkippedBreak()

      // Warn if too many breaks skipped
      if (breaksSkipped >= 2) {
        toast.warning('You\'ve skipped several breaks. Remember to rest!', {
          duration: 5000
        })
      }

      setMode('work')
      setTimeLeft(currentPreset.workMinutes * 60)
      setIsRunning(false)
    }
  }

  const toggleFavorite = () => {
    if (favoritePresets.includes(selectedPreset)) {
      removeFavorite(selectedPreset)
      toast.success('Removed from favorites')
    } else {
      saveFavorite(selectedPreset)
      toast.success('Added to favorites')
    }
  }

  // Format time display
  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const displayTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`

  const progress = mode === 'work'
    ? ((currentPreset.workMinutes * 60 - timeLeft) / (currentPreset.workMinutes * 60)) * 100
    : ((currentPreset.breakMinutes * 60 - timeLeft) / (currentPreset.breakMinutes * 60)) * 100

  return (
    <AppLayout>
      <div className="min-h-screen bg-background relative">
        <AnimatedBackground />

        <div className="max-w-4xl mx-auto px-4 py-8 md:px-8 md:py-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-gradient mb-2">Pomodoro Timer</h1>
            <p className="text-muted-foreground">Stay focused with timed work sessions</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Timer Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-2"
            >
              <Card className="glass-strong border-primary/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl">
                        {mode === 'work' ? '🎯 Focus Time' : '☕ Break Time'}
                      </CardTitle>
                      <CardDescription>
                        {mode === 'work'
                          ? `Working for ${currentPreset.workMinutes} minutes`
                          : `Break for ${currentPreset.breakMinutes} minutes`}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleFavorite}
                      className={favoritePresets.includes(selectedPreset) ? 'text-yellow-500' : ''}
                    >
                      <Star className={`h-5 w-5 ${favoritePresets.includes(selectedPreset) ? 'fill-current' : ''}`} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Circular Timer Display */}
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="relative w-64 h-64">
                      {/* Background Circle */}
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="128"
                          cy="128"
                          r="120"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="none"
                          className="text-muted/20"
                        />
                        {/* Progress Circle */}
                        <motion.circle
                          cx="128"
                          cy="128"
                          r="120"
                          stroke="url(#gradient)"
                          strokeWidth="8"
                          fill="none"
                          strokeLinecap="round"
                          strokeDasharray={`${2 * Math.PI * 120}`}
                          strokeDashoffset={`${2 * Math.PI * 120 * (1 - progress / 100)}`}
                          className="transition-all duration-1000"
                        />
                        <defs>
                          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={mode === 'work' ? '#6366f1' : '#ec4899'} />
                            <stop offset="100%" stopColor={mode === 'work' ? '#8b5cf6' : '#f43f5e'} />
                          </linearGradient>
                        </defs>
                      </svg>

                      {/* Time Display */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-6xl font-bold text-gradient mb-2">
                            {displayTime}
                          </div>
                          <div className="text-sm text-muted-foreground uppercase tracking-wide">
                            {currentPreset.name}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="flex gap-4 mt-8">
                      <Button
                        size="lg"
                        onClick={handleTogglePlay}
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                      >
                        {isRunning ? (
                          <>
                            <Pause className="h-5 w-5 mr-2" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="h-5 w-5 mr-2" />
                            Start
                          </>
                        )}
                      </Button>
                      <Button size="lg" variant="outline" onClick={handleReset}>
                        <RotateCcw className="h-5 w-5 mr-2" />
                        Reset
                      </Button>
                      {mode === 'break' && (
                        <Button size="lg" variant="ghost" onClick={handleSkipBreak}>
                          Skip Break
                        </Button>
                      )}
                    </div>

                    {/* Session Counter */}
                    <div className="mt-6 text-center">
                      <p className="text-sm text-muted-foreground">
                        Sessions completed today: <span className="font-bold text-foreground">{sessionsCompleted}</span>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Preset Selector & Settings */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              {/* Preset Selector */}
              <Card className="glass-strong">
                <CardHeader>
                  <CardTitle>Presets</CardTitle>
                  <CardDescription>Choose your focus duration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Select value={selectedPreset} onValueChange={(v) => handlePresetChange(v as PresetType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {presets.map(preset => (
                        <SelectItem key={preset.id} value={preset.id}>
                          {preset.name}
                          {favoritePresets.includes(preset.id) && ' ⭐'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {selectedPreset === 'custom' && (
                    <div className="space-y-3 pt-2">
                      <div>
                        <Label htmlFor="work-duration">Work Duration (min)</Label>
                        <Input
                          id="work-duration"
                          type="number"
                          min={1}
                          max={120}
                          value={customWork}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 1
                            setCustomWork(val)
                            if (mode === 'work') {
                              setTimeLeft(val * 60)
                            }
                          }}
                          disabled={isRunning && mode === 'break'}
                        />
                      </div>
                      <div>
                        <Label htmlFor="break-duration">Break Duration (min)</Label>
                        <Input
                          id="break-duration"
                          type="number"
                          min={1}
                          max={60}
                          value={customBreak}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 1
                            setCustomBreak(val)
                            if (mode === 'break') {
                              setTimeLeft(val * 60)
                            }
                          }}
                          disabled={isRunning && mode === 'work'}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Stats */}
              <Card className="glass-strong">
                <CardHeader>
                  <CardTitle>Today's Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Sessions</span>
                    <span className="font-bold text-lg">{stats.totalSessions}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Focus Time</span>
                    <span className="font-bold text-lg">{Math.floor(stats.totalFocusMinutes / 60)}h {stats.totalFocusMinutes % 60}m</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Breaks Taken</span>
                    <span className="font-bold text-lg">{stats.totalBreaks}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
