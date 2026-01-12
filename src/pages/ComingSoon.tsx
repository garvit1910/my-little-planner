import { useNavigate } from 'react-router-dom'
import { AppLayout } from '@/components/AppLayout'
import { AnimatedBackground } from '@/components/animations'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

interface ComingSoonProps {
  feature: string
}

export default function ComingSoon({ feature }: ComingSoonProps) {
  const navigate = useNavigate()

  return (
    <AppLayout>
      <div className="min-h-screen bg-background relative flex items-center justify-center">
        <AnimatedBackground />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center px-4"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gradient mb-4">
            Coming Soon
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            {feature} is currently under development
          </p>
          <Button onClick={() => navigate('/app/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </motion.div>
      </div>
    </AppLayout>
  )
}
