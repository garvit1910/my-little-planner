import { motion } from 'framer-motion'

export function SectionDivider() {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none">
      {/* Gradient fade */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50" />

      {/* Animated particles/dots */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            style={{
              left: `${20 + i * 15}%`,
              top: '50%',
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </motion.div>
    </div>
  )
}
