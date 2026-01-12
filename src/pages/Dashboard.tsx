import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  CheckSquare,
  Timer,
  Shield,
  FileText,
  Music,
  BarChart3
} from 'lucide-react'
import { AnimatedBackground } from '@/components/animations'
import { AppLayout } from '@/components/AppLayout'

interface FeatureTile {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  gradient: string
  route: string
  glowColor: string
}

export default function Dashboard() {
  const navigate = useNavigate()

  const features: FeatureTile[] = [
    {
      id: 'tasks',
      title: 'Todolist and Tasks',
      description: 'Manage your tasks with calendar integration',
      icon: CheckSquare,
      gradient: 'from-indigo-500 to-purple-600',
      route: '/app/tasks',
      glowColor: 'rgba(99, 102, 241, 0.5)'
    },
    {
      id: 'pomodoro',
      title: 'Focus & Pomodoro',
      description: 'Boost productivity with timed work sessions',
      icon: Timer,
      gradient: 'from-rose-500 to-pink-600',
      route: '/app/pomodoro',
      glowColor: 'rgba(244, 63, 94, 0.5)'
    },
    {
      id: 'blocker',
      title: 'Website Blocker',
      description: 'Block distracting sites during focus time',
      icon: Shield,
      gradient: 'from-emerald-500 to-teal-600',
      route: '/app/blocker',
      glowColor: 'rgba(16, 185, 129, 0.5)'
    },
    {
      id: 'reports',
      title: 'AI-Assisted Reports',
      description: 'Generate insights from your productivity data',
      icon: FileText,
      gradient: 'from-amber-500 to-orange-600',
      route: '/app/reports',
      glowColor: 'rgba(245, 158, 11, 0.5)'
    },
    {
      id: 'sounds',
      title: 'AI Focus Sounds',
      description: 'Personalized ambient sounds for deep work',
      icon: Music,
      gradient: 'from-cyan-500 to-blue-600',
      route: '/app/sounds',
      glowColor: 'rgba(6, 182, 212, 0.5)'
    },
    {
      id: 'analytics',
      title: 'AI Analytics & Insight',
      description: 'Track patterns and optimize your workflow',
      icon: BarChart3,
      gradient: 'from-violet-500 to-purple-600',
      route: '/app/analytics',
      glowColor: 'rgba(139, 92, 246, 0.5)'
    }
  ]

  return (
    <AppLayout>
      <div className="min-h-screen bg-background relative">
        <AnimatedBackground />

        <div className="max-w-7xl mx-auto px-4 py-12 md:px-8 md:py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gradient mb-4">
            Welcome to Presto AI
          </h1>
          <p className="text-lg text-muted-foreground">
            Choose a feature to get started
          </p>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(feature.route)}
              className="group cursor-pointer"
            >
              <div className="relative h-full p-6 rounded-2xl bg-card border border-border glass-strong overflow-hidden transition-all duration-300 hover:border-primary/50">
                {/* Glow Effect */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"
                  style={{
                    background: `radial-gradient(circle at 50% 50%, ${feature.glowColor}, transparent 70%)`
                  }}
                />

                {/* Content */}
                <div className="relative z-10">
                  {/* Icon */}
                  <motion.div
                    className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br ${feature.gradient}`}
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <feature.icon className="h-7 w-7 text-white" />
                  </motion.div>

                  {/* Title */}
                  <h3 className="text-xl font-semibold mb-2 text-foreground group-hover:text-gradient transition-colors">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>

                  {/* Arrow indicator */}
                  <motion.div
                    className="mt-4 inline-flex items-center text-sm font-medium text-primary"
                    initial={{ x: 0 }}
                    whileHover={{ x: 4 }}
                  >
                    Open
                    <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        </div>
      </div>
    </AppLayout>
  )
}
