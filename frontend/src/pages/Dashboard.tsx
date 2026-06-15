import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import DailyProgress from '../components/DailyProgress'
import QuickAddButtons from '../components/QuickAddButtons'
import HydrationCoach from '../components/HydrationCoach'
import Analytics from '../components/Analytics'
import HydrationTips from '../components/HydrationTips'
import BestTimesToDrink from '../components/BestTimesToDrink'
import Achievements from '../components/Achievements'
import Footer from '../components/Footer'

const API_BASE = 'http://127.0.0.1:8000/api'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const [summary, setSummary] = useState(null)
  const [entries, setEntries] = useState([])
  const [achievements, setAchievements] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      const [summaryRes, entriesRes, achievementsRes] = await Promise.all([
        axios.get(`${API_BASE}/daily-summary/`),
        axios.get(`${API_BASE}/entries/`),
        axios.get(`${API_BASE}/achievements/`),
      ])
      setSummary(summaryRes.data)
      setEntries(entriesRes.data)
      setAchievements(achievementsRes.data)
    } catch (error) {
      console.error('Failed to load dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEntryAdded = () => {
    loadDashboard()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity }}
          className="h-12 w-12 border-4 border-blue-200 border-t-blue-600 rounded-full"
        />
      </div>
    )
  }

  const greeting = getGreeting()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">{greeting}</h1>
            <p className="text-blue-100 mt-1">Welcome back, {user?.username}! 💧</p>
          </div>
          <button
            onClick={logout}
            className="px-6 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-semibold transition-all backdrop-blur-sm"
          >
            Logout
          </button>
        </div>
      </motion.header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Top Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Daily Progress */}
          <div className="lg:col-span-1">
            {summary && <DailyProgress summary={summary} />}
          </div>

          {/* Quick Add */}
          <div className="lg:col-span-2">
            <QuickAddButtons onEntryAdded={handleEntryAdded} />
          </div>
        </div>

        {/* Middle Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Hydration Coach */}
          <div className="lg:col-span-1">
            {summary && <HydrationCoach summary={summary} />}
          </div>

          {/* Tips */}
          <div className="lg:col-span-2">
            <HydrationTips />
          </div>
        </div>

        {/* Analytics */}
        <div className="mb-8">
          <Analytics />
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <BestTimesToDrink />
          <Achievements achievements={achievements} />
 
        </div>
                 
          <Footer/>
      </main>
    </div>
  )
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return '🌅 Good Morning'
  if (hour < 17) return '☀️ Good Afternoon'
  return '🌙 Good Evening'
}
