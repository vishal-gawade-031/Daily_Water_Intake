import { motion, AnimatePresence } from 'framer-motion'

type Entry = {
  id: number
  date: string
  amount_ml: number
  notes: string
}

type Props = {
  entries: Entry[]
  loading: boolean
  onDelete: (id: number) => void
}

export default function EntriesList({ entries, loading, onDelete }: Props) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, x: 100 },
  }

  const totalEntries = entries.length
  const totalVolume = entries.reduce((sum, e) => sum + e.amount_ml, 0)

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl bg-white p-6 shadow-lg"
    >
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📊</span>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Today's Entries</h3>
            <p className="text-sm text-slate-600">
              {totalEntries} entry{totalEntries !== 1 ? 'ies' : ''} · {totalVolume}ml total
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity }}
            className="h-10 w-10 rounded-full border-4 border-blue-200 border-t-blue-600"
          />
        </div>
      ) : entries.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl bg-gradient-to-br from-blue-50 to-teal-50 p-8 text-center"
        >
          <p className="text-lg font-semibold text-slate-600">No entries yet today</p>
          <p className="mt-2 text-sm text-slate-500">Add your first water intake entry! 💧</p>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-3"
        >
          <AnimatePresence mode="popLayout">
            {entries.map((entry) => (
              <motion.div
                key={entry.id}
                variants={itemVariants}
                exit="exit"
                layout
                className="group rounded-xl border-2 border-blue-100 bg-gradient-to-r from-blue-50 to-teal-50 p-4 hover:border-blue-300 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <motion.div
                        animate={{ y: [0, -3, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="text-2xl"
                      >
                        💧
                      </motion.div>
                      <div>
                        <p className="text-2xl font-bold text-blue-600">{entry.amount_ml}ml</p>
                        <p className="text-sm text-slate-600">
                          {new Date(entry.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>

                    {entry.notes && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-3 rounded-lg bg-white/60 p-3 text-sm text-slate-700 italic"
                      >
                        "{entry.notes}"
                      </motion.div>
                    )}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onDelete(entry.id)}
                    className="ml-4 rounded-lg bg-red-100 p-2 text-red-600 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-200"
                    title="Delete entry"
                  >
                    ✕
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  )
}
