import { motion } from 'framer-motion'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="py-8 px-6 border-t border-white/[0.1] bg-black"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center text-sm text-white/40">
          <p>© {currentYear} Presto AI. All rights reserved.</p>
        </div>
      </div>
    </motion.footer>
  )
}
