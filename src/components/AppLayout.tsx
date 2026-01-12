import { ReactNode } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, CheckSquare, Timer, Shield, FileText, Music, BarChart3, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ThemeToggle'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { signOut, user } = useAuth()

  const navItems = [
    { path: '/app/dashboard', label: 'Dashboard', icon: Home },
    { path: '/app/tasks', label: 'Tasks', icon: CheckSquare },
    { path: '/app/pomodoro', label: 'Pomodoro', icon: Timer },
    { path: '/app/blocker', label: 'Blocker', icon: Shield },
    { path: '/app/reports', label: 'Reports', icon: FileText },
    { path: '/app/sounds', label: 'Sounds', icon: Music },
    { path: '/app/analytics', label: 'Analytics', icon: BarChart3 },
  ]

  const handleSignOut = async () => {
    await signOut()
  }

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="hidden md:flex md:w-64 shrink-0 flex-col border-r border-border glass-strong"
      >
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-2.5">
            <motion.div
              className="h-8 w-8 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--gradient-primary)' }}
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <CheckSquare className="h-4 w-4 text-white" />
            </motion.div>
            <span className="text-lg font-bold text-gradient">Presto AI</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item, index) => (
            <motion.button
              key={item.path}
              onClick={() => navigate(item.path)}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                isActive(item.path)
                  ? 'bg-primary/10 text-primary shadow-soft'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
              {isActive(item.path) && (
                <motion.div
                  layoutId="activeIndicator"
                  className="ml-auto h-1.5 w-1.5 rounded-full bg-primary"
                />
              )}
            </motion.button>
          ))}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-border space-y-3">
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <span className="text-xs text-muted-foreground truncate flex-1">
              {user?.email}
            </span>
          </div>
          <Button
            onClick={handleSignOut}
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
