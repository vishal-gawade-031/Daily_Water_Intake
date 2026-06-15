import { motion } from 'framer-motion'

const BEST_TIMES = [
  {
    emoji: '🌅',
    time: 'After Waking Up',
    description: 'Drink 500ml of water immediately after waking to rehydrate your body.',
  },
  {
    emoji: '🍽️',
    time: 'Before Meals',
    description: 'Drink 250ml 30 minutes before eating to aid digestion and boost metabolism.',
  },
  {
    emoji: '💪',
    time: 'During Exercise',
    description: 'Drink 200-300ml every 15 minutes during workouts to maintain performance.',
  },
  {
    emoji: '☀️',
    time: 'Afternoon Break',
    description: 'Drink water mid-afternoon to combat the energy dip and stay focused.',
  },
]

export default function BestTimesToDrink() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="rounded-2xl bg-white p-8 shadow-lg"
    >
      <h2 className="text-2xl font-bold text-slate-900 mb-6">⏰ Best Times to Drink Water</h2>

      <div className="space-y-4">
        {BEST_TIMES.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * (index + 1) }}
            className="flex gap-4 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 hover:shadow-md transition-shadow"
          >
            <span className="text-3xl">{item.emoji}</span>
            <div className="flex-1">
              <h4 className="font-semibold text-slate-900">{item.time}</h4>
              <p className="text-sm text-slate-600 mt-1">{item.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-6 p-4 rounded-lg bg-amber-50 border border-amber-200"
      >
        <p className="text-sm text-amber-800">
          💡 <strong>Pro Tip:</strong> Consistency is key! Try to drink water evenly throughout the day rather than large amounts at once.
        </p>
      </motion.div>
    </motion.div>
  )
}
