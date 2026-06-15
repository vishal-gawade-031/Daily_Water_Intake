import { motion } from 'framer-motion'

export default function Header() {
  const containerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: 'easeOut',
      },
    },
  }

  const textVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { delay: 0.2, duration: 0.6 },
    },
  }

  return (
    <motion.header
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 py-12 shadow-lg"
    >
      {/* Animated Background Elements */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-white/20"
      />
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 5, repeat: Infinity, delay: 0.5 }}
        className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-white/10"
      />

      <div className="relative mx-auto max-w-5xl px-4">
        <motion.h1
          variants={textVariants}
          className="text-center text-4xl font-bold text-white md:text-5xl"
        >
          💧 Daily Water Intake
        </motion.h1>
        <motion.p
          variants={textVariants}
          className="mt-3 text-center text-lg text-blue-50"
        >
          Stay hydrated and track your water consumption journey
        </motion.p>
      </div>
    </motion.header>
  )
}
