import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { ThemeToggle } from '@/components/ThemeToggle'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap } from 'lucide-react'
import { useState, useEffect } from 'react'

export function Header() {
  const navigate = useNavigate()
  const [isVisible, setIsVisible] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY

      // Show header after scrolling 100px
      setIsVisible(scrollPosition > 100)

      // Glass effect after 20px
      setScrolled(scrollPosition > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.header
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
            scrolled ? 'bg-black/80 backdrop-blur-xl border-b border-white/[0.1]' : ''
          }`}
        >
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <motion.div
                  className="h-8 w-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'var(--gradient-primary)' }}
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  <Zap className="h-4 w-4 text-white" />
                </motion.div>
                <span className="text-xl font-bold text-white">Presto AI</span>
              </div>

              <div className="flex items-center gap-3">
                <ThemeToggle />
                <Button
                  variant="ghost"
                  onClick={() => navigate('/auth/login')}
                  className="hidden sm:inline-flex text-white hover:bg-white/10"
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => navigate('/auth/login')}
                  size="sm"
                  className="bg-gradient-to-r from-indigo-500 to-rose-500 hover:from-indigo-600 hover:to-rose-600"
                >
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        </motion.header>
      )}
    </AnimatePresence>
  )
}
