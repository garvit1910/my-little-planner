import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface FeatureCardProps {
  icon: LucideIcon
  title: string
  description: string
  delay?: number
}

export function FeatureCard({ icon: Icon, title, description, delay = 0 }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -4 }}
      className="bg-white/[0.05] backdrop-blur-md p-6 rounded-2xl border border-white/[0.1] shadow-[0_8px_32px_0_rgba(255,255,255,0.1)] hover:shadow-[0_8px_48px_0_rgba(255,255,255,0.2)] transition-shadow duration-300"
    >
      <motion.div
        className="h-12 w-12 rounded-xl mb-4 flex items-center justify-center"
        style={{ background: 'var(--gradient-primary)' }}
        whileHover={{ scale: 1.1, rotate: 5 }}
        transition={{ duration: 0.3 }}
      >
        <Icon className="h-6 w-6 text-white" />
      </motion.div>
      <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
      <p className="text-sm md:text-base text-white/60">{description}</p>
    </motion.div>
  )
}
