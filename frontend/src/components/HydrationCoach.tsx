import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'

const API_BASE = 'http://127.0.0.1:8000/api'

type Coach = {
  message: string
  percentage: number
  current_ml: number
  goal_ml: number
}

export default function HydrationCoach({ summary }: { summary: any }) {
  const [coach, setCoach] = useState<Coach | null>(null)

  useEffect(() => {
    loadCoachingMessage()
  }, [summary])

  const loadCoachingMessage = async () => {
    try {
      const res = await axios.get(`${API_BASE}/coaching/`)
      setCoach(res.data)
    } catch (error) {
      console.error('Failed to load coaching message:', error)
    }
  }

  if (!coach) return null

  const getCoachEmoji = (percentage: number) => {
    if (percentage === 0) return '💤'
    if (percentage < 25) return '😴'
    if (percentage < 50) return '🌊'
    if (percentage < 75) return '💪'
    if (percentage < 100) return '🎯'
    return '🏆'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 p-8 text-white shadow-lg overflow-hidden"
    >
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-bold">🏆 Hydration Coach</h3>
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-3xl"
          >
            {getCoachEmoji(coach.percentage)}
          </motion.span>
        </div>

        <motion.p
          key={coach.message}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-lg leading-relaxed mb-6 text-white/90"
        >
          {coach.message}
        </motion.p>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Progress:</span>
            <span className="font-bold">{coach.percentage}%</span>
          </div>
          <div className="h-2 bg-white/30 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${coach.percentage}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-yellow-300 to-green-300"
            />
          </div>
          <div className="flex justify-between text-white/80">
            <span>{coach.current_ml}ml</span>
            <span>{coach.goal_ml}ml</span>
          </div>
        </div>
      </div>

      {/* Decorative Background */}
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"
      />
    </motion.div>
  )
}
