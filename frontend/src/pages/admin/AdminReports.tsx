import React, { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import {
  FileText,
  Download,
  Calendar,
  Layers,
  Printer,
  TrendingUp,
  Users,
  Database
} from 'lucide-react'
import { Line } from 'react-chartjs-2'

import { API_BASE } from '../../utils/adminConfig'
import { downloadAuthenticatedFile } from '../../utils/adminApi'

export default function AdminReports() {
  const [reportType, setReportType] = useState('weekly')
  const [reportData, setReportData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  async function loadReport() {
    setLoading(true)
    try {
      const res = await axios.get(`${API_BASE}/admin/reports/`, {
        params: {
          type: reportType
        }
      })
      setReportData(res.data)
    } catch (err) {
      toast.error('Failed to load report data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReport()
  }, [reportType])

  // Export
  async function triggerExport(format: string) {
    try {
      await downloadAuthenticatedFile(
        '/admin/reports/',
        { format, type: reportType },
        `water_report_${reportType}.${format === 'excel' ? 'xls' : 'csv'}`
      )
      toast.success(`Exported report as ${format.toUpperCase()}`)
    } catch {
      toast.error('Export failed')
    }
  }

  // Local print trigger
  function handlePrint() {
    window.print()
  }

  // Setup report chart
  const reportChartData = {
    labels: reportData?.table_data?.slice(0, 10).map((r: any) => r.date) || [],
    datasets: [
      {
        label: 'Intake Amount (ml)',
        data: reportData?.table_data?.slice(0, 10).map((r: any) => r.amount_ml) || [],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        fill: true,
        tension: 0.3
      }
    ]
  }

  return (
    <div className="space-y-8 print:p-0 print:space-y-4">
      {/* Header (hidden on print if we want, or styled for print) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">System Reports</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Audit summaries, download logs, and export charts to print</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-semibold shadow-md shadow-blue-500/25 transition-all"
          >
            <Printer className="h-4 w-4" /> Print PDF
          </button>
          <button
            onClick={() => triggerExport('csv')}
            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-350 hover:bg-slate-50 shadow-sm transition-all"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Select Report Range */}
      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex gap-2 w-fit print:hidden">
        {['daily', 'weekly', 'monthly', 'yearly'].map((type) => (
          <button
            key={type}
            onClick={() => setReportType(type)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all ${
              reportType === type
                ? 'bg-blue-500 text-white shadow-md'
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Printable Report Title Header */}
          <div className="hidden print:block text-center border-b pb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
              AquaAdmin - Hydration Tracker Report
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Generated range: {reportData?.summary?.start_date} to {reportData?.summary?.end_date}
            </p>
          </div>

          {/* Quick Metrics Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm text-center">
              <span className="text-xs font-semibold text-slate-450 dark:text-slate-500 uppercase block mb-1">Total Consumed</span>
              <span className="text-2xl font-black text-blue-500 block">{(reportData?.summary?.total_water_ml / 1000).toFixed(1)} L</span>
            </div>

            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm text-center">
              <span className="text-xs font-semibold text-slate-450 dark:text-slate-500 uppercase block mb-1">Total Logs</span>
              <span className="text-2xl font-black text-slate-800 dark:text-slate-150 block">{reportData?.summary?.total_logs}</span>
            </div>

            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm text-center">
              <span className="text-xs font-semibold text-slate-450 dark:text-slate-500 uppercase block mb-1">Unique Hydrators</span>
              <span className="text-2xl font-black text-emerald-500 block">{reportData?.summary?.unique_users}</span>
            </div>

            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm text-center">
              <span className="text-xs font-semibold text-slate-450 dark:text-slate-500 uppercase block mb-1">Average per Log</span>
              <span className="text-2xl font-black text-purple-500 block">{reportData?.summary?.avg_per_log_ml} ml</span>
            </div>
          </div>

          {/* Report Chart (Hidden on small mobile screens to keep print clean) */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm print:break-inside-avoid">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Intake Intensity Graph</h3>
            <div className="h-64">
              <Line data={reportChartData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>

          {/* Records Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden print:border-none print:shadow-none">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 print:px-0">
              <span className="text-sm font-bold text-slate-650 dark:text-slate-350">Report Records Audit Trail</span>
            </div>

            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30">
                  <th className="py-3 px-6 font-semibold text-slate-500 dark:text-slate-400 text-sm">Username</th>
                  <th className="py-3 px-6 font-semibold text-slate-500 dark:text-slate-400 text-sm">Date Logged</th>
                  <th className="py-3 px-6 font-semibold text-slate-500 dark:text-slate-400 text-sm">Amount</th>
                  <th className="py-3 px-6 font-semibold text-slate-500 dark:text-slate-400 text-sm">Target Goal</th>
                  <th className="py-3 px-6 font-semibold text-slate-500 dark:text-slate-400 text-sm">Notes</th>
                </tr>
              </thead>
              <tbody>
                {reportData?.table_data?.map((row: any, idx: number) => (
                  <tr key={idx} className="border-b border-slate-100 dark:border-slate-900 hover:bg-slate-50/30">
                    <td className="py-3 px-6 text-slate-800 dark:text-slate-200 text-sm font-medium">{row.username}</td>
                    <td className="py-3 px-6 text-slate-600 dark:text-slate-400 text-sm">{row.date}</td>
                    <td className="py-3 px-6 text-slate-800 dark:text-slate-100 font-bold text-sm">{row.amount_ml}ml</td>
                    <td className="py-3 px-6 text-slate-500 dark:text-slate-450 text-sm">{row.goal}ml</td>
                    <td className="py-3 px-6 text-slate-550 dark:text-slate-500 text-xs italic">{row.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
