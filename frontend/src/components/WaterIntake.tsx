import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import Header from './Header'
import InputCard from './InputCard'
import EntriesList from './EntriesList'
import ProgressCard from './ProgressCard'

type Entry = {
  id: number
  date: string
  amount_ml: number
  notes: string
}

const API_BASE = 'http://127.0.0.1:8000/api'
const DAILY_GOAL = 2000

export default function WaterIntake() {
  const todayStr = useMemo(() => {
    const d = new Date()
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  }, [])

  const [selectedDate, setSelectedDate] = useState(todayStr)
  const [amount, setAmount] = useState<number>(250)
  const [notes, setNotes] = useState<string>('')

  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function loadEntries(date: string) {
    setLoading(true)
    setError(null)
    try {
      const res = await axios.get(`${API_BASE}/entries/`, {
        params: { date },
      })
      setEntries(res.data)
    } catch (e: any) {
      setError(e?.response?.data?.detail || e?.message || 'Failed to load entries')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEntries(selectedDate)
  }, [selectedDate])

  const totalMl = entries.reduce((sum, e) => sum + (e.amount_ml || 0), 0)
  const percentage = Math.min((totalMl / DAILY_GOAL) * 100, 100)

  async function addEntry() {
    setError(null)
    setSuccess(false)
    const payload = {
      date: selectedDate,
      amount_ml: amount,
      notes,
    }

    try {
      await axios.post(`${API_BASE}/entries/`, payload)
      setAmount(250)
      setNotes('')
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2000)
      await loadEntries(selectedDate)
    } catch (e: any) {
      setError(e?.response?.data?.detail || e?.message || 'Failed to add entry')
    }
  }

  async function deleteEntry(id: number) {
    setError(null)
    try {
      await axios.delete(`${API_BASE}/entries/${id}/`)
      await loadEntries(selectedDate)
    } catch (e: any) {
      setError(e?.response?.data?.detail || e?.message || 'Failed to delete entry')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
      <Header />

      <main className="mx-auto max-w-5xl px-4 py-12">
        {/* Error & Success Messages */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 rounded-lg bg-red-50 p-4 text-red-700 border border-red-200"
            >
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 rounded-lg bg-green-50 p-4 text-green-700 border border-green-200"
            >
              ✓ Entry added successfully!
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column: Input & Progress */}
          <div className="lg:col-span-1 space-y-8">
            <InputCard
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              amount={amount}
              setAmount={setAmount}
              notes={notes}
              setNotes={setNotes}
              onAddEntry={addEntry}
            />

            <ProgressCard totalMl={totalMl} percentage={percentage} dailyGoal={DAILY_GOAL} />
          </div>

          {/* Right Column: Entries List */}
          <div className="lg:col-span-2">
            <EntriesList entries={entries} loading={loading} onDelete={deleteEntry} />
          </div>
        </div>
      </main>
    </div>
  )
}
