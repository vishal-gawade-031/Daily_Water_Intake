import { motion } from 'framer-motion'

const ALL_ACHIEVEMENTS = {
  first_day: {
    emoji: '🌟',
    title: 'First Day Champion',
    description: 'Complete your first day of tracking',
  },
  streak_3: {
    emoji: '🔥',
    title: '3-Day Streak',
    description: 'Stay consistent for 3 days',
  },
  streak_7: {
    emoji: '⭐',
    title: 'Weekly Warrior',
    description: 'Maintain a 7-day streak',
  },
  goal_crusher: {
    emoji: '💪',
    title: 'Goal Crusher',
    description: 'Meet your daily goal 5 times',
  },
  hydration_hero: {
    emoji: '🏆',
    title: 'Hydration Hero',
    description: 'Consume 50,000ml total',
  },
}

type Props = {
  achievements: Array<{
    id: number
    achievement_type: string
    achievement_name: string
    achieved_at: string
  }>
}

export default function Achievements({ achievements }: Props) {
  const achievedTypes = new Set(achievements.map((a) => a.achievement_type))

  const achievementEntries = Object.entries(ALL_ACHIEVEMENTS) as Array<
    [string, { emoji: string; title: string; description: string }]
  >

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="rounded-2xl bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 p-8 shadow-lg"
    >
      <h2 className="text-2xl font-bold text-slate-900 mb-6">🏅 Achievements</h2>

      <div className="grid grid-cols-1 gap-4">
        {achievementEntries.map(([key, achievement], index) => {
          const isAchieved = achievedTypes.has(key)
          const achievedDate = achievements.find((a) => a.achievement_type === key)?.achieved_at

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 * (index + 1) }}
              className={`p-4 rounded-xl border-2 transition-all ${
                isAchieved
                  ? 'bg-white border-yellow-300 shadow-md'
                  : 'bg-white/50 border-gray-300 opacity-60'
              }`}
            >
              <div className="flex items-start gap-4">
                <motion.span
                  animate={isAchieved ? { scale: [1, 1.2, 1] } : {}}
                  transition={isAchieved ? { duration: 2, repeat: Infinity } : {}}
                  className="text-3xl"
                >
                  {achievement.emoji}
                </motion.span>
                <div className="flex-1">
                  <h4 className={`font-bold ${isAchieved ? 'text-slate-900' : 'text-slate-500'}`}>
                    {achievement.title}
                  </h4>
                  <p className={`text-sm ${isAchieved ? 'text-slate-600' : 'text-slate-400'}`}>
                    {achievement.description}
                  </p>
                  {isAchieved && achievedDate && (
                    <p className="text-xs text-blue-600 mt-2">
                      ✓ Achieved on {new Date(achievedDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
                {isAchieved && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="text-xl">
                    ✓
                  </motion.div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {achievements.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-6"
        >
          <p className="text-slate-600">Start tracking to unlock achievements! 🎯</p>
        </motion.div>
      )}

      <div className="mt-6 p-4 bg-yellow-100 rounded-lg border border-yellow-300">
        <p className="text-sm text-yellow-800">
          🎯 <strong>Keep going!</strong> You have {5 - achievements.length} achievements to unlock!
        </p>
      </div>
    </motion.div>
  )
}
