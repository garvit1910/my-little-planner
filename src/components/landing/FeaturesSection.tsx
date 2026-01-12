import { Timer, BarChart, Shield, Sparkles, Headphones } from 'lucide-react'
import { FeatureCard } from './FeatureCard'
import { motion } from 'framer-motion'

const features = [
  {
    icon: Timer,
    title: 'Focus & Pomodoro Mode',
    description: 'Built-in Pomodoro timer with task locking to prevent multitasking'
  },
  {
    icon: BarChart,
    title: 'Analytics & Insights',
    description: 'Track tasks completed per day and week with intuitive productivity metrics'
  },
  {
    icon: Shield,
    title: 'Website Blocker',
    description: 'Automatically block distracting websites during focus sessions'
  },
  {
    icon: Sparkles,
    title: 'AI-Assisted Reports',
    description: 'Get AI-generated task breakdowns and productivity suggestions'
  },
  {
    icon: Headphones,
    title: 'AI Focus Sounds',
    description: 'Ambient sound recommendations based on your task type'
  }
]

export function FeaturesSection() {
  return (
    <section className="py-16 md:py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            Powerful Features
          </h2>
          <p className="text-base md:text-lg text-white/60 max-w-2xl mx-auto">
            Everything you need to boost your productivity and achieve your goals
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={index * 0.1}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
