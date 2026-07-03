import React, { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { ClipboardList, User, ShieldAlert, Cpu, Search } from 'lucide-react'
import { API_BASE } from '../../utils/adminConfig'
import { extractList } from '../../utils/adminApi'

export default function AdminActivityLogs() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState('')

  async function loadLogs() {
    setLoading(true)
    try {
      const res = await axios.get(`${API_BASE}/admin/activity-logs/`, {
        params: { search, action: actionFilter },
      })
      setLogs(extractList(res.data))
    } catch {
      toast.error('Failed to load activity logs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLogs()
  }, [search, actionFilter])

  function actionIcon(action: string) {
    if (action.includes('USER_')) return <User className="h-4 w-4 text-blue-500" />
    if (action.includes('SETTINGS_') || action.includes('DATABASE_')) return <Cpu className="h-4 w-4 text-emerald-500" />
    return <ShieldAlert className="h-4 w-4 text-amber-500" />
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">Audit Trails & Logs</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Monitor system executions, modifications, and admin operations</p>
      </div>

      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm outline-none"
          />
        </div>
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm outline-none"
        >
          <option value="">All Actions</option>
          <option value="USER">User Actions</option>
          <option value="WATER_RECORD">Water Records</option>
          <option value="NOTIFICATION">Notifications</option>
          <option value="SETTINGS">Settings</option>
          <option value="DATABASE">Database</option>
        </select>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center">
          <span className="text-sm font-bold text-slate-600 dark:text-slate-300">System Logs ({logs.length})</span>
          <button onClick={loadLogs} className="text-xs text-blue-500 font-semibold hover:underline">Refresh</button>
        </div>

        {loading ? (
          <div className="p-20 flex justify-center"><div className="animate-spin h-8 w-8 border-3 border-blue-500 border-t-transparent rounded-full" /></div>
        ) : logs.length === 0 ? (
          <div className="p-20 text-center text-slate-400 text-sm">No activity logs found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="py-3.5 px-6 font-semibold text-slate-500 text-sm">Action</th>
                  <th className="py-3.5 px-6 font-semibold text-slate-500 text-sm">Admin</th>
                  <th className="py-3.5 px-6 font-semibold text-slate-500 text-sm">IP Address</th>
                  <th className="py-3.5 px-6 font-semibold text-slate-500 text-sm">Details</th>
                  <th className="py-3.5 px-6 font-semibold text-slate-500 text-sm">Time</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-slate-100 dark:border-slate-900 hover:bg-slate-50/30">
                    <td className="py-4 px-6 text-sm font-semibold">
                      <span className="flex items-center gap-2">{actionIcon(log.action)} {log.action}</span>
                    </td>
                    <td className="py-4 px-6 text-sm">{log.username || 'System'}</td>
                    <td className="py-4 px-6 text-sm text-slate-500">{log.ip_address || '—'}</td>
                    <td className="py-4 px-6 text-xs text-slate-500 max-w-xs truncate" title={log.details}>{log.details || '—'}</td>
                    <td className="py-4 px-6 text-xs text-slate-400">{new Date(log.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
