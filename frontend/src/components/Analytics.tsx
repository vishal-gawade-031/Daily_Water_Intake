import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const API_BASE = 'http://127.0.0.1:8000/api'

type AnalyticsData = {
  date: string
  total_ml: number
  goal_ml: number
  percentage: number
}

type Props = {
  refreshKey?: number
}

export default function Analytics({ refreshKey = 0 }: Props) {
  const [data, setData] = useState<AnalyticsData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
  }, [refreshKey])

  const loadAnalytics = async () => {
    try {
      const res = await axios.get(`${API_BASE}/analytics/seven-days/`)
      setData(res.data)
    } catch (error) {
      console.error('Failed to load analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return null

  const chartData = {
    labels: data.map((d) => new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' })),
    datasets: [
      {
        label: 'Consumed (ml)',
        data: data.map((d) => d.total_ml),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
      {
        label: 'Daily Goal (ml)',
        data: data.map((d) => d.goal_ml),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: false,
        borderDash: [5, 5],
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#10b981',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
    ],
  }

  const options: any = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { size: 12, weight: 'bold' },
          usePointStyle: true,
          padding: 20,
        },
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: { font: { size: 11 } },
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 } },
      },
    },
  }

  const avgMl = Math.round(data.reduce((sum, d) => sum + d.total_ml, 0) / data.length)
  const goalsReached = data.filter((d) => d.total_ml >= d.goal_ml).length

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="rounded-2xl bg-white p-8 shadow-lg"
    >
      <h2 className="text-2xl font-bold text-slate-900 mb-2">📊 Last 7 Days Analytics</h2>
      <p className="text-slate-600 mb-6">Your hydration journey over the past week</p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
          <p className="text-sm text-slate-600 mb-1">Average Daily</p>
          <p className="text-2xl font-bold text-blue-600">{avgMl}ml</p>
        </div>
        <div className="p-4 rounded-lg bg-green-50 border border-green-200">
          <p className="text-sm text-slate-600 mb-1">Goals Reached</p>
          <p className="text-2xl font-bold text-green-600">{goalsReached}/7</p>
        </div>
        <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
          <p className="text-sm text-slate-600 mb-1">Total Intake</p>
          <p className="text-2xl font-bold text-purple-600">{data.reduce((sum, d) => sum + d.total_ml, 0)}ml</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-gray-50 rounded-xl p-6">
        <Line data={chartData} options={options} />
      </div>
    </motion.div>
  )
}
