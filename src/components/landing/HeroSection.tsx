import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

export function HeroSection() {
  const navigate = useNavigate()

  return (
    <section className="py-20 md:py-32 px-6">
      <div className="max-w-5xl mx-auto text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-5xl md:text-7xl font-bold text-gradient mb-6"
        >
          Presto AI
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-xl md:text-2xl font-medium mb-4"
        >
          AI-Powered Productivity & Study
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-base md:text-lg text-muted-foreground mb-8 max-w-2xl mx-auto"
        >
          The ultimate productivity companion for students and focused professionals
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              size="lg"
              onClick={() => navigate('/auth/login')}
              className="text-lg px-8 py-6 shadow-elevated hover:shadow-glow transition-all duration-300 animate-pulse"
              style={{
                background: 'var(--gradient-primary)',
                animationDuration: '2s'
              }}
            >
              Try for Free
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
