import React, { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Users as UsersIcon,
  Activity,
  Database,
  Calendar,
  CheckCircle,
  TrendingUp,
  AlertCircle,
  Percent,
  Clock,
  ArrowRight,
  RefreshCw,
} from 'lucide-react'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import { API_BASE } from '../../utils/adminConfig'

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [charts, setCharts] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  async function loadData() {
    setLoading(true)
    try {
      const [statsRes, chartsRes] = await Promise.all([
        axios.get(`${API_BASE}/admin/dashboard/stats/`),
        axios.get(`${API_BASE}/admin/dashboard/charts/`),
      ])
      setStats(statsRes.data)
      setCharts(chartsRes.data)
    } catch {
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const chartOptions = { responsive: true, maintainAspectRatio: false }

  const line7DaysData = {
    labels: charts?.water_7_days?.map((d: any) => d.date) || [],
    datasets: [{
      fill: true,
      label: 'Total Consumed (ml)',
      data: charts?.water_7_days?.map((d: any) => d.amount) || [],
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4,
    }],
  }

  const line30DaysData = {
    labels: charts?.water_30_days?.map((d: any) => d.date) || [],
    datasets: [{
      fill: true,
      label: 'Total Consumed (ml)',
      data: charts?.water_30_days?.map((d: any) => d.amount) || [],
      borderColor: '#14b8a6',
      backgroundColor: 'rgba(20, 184, 166, 0.1)',
      tension: 0.3,
    }],
  }

  const goalCompletionData = {
    labels: charts?.goal_completion_rate?.map((d: any) => d.date) || [],
    datasets: [{
      label: 'Goal Completion %',
      data: charts?.goal_completion_rate?.map((d: any) => d.rate) || [],
      borderColor: '#a855f7',
      backgroundColor: 'rgba(168, 85, 247, 0.15)',
      fill: true,
      tension: 0.4,
    }],
  }

  const barDAUData = {
    labels: charts?.dau?.map((d: any) => d.date) || [],
    datasets: [{
      label: 'Active Users',
      data: charts?.dau?.map((d: any) => d.count) || [],
      backgroundColor: '#8b5cf6',
      borderRadius: 8,
    }],
  }

  const weeklyGrowthData = {
    labels: charts?.user_growth?.map((d: any) => d.week) || [],
    datasets: [{
      label: 'New Users',
      data: charts?.user_growth?.map((d: any) => d.new_users) || [],
      backgroundColor: '#06b6d4',
      borderRadius: 8,
    }],
  }

  const monthlyGrowthData = {
    labels: charts?.monthly_user_growth?.map((d: any) => d.month) || [],
    datasets: [{
      label: 'New Users',
      data: charts?.monthly_user_growth?.map((d: any) => d.new_users) || [],
      borderColor: '#f59e0b',
      backgroundColor: 'rgba(245, 158, 11, 0.15)',
      fill: true,
      tension: 0.3,
    }],
  }

  const top10Data = {
    labels: charts?.top_10?.map((d: any) => d.username) || [],
    datasets: [{
      label: 'Total Water (ml)',
      data: charts?.top_10?.map((d: any) => d.total_water) || [],
      backgroundColor: '#3b82f6',
      borderRadius: 6,
    }],
  }

  const activeHoursData = {
    labels: charts?.active_hours?.map((d: any) => d.hour) || [],
    datasets: [{
      label: 'Log Count',
      data: charts?.active_hours?.map((d: any) => d.count) || [],
      backgroundColor: '#14b8a6',
      borderRadius: 6,
    }],
  }

  const doughnutDistData = {
    labels: charts?.distribution?.map((d: any) => d.range) || [],
    datasets: [{
      data: charts?.distribution?.map((d: any) => d.count) || [],
      backgroundColor: ['#3b82f6', '#14b8a6', '#a855f7'],
      borderWidth: 0,
    }],
  }

  const cards = [
    { name: 'Total Users', value: stats?.total_users, icon: UsersIcon, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/20' },
    { name: 'Active Users (7d)', value: stats?.active_users, icon: Activity, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' },
    { name: 'Total Records', value: stats?.total_records, icon: Database, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/20' },
    { name: "Today's Entries", value: stats?.today_entries, icon: Calendar, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20' },
    { name: 'Goal Met Today', value: stats?.completed_today, icon: CheckCircle, color: 'text-teal-500 bg-teal-50 dark:bg-teal-950/20' },
    { name: 'Avg Water Daily', value: `${stats?.avg_daily_intake} ml`, icon: TrendingUp, color: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-950/20' },
    { name: 'Users Below Goal', value: stats?.users_below_goal, icon: AlertCircle, color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/20' },
    { name: 'Avg Goal Completion', value: `${stats?.avg_goal_completion_pct}%`, icon: Percent, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20' },
    { name: 'New Users (Week)', value: stats?.new_users_week, icon: Clock, color: 'text-pink-500 bg-pink-50 dark:bg-pink-950/20' },
  ]

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Real-time water tracker analytics and activity stats</p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, idx) => {
          const Icon = card.icon
          return (
            <motion.div
              key={card.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ y: -4 }}
              className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl flex items-center justify-between shadow-sm"
            >
              <div className="space-y-1">
                <span className="text-sm font-semibold text-slate-400">{card.name}</span>
                <h3 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">{card.value}</h3>
              </div>
              <div className={`p-4 rounded-2xl ${card.color}`}>
                <Icon className="h-6 w-6" />
              </div>
            </motion.div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {[
          { title: 'Water Consumption (Last 7 Days)', data: line7DaysData, Chart: Line },
          { title: 'Water Consumption (Last 30 Days)', data: line30DaysData, Chart: Line },
          { title: 'Goal Completion Rate', data: goalCompletionData, Chart: Line },
          { title: 'Daily Active Users', data: barDAUData, Chart: Bar },
          { title: 'Weekly User Growth', data: weeklyGrowthData, Chart: Bar },
          { title: 'Monthly User Growth', data: monthlyGrowthData, Chart: Line },
          { title: 'Top 10 Hydrated Users', data: top10Data, Chart: Bar },
          { title: 'Most Active Hours', data: activeHoursData, Chart: Bar },
        ].map(({ title, data, Chart }) => (
          <div key={title} className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">{title}</h3>
            <div className="h-64">
              <Chart data={data} options={chartOptions} />
            </div>
          </div>
        ))}

        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm flex flex-col md:flex-row items-center justify-between">
          <div className="w-full md:w-1/2">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Consumption Distribution</h3>
            <p className="text-sm text-slate-400 mb-2">Water logging volume breakdown</p>
            <p className="text-2xl font-bold text-blue-500">{charts?.avg_water_per_user?.toLocaleString()} ml</p>
            <p className="text-xs text-slate-400">Avg per user (lifetime)</p>
          </div>
          <div className="w-full md:w-1/2 h-52 flex justify-center">
            <Doughnut data={doughnutDistData} options={chartOptions} />
          </div>
        </div>
      </div>

      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Inactive Users</h3>
            <p className="text-sm text-slate-400">Users who haven&apos;t logged water in the last 7 days</p>
          </div>
          <Link to="/admin/users" className="flex items-center gap-1 text-blue-500 text-sm font-semibold hover:underline">
            View All Users <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="py-3 px-4 font-semibold text-slate-500 text-sm">Username</th>
                <th className="py-3 px-4 font-semibold text-slate-500 text-sm">Email</th>
                <th className="py-3 px-4 font-semibold text-slate-500 text-sm">Last Login</th>
              </tr>
            </thead>
            <tbody>
              {stats?.inactive_users?.length > 0 ? (
                stats.inactive_users.map((u: any) => (
                  <tr key={u.id} className="border-b border-slate-100 dark:border-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-3 px-4 font-medium text-sm">{u.username}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-sm">{u.email}</td>
                    <td className="py-3 px-4 text-slate-500 text-sm">
                      {u.last_login ? new Date(u.last_login).toLocaleDateString() : 'Never'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-slate-400 text-sm">
                    No inactive users detected.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
