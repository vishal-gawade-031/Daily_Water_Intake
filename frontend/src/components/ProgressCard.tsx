import { motion } from 'framer-motion'

type Props = {
  totalMl: number
  percentage: number
  dailyGoal: number
}

export default function ProgressCard({ totalMl, percentage, dailyGoal }: Props) {
  const isGoalReached = totalMl >= dailyGoal
  const remaining = Math.max(0, dailyGoal - totalMl)

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="rounded-2xl bg-gradient-to-br from-blue-500 to-teal-500 p-6 text-white shadow-lg"
    >
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-3xl">💪</span>
          <h3 className="text-lg font-bold">Today's Progress</h3>
        </div>
        {isGoalReached && (
          <motion.span
            animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="text-2xl"
          >
            🎉
          </motion.span>
        )}
      </div>

      {/* Progress Indicator */}
      <div className="mb-6">
        <div className="relative h-12 overflow-hidden rounded-full bg-white/30 backdrop-blur-sm">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="relative h-full rounded-full bg-gradient-to-r from-yellow-300 to-blue-300 shadow-lg"
          >
            {/* Shimmer Effect */}
            <motion.div
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            />
          </motion.div>
        </div>
        <div className="mt-2 text-center text-sm font-semibold">
          {Math.round(percentage)}% Complete
        </div>
      </div>

      {/* Stats */}
      <div className="space-y-3 rounded-xl bg-white/20 p-4 backdrop-blur">
        <div className="flex justify-between items-center">
          <span className="text-white/90">Consumed</span>
          <motion.span
            key={totalMl}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-2xl font-bold"
          >
            {totalMl}ml
          </motion.span>
        </div>

        <div className="h-px bg-white/30" />

        <div className="flex justify-between items-center">
          <span className="text-white/90">Goal</span>
          <span className="text-xl font-bold">{dailyGoal}ml</span>
        </div>

        <div className="h-px bg-white/30" />

        <div className="flex justify-between items-center">
          <span className="text-white/90">
            {isGoalReached ? '✓ Goal Reached!' : 'Remaining'}
          </span>
          <motion.span
            key={remaining}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`text-xl font-bold ${isGoalReached ? 'text-yellow-300' : 'text-blue-100'}`}
          >
            {isGoalReached ? 'Amazing!' : `${remaining}ml`}
          </motion.span>
        </div>
      </div>

      {/* Motivation Message */}
      {!isGoalReached && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-4 rounded-lg bg-white/20 p-3 text-center text-sm font-medium"
        >
          💡 {remaining > 500 ? `Keep it up! Add ${remaining}ml more` : 'Almost there! Just a little more'}
        </motion.div>
      )}
    </motion.div>
  )
}
