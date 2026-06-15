import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const HYDRATION_TIPS = [
  { emoji: '🌅', title: 'Morning Hydration', tip: 'Drink a glass of water as soon as you wake up to rehydrate after sleep.' },
  { emoji: '🍽️', title: 'Before Meals', tip: 'Drink water 30 minutes before meals to aid digestion and reduce overeating.' },
  { emoji: '🏃', title: 'During Exercise', tip: 'Drink 200-300ml of water every 15-20 minutes during intense workouts.' },
  { emoji: '☀️', title: 'Afternoon Hydration', tip: 'Keep a water bottle nearby in the afternoon to maintain consistent hydration.' },
  { emoji: '🌙', title: 'Before Sleep', tip: 'Drink water 1-2 hours before bed to stay hydrated without disrupting sleep.' },
  { emoji: '💧', title: 'Temperature Matters', tip: 'Room temperature water is better absorbed than cold or hot water.' },
  { emoji: '🍋', title: 'Add Natural Flavor', tip: 'Add lemon, cucumber, or mint to water to make it more enjoyable.' },
  { emoji: '⏰', title: 'Schedule Reminders', tip: 'Set hourly reminders to drink water consistently throughout the day.' },
  { emoji: '🧂', title: 'Replace Electrolytes', tip: 'After sweating, drink water with a pinch of salt to replace lost electrolytes.' },
  { emoji: '🧠', title: 'Brain Power', tip: 'Even mild dehydration can reduce cognitive function. Stay hydrated for better focus.' },
]

export default function HydrationTips() {
  const [currentTip, setCurrentTip] = useState(HYDRATION_TIPS[0])

  useEffect(() => {
    const randomTip = HYDRATION_TIPS[Math.floor(Math.random() * HYDRATION_TIPS.length)]
    setCurrentTip(randomTip)
  }, [])

  const handleRefresh = () => {
    const randomTip = HYDRATION_TIPS[Math.floor(Math.random() * HYDRATION_TIPS.length)]
    setCurrentTip(randomTip)
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 p-8 shadow-lg"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-slate-900">💡 Hydration Tip</h3>
        <motion.button
          whileHover={{ rotate: 180 }}
          onClick={handleRefresh}
          className="p-2 rounded-lg bg-green-200 hover:bg-green-300 transition-colors"
        >
          🔄
        </motion.button>
      </div>

      <motion.div
        key={currentTip.title}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-4">
          <span className="text-5xl">{currentTip.emoji}</span>
          <h4 className="text-2xl font-bold text-slate-900">{currentTip.title}</h4>
        </div>
        <p className="text-lg text-slate-700 leading-relaxed">{currentTip.tip}</p>
      </motion.div>

      <div className="mt-6 p-4 bg-green-100 rounded-lg">
        <p className="text-sm text-green-800">
          💚 <strong>Tip:</strong> Refresh the page to get a new hydration tip!
        </p>
      </div>
    </motion.div>
  )
}
