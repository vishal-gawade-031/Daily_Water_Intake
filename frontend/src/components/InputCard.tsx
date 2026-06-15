import { motion } from 'framer-motion'
import { useState } from 'react'

type Props = {
  selectedDate: string
  setSelectedDate: (date: string) => void
  amount: number
  setAmount: (amount: number) => void
  notes: string
  setNotes: (notes: string) => void
  onAddEntry: () => void
}

const quickAmounts = [250, 500, 750, 1000]

export default function InputCard({
  selectedDate,
  setSelectedDate,
  amount,
  setAmount,
  notes,
  setNotes,
  onAddEntry,
}: Props) {
  const [isHovering, setIsHovering] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl bg-white p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
    >
      <div className="mb-6 flex items-center gap-2">
        <span className="text-2xl">📝</span>
        <h2 className="text-xl font-bold text-slate-900">Add Entry</h2>
      </div>

      <div className="space-y-4">
        {/* Date Input */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="grid gap-2"
        >
          <label className="text-sm font-semibold text-slate-700">Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="rounded-xl border-2 border-blue-200 bg-blue-50 px-4 py-3 text-slate-900 font-medium focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors"
          />
        </motion.div>

        {/* Amount Input */}
        <div className="grid gap-2">
          <label className="text-sm font-semibold text-slate-700">
            Amount (ml): <span className="text-blue-600 font-bold">{amount}</span>
          </label>
          <input
            type="range"
            min="50"
            max="2000"
            step="50"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="h-3 w-full cursor-pointer rounded-lg bg-gradient-to-r from-blue-400 to-teal-400 appearance-none accent-blue-600"
          />
          <div className="text-xs text-slate-500 text-center">(50 - 2000 ml)</div>
        </div>

        {/* Quick Amount Buttons */}
        <div className="grid grid-cols-4 gap-2">
          {quickAmounts.map((q) => (
            <motion.button
              key={q}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setAmount(q)}
              className={`rounded-lg py-2 text-sm font-semibold transition-all ${
                amount === q
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              {q}
            </motion.button>
          ))}
        </div>

        {/* Notes Input */}
        <motion.div whileHover={{ scale: 1.02 }} className="grid gap-2">
          <label className="text-sm font-semibold text-slate-700">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes..."
            className="rounded-xl border-2 border-blue-200 bg-blue-50 px-4 py-3 text-slate-900 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors resize-none"
            rows={3}
          />
        </motion.div>

        {/* Add Entry Button */}
        <motion.button
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onAddEntry}
          className="relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-teal-500 py-3 font-bold text-white shadow-lg transition-shadow hover:shadow-xl"
        >
          <motion.span
            animate={{ x: isHovering ? 0 : -100 }}
            transition={{ type: 'spring', stiffness: 400 }}
            className="inline-block"
          >
            ✓
          </motion.span>
          <span className="ml-2">Add Water Entry</span>
        </motion.button>
      </div>
    </motion.div>
  )
}
