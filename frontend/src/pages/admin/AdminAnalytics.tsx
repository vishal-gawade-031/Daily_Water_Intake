import React, { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { TrendingUp, Clock, ThumbsUp, ThumbsDown, Award } from 'lucide-react'
import { Bar, Line } from 'react-chartjs-2'
import { API_BASE } from '../../utils/adminConfig'

export default function AdminAnalytics() {
  const [stats, setStats] = useState<any>(null)
  const [charts, setCharts] = useState<any>(null)
  const [leaders, setLeaders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [statsRes, chartsRes, leadersRes] = await Promise.all([
          axios.get(`${API_BASE}/admin/dashboard/stats/`),
          axios.get(`${API_BASE}/admin/dashboard/charts/`),
          axios.get(`${API_BASE}/leaderboard/`),
        ])
        setStats(statsRes.data)
        setCharts(chartsRes.data)
        setLeaders(leadersRes.data)
      } catch {
        toast.error('Failed to load analytics')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
          <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
        </div>
      </div>
    )
  }

  const chartOptions = { responsive: true, maintainAspectRatio: false }

  const activeHoursChart = {
    labels: charts?.active_hours?.map((h: any) => h.hour) || [],
    datasets: [{
      label: 'Logs Count',
      data: charts?.active_hours?.map((h: any) => h.count) || [],
      backgroundColor: '#14b8a6',
      borderRadius: 8,
    }],
  }

  const weeklyIntakeChart = {
    labels: charts?.water_7_days?.map((d: any) => d.date) || [],
    datasets: [{
      label: 'Avg Intake (ml)',
      data: charts?.water_7_days?.map((d: any) => d.amount) || [],
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true,
      tension: 0.4,
    }],
  }

  const monthlyIntakeChart = {
    labels: charts?.water_30_days?.slice(-12).map((d: any) => d.date) || [],
    datasets: [{
      label: 'Daily Total (ml)',
      data: charts?.water_30_days?.slice(-12).map((d: any) => d.amount) || [],
      borderColor: '#a855f7',
      backgroundColor: 'rgba(168, 85, 247, 0.1)',
      fill: true,
      tension: 0.3,
    }],
  }

  let peakTime = 'No data'
  if (charts?.active_hours?.length > 0) {
    const maxHour = charts.active_hours.reduce((prev: any, cur: any) => (prev.count > cur.count ? prev : cur))
    peakTime = maxHour.hour
  }

  const topPerformers = leaders.slice(0, 5)
  const leastActive = stats?.inactive_users || []
  const heatmap = charts?.heatmap || []
  const weekdayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">Deep Analytics</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Advanced insights into hydration peaks, user consistency, and usage trends</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-blue-50 dark:bg-blue-950/20 text-blue-500 rounded-2xl"><TrendingUp className="h-6 w-6" /></div>
          <div>
            <span className="text-xs text-slate-500 font-semibold block">Average Water Intake</span>
            <span className="text-xl font-extrabold">{stats?.avg_daily_intake} ml</span>
          </div>
        </div>
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-teal-50 dark:bg-teal-950/20 text-teal-500 rounded-2xl"><Clock className="h-6 w-6" /></div>
          <div>
            <span className="text-xs text-slate-500 font-semibold block">Peak Usage Time</span>
            <span className="text-xl font-extrabold">{peakTime}</span>
          </div>
        </div>
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-purple-50 dark:bg-purple-950/20 text-purple-500 rounded-2xl"><Award className="h-6 w-6" /></div>
          <div>
            <span className="text-xs text-slate-500 font-semibold block">Goal Completion Rate</span>
            <span className="text-xl font-extrabold">{stats?.avg_goal_completion_pct}%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm">
          <h3 className="text-lg font-bold mb-4">Water Logging Frequency (Hourly)</h3>
          <div className="h-64"><Bar data={activeHoursChart} options={chartOptions} /></div>
        </div>
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm">
          <h3 className="text-lg font-bold mb-4">Average Intake by Week</h3>
          <div className="h-64"><Line data={weeklyIntakeChart} options={chartOptions} /></div>
        </div>
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm lg:col-span-2">
          <h3 className="text-lg font-bold mb-4">Average Intake by Month (Last 12 Days Sample)</h3>
          <div className="h-64"><Line data={monthlyIntakeChart} options={chartOptions} /></div>
        </div>
      </div>

      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm">
        <h3 className="text-lg font-bold mb-2">Hydration Heatmap (Last 4 Weeks)</h3>
        <p className="text-sm text-slate-400 mb-4">Daily water consumption intensity</p>
        <div className="overflow-x-auto">
          <div className="grid grid-cols-8 gap-2 min-w-[500px]">
            <div />
            {weekdayLabels.map((d) => (
              <div key={d} className="text-center text-xs font-semibold text-slate-400">{d}</div>
            ))}
            {[1, 2, 3, 4].map((week) => (
              <React.Fragment key={week}>
                <div className="text-xs font-semibold text-slate-400 flex items-center">W{week}</div>
                {weekdayLabels.map((day) => {
                  const cell = heatmap.find((c: any) => c.week === week && c.day === day)
                  const intensity = cell?.intensity ?? 0
                  return (
                    <motion.div
                      key={`${week}-${day}`}
                      whileHover={{ scale: 1.05 }}
                      style={{ backgroundColor: `rgba(59, 130, 246, ${Math.max(0.08, intensity)})` }}
                      className="h-10 rounded-lg flex items-center justify-center text-[10px] text-white/80"
                      title={cell ? `${cell.date}: ${cell.total}ml` : 'No data'}
                    >
                      {cell?.total ? `${Math.round(cell.total / 1000)}L` : ''}
                    </motion.div>
                  )
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><ThumbsUp className="h-5 w-5 text-emerald-500" /> Most Consistent Users</h3>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {topPerformers.map((user, idx) => (
              <div key={user.username} className="flex justify-between items-center py-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-extrabold text-slate-400">#{idx + 1}</span>
                  <span className="font-semibold text-sm">{user.username}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-amber-500 font-bold block">🔥 {user.current_streak} days</span>
                  <span className="text-[11px] text-slate-400 block">{user.total_water} ml</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><ThumbsDown className="h-5 w-5 text-rose-500" /> Least Active Users</h3>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {leastActive.length > 0 ? leastActive.slice(0, 5).map((user: any) => (
              <div key={user.username} className="flex justify-between items-center py-3">
                <span className="font-semibold text-sm">{user.username}</span>
                <span className="text-xs text-slate-400">
                  Last active: {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                </span>
              </div>
            )) : (
              <div className="py-6 text-center text-slate-400 text-sm">No flagged inactive users.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
