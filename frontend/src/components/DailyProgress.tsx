import { motion } from 'framer-motion'

type Props = {
  summary: {
    total_ml: number
    daily_goal: number
    remaining_ml: number
    percentage: number
  }
}

export default function DailyProgress({ summary }: Props) {
  const isGoalReached = summary.percentage >= 100

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="rounded-2xl bg-gradient-to-br from-blue-500 to-teal-500 p-8 text-white shadow-lg"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold">Today's Progress</h3>
        {isGoalReached && (
          <motion.span
            animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="text-2xl"
          >
            🎉
          </motion.span>
        )}
      </div>

      {/* Circular Progress */}
      <div className="relative h-48 flex items-center justify-center mb-6">
        <svg className="transform -rotate-90 w-40 h-40">
          <circle
            cx="80"
            cy="80"
            r="70"
            fill="none"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="8"
          />
          <motion.circle
            cx="80"
            cy="80"
            r="70"
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="8"
            initial={{ strokeDashoffset: 440 }}
            animate={{ strokeDashoffset: 440 * (1 - summary.percentage / 100) }}
            transition={{ duration: 1, ease: 'easeOut' }}
            strokeDasharray={440}
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255, 193, 7, 1)" />
              <stop offset="100%" stopColor="rgba(76, 175, 80, 1)" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute text-center">
          <div className="text-4xl font-bold">{summary.percentage}%</div>
          <div className="text-blue-100 text-sm">Complete</div>
        </div>
      </div>

      {/* Stats */}
      <div className="space-y-3 bg-white/20 rounded-xl p-4 backdrop-blur-sm">
        <div className="flex justify-between items-center">
          <span className="text-blue-100">Consumed</span>
          <span className="text-2xl font-bold">{summary.total_ml}ml</span>
        </div>
        <div className="h-px bg-white/30" />
        <div className="flex justify-between items-center">
          <span className="text-blue-100">Goal</span>
          <span className="text-xl font-semibold">{summary.daily_goal}ml</span>
        </div>
        <div className="h-px bg-white/30" />
        <div className="flex justify-between items-center">
          <span className="text-blue-100">{isGoalReached ? '✓ Goal Reached!' : 'Remaining'}</span>
          <span className={`text-xl font-bold ${isGoalReached ? 'text-yellow-300' : ''}`}>
            {isGoalReached ? 'Amazing!' : `${summary.remaining_ml}ml`}
          </span>
        </div>
      </div>
    </motion.div>
  )
}
