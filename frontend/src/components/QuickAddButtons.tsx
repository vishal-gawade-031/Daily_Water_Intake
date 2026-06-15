import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'

const API_BASE = 'http://127.0.0.1:8000/api'

const QUICK_AMOUNTS = [
  { label: '250ml', value: 250 },
  { label: '500ml', value: 500 },
  { label: '750ml', value: 750 },
  { label: '1000ml', value: 1000 },
]

type Props = {
  onEntryAdded: () => void
}

export default function QuickAddButtons({ onEntryAdded }: Props) {
  const [customAmount, setCustomAmount] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleAddWater = async (amount: number) => {
    setLoading(true)
    try {
      await axios.post(`${API_BASE}/entries/`, {
        amount_ml: amount,
        notes: notes || null,
      })
      setSuccess(true)
      setNotes('')
      onEntryAdded()
      setTimeout(() => setSuccess(false), 2000)
    } catch (error) {
      console.error('Failed to add entry:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCustomAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    const amount = parseInt(customAmount)
    if (amount > 0 && amount <= 5000) {
      await handleAddWater(amount)
      setCustomAmount('')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="rounded-2xl bg-white p-8 shadow-lg"
    >
      <h2 className="text-2xl font-bold text-slate-900 mb-6">💧 Add Water Intake</h2>

      {/* Success Message */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700"
          >
            ✓ Water intake recorded!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Add Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {QUICK_AMOUNTS.map((item, index) => (
          <motion.button
            key={item.value}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleAddWater(item.value)}
            disabled={loading}
            className="p-4 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 hover:from-blue-200 hover:to-cyan-200 border border-blue-300 font-semibold text-blue-700 transition-all disabled:opacity-50"
          >
            <div className="text-2xl mb-1">💧</div>
            {item.label}
          </motion.button>
        ))}
      </div>

      {/* Custom Amount */}
      <form onSubmit={handleCustomAdd} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Custom Amount (ml)
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              min="1"
              max="5000"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder="Enter amount in ml"
              className="flex-1 px-4 py-3 rounded-lg border-2 border-blue-200 focus:border-blue-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || !customAmount}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white rounded-lg font-semibold transition-all"
            >
              Add
            </button>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g., After workout, with meal..."
            className="w-full px-4 py-3 rounded-lg border-2 border-blue-200 focus:border-blue-400 focus:outline-none resize-none"
            rows={2}
          />
        </div>
      </form>
    </motion.div>
  )
}
