import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { motion } from 'framer-motion'
import { Trophy, Award, Flame, Target, User } from 'lucide-react'

import { API_BASE } from '../../utils/adminConfig'

export default function AdminLeaderboard() {
  const [leaders, setLeaders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadLeaderboard() {
      try {
        const res = await axios.get(`${API_BASE}/leaderboard/`)
        setLeaders(res.data)
      } catch (err) {
        console.error('Failed to load leaderboard:', err)
      } finally {
        setLoading(false)
      }
    }
    loadLeaderboard()
  }, [])

  if (loading) {
    return (
      <div className="p-20 text-center flex justify-center items-center">
        <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  // Top 3 winners
  const topThree = leaders.slice(0, 3)
  const remainder = leaders.slice(3)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">Leaderboard</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Celebrate the most hydrated champions in the community</p>
      </div>

      {/* TOP 3 PODIUM */}
      {topThree.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end max-w-4xl mx-auto pt-6">
          {/* 2nd place (Silver) */}
          {topThree[1] && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              whileHover={{ y: -5 }}
              className="order-2 md:order-1 flex flex-col items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 text-center shadow-sm relative overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-1.5 bg-slate-300" />
              <div className="p-4 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full mb-4 ring-4 ring-slate-200">
                <Trophy className="h-8 w-8" />
              </div>
              <span className="text-xs font-semibold text-slate-450 dark:text-slate-500 uppercase">2nd Place</span>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mt-1">{topThree[1].username}</h3>
              <span className="text-amber-500 font-bold flex items-center gap-1 mt-2 text-sm">
                <Flame className="h-4 w-4" /> {topThree[1].current_streak} days
              </span>
              <div className="mt-4 px-4 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-bold text-slate-600 dark:text-slate-350">
                {topThree[1].total_water} ml
              </div>
            </motion.div>
          )}

          {/* 1st place (Gold) */}
          {topThree[0] && (
            <motion.div
              initial={{ opacity: 0, y: 35 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0 }}
              whileHover={{ y: -5 }}
              className="order-1 md:order-2 flex flex-col items-center bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/50 rounded-3xl p-8 text-center shadow-lg relative overflow-hidden ring-2 ring-blue-500/20"
            >
              <div className="absolute top-0 inset-x-0 h-1.5 bg-amber-400" />
              <div className="p-5 bg-amber-50 dark:bg-amber-950/20 text-amber-500 rounded-full mb-4 ring-4 ring-amber-100 dark:ring-amber-900/35">
                <Trophy className="h-10 w-10 animate-bounce" />
              </div>
              <span className="text-xs font-semibold text-amber-500 uppercase tracking-widest">Hydration King</span>
              <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 mt-1">{topThree[0].username}</h3>
              <span className="text-amber-500 font-bold flex items-center gap-1 mt-2 text-sm">
                <Flame className="h-4 w-4" /> {topThree[0].current_streak} days streak
              </span>
              <div className="mt-4 px-6 py-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full text-sm font-bold shadow-md shadow-blue-500/15">
                {topThree[0].total_water} ml
              </div>
            </motion.div>
          )}

          {/* 3rd place (Bronze) */}
          {topThree[2] && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ y: -5 }}
              className="order-3 flex flex-col items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 text-center shadow-sm relative overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-1.5 bg-orange-400" />
              <div className="p-4 bg-orange-50 dark:bg-orange-950/20 text-orange-650 rounded-full mb-4 ring-4 ring-orange-100 dark:ring-orange-950/30">
                <Trophy className="h-8 w-8" />
              </div>
              <span className="text-xs font-semibold text-slate-450 dark:text-slate-500 uppercase">3rd Place</span>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mt-1">{topThree[2].username}</h3>
              <span className="text-amber-500 font-bold flex items-center gap-1 mt-2 text-sm">
                <Flame className="h-4 w-4" /> {topThree[2].current_streak} days
              </span>
              <div className="mt-4 px-4 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-bold text-slate-600 dark:text-slate-350">
                {topThree[2].total_water} ml
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* REMAINDER RANKINGS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm max-w-4xl mx-auto overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <span className="text-sm font-bold text-slate-500 dark:text-slate-400">All rankings</span>
        </div>
        
        {remainder.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            Top 3 are the only champions logged in the app.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {remainder.map((user, idx) => (
              <motion.div
                key={user.username}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all"
              >
                <div className="flex items-center gap-4">
                  <span className="text-sm font-extrabold text-slate-400 dark:text-slate-500 w-6">#{idx + 4}</span>
                  <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <User className="h-5 w-5 text-slate-505" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{user.username}</h4>
                    <span className="text-xs text-slate-400 font-semibold">{user.email}</span>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="text-right hidden sm:block">
                    <span className="text-xs text-slate-400 font-semibold block">Goal Completed</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                      <Target className="h-3.5 w-3.5 text-blue-500" /> {user.goal_completion_pct}%
                    </span>
                  </div>
                  
                  <div className="text-right">
                    <span className="text-xs text-slate-400 font-semibold block">Intake</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{user.total_water} ml</span>
                  </div>

                  <div className="text-center w-24">
                    <span className="inline-block px-3 py-1 text-xs font-bold text-blue-700 bg-blue-50 dark:bg-blue-950/20 rounded-full">
                      {user.badge}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
