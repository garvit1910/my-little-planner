import { Header } from '@/components/landing/Header'
import { HeroGeometric } from '@/components/ui/shape-landing-hero'
import { FeaturesSection } from '@/components/landing/FeaturesSection'
import { Footer } from '@/components/landing/Footer'
import { SparklesPreview } from '@/components/ui/sparkles-preview'
import { SectionDivider } from '@/components/landing/SectionDivider'
import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useScroll, useTransform, motion } from 'framer-motion'

export default function Landing() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()
  const containerRef = useRef(null)

  // Parallax scroll setup
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  // Parallax transforms for each section
  const section1Y = useTransform(scrollYProgress, [0, 0.33], [0, -100])
  const section1Opacity = useTransform(scrollYProgress, [0, 0.25, 0.33], [1, 0.5, 0])

  const section2Y = useTransform(scrollYProgress, [0.2, 0.66], [100, -50])
  const section2Opacity = useTransform(scrollYProgress, [0.25, 0.33, 0.6, 0.66], [0, 1, 1, 0.5])

  const section3Y = useTransform(scrollYProgress, [0.5, 1], [100, 0])
  const section3Opacity = useTransform(scrollYProgress, [0.6, 0.66, 1], [0, 1, 1])

  // Redirect to app if already logged in
  useEffect(() => {
    if (!loading && user) {
      navigate('/app')
    }
  }, [user, loading, navigate])

  // Show nothing while checking auth
  if (loading) {
    return null
  }

  return (
    <div ref={containerRef} className="relative bg-black">
      {/* Scroll-triggered Header */}
      <Header />

      {/* Section 1: Parallax Sparkles */}
      <motion.section
        className="min-h-screen sticky top-0 bg-black relative"
        style={{ y: section1Y, opacity: section1Opacity }}
      >
        <SparklesPreview />
        <SectionDivider />
      </motion.section>

      {/* Section 2: Parallax Hero */}
      <motion.section
        className="relative bg-black min-h-screen z-10"
        style={{ y: section2Y, opacity: section2Opacity }}
      >
        <HeroGeometric
          badge="Presto AI"
          title1="AI-Powered Productivity"
          title2="For Students & Professionals"
        />
        <SectionDivider />
      </motion.section>

      {/* Section 3: Parallax Features */}
      <motion.section
        className="relative bg-black z-20"
        style={{ y: section3Y, opacity: section3Opacity }}
      >
        <FeaturesSection />
        <Footer />
      </motion.section>
    </div>
  )
}
