import React, { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Calendar,
  Filter,
  Download,
  Edit2,
  Trash2,
  X,
  Plus,
  Droplets,
  CheckCircle,
  XCircle
} from 'lucide-react'

import { API_BASE } from '../../utils/adminConfig'
import { extractPageInfo, downloadAuthenticatedFile } from '../../utils/adminApi'
import Pagination from '../../components/admin/Pagination'

export default function AdminRecords() {
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [minAmount, setMinAmount] = useState('')
  const [maxAmount, setMaxAmount] = useState('')
  const [sortBy, setSortBy] = useState('latest')
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  // Edit / Delete / Create states
  const [editingRecord, setEditingRecord] = useState<any>(null)
  const [editAmount, setEditAmount] = useState(250)
  const [editNotes, setEditNotes] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<any>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createForm, setCreateForm] = useState({ user_id: '', date: '', amount_ml: 500, notes: '' })

  async function loadRecords() {
    setLoading(true)
    try {
      const res = await axios.get(`${API_BASE}/admin/water-records/`, {
        params: {
          search,
          date: dateFilter,
          min_amount: minAmount,
          max_amount: maxAmount,
          sort_by: sortBy,
          page
        }
      })
      if (res.data.results) {
        setRecords(res.data.results)
        setTotalCount(extractPageInfo(res.data).count)
      } else {
        setRecords(res.data)
        setTotalCount(Array.isArray(res.data) ? res.data.length : 0)
      }
    } catch (err) {
      toast.error('Failed to load water records')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setPage(1)
  }, [search, dateFilter, minAmount, maxAmount, sortBy])

  useEffect(() => {
    loadRecords()
  }, [search, dateFilter, minAmount, maxAmount, sortBy, page])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    try {
      await axios.post(`${API_BASE}/admin/water-records/`, {
        user_id: Number(createForm.user_id),
        date: createForm.date || new Date().toISOString().slice(0, 10),
        amount_ml: createForm.amount_ml,
        notes: createForm.notes,
      })
      toast.success('Water record created')
      setShowCreateModal(false)
      setCreateForm({ user_id: '', date: '', amount_ml: 500, notes: '' })
      loadRecords()
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to create record')
    }
  }

  // Save modified record
  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editingRecord) return
    try {
      await axios.patch(`${API_BASE}/admin/water-records/${editingRecord.id}/`, {
        amount_ml: editAmount,
        notes: editNotes
      })
      toast.success('Water record updated successfully')
      setEditingRecord(null)
      loadRecords()
    } catch (err) {
      toast.error('Failed to update water record')
    }
  }

  // Delete record
  async function handleDelete() {
    if (!deleteConfirm) return
    try {
      await axios.delete(`${API_BASE}/admin/water-records/${deleteConfirm.id}/`)
      toast.success('Water record deleted successfully')
      setDeleteConfirm(null)
      loadRecords()
    } catch (err) {
      toast.error('Failed to delete water record')
    }
  }

  // Export reports
  async function handleExport(format: string) {
    try {
      await downloadAuthenticatedFile(
        '/admin/reports/',
        { format, type: 'weekly' },
        `water_records.${format === 'excel' ? 'xls' : 'csv'}`
      )
      toast.success(`Exported as ${format.toUpperCase()}`)
    } catch {
      toast.error('Export failed')
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">Water Intake Records</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Audit, modify, and export raw logs of water entries across all users</p>
        </div>

        {/* Exports */}
        <div className="flex gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-semibold shadow-md"
          >
            <Plus className="h-4 w-4" /> Add Record
          </button>
          <button
            onClick={() => handleExport('csv')}
            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-all"
          >
            <Download className="h-4 w-4" /> CSV
          </button>
          <button
            onClick={() => handleExport('excel')}
            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-all"
          >
            <Download className="h-4 w-4" /> Excel
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search user, email or note..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 outline-none text-sm focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all"
          />
        </div>

        <div className="grid grid-cols-2 md:flex items-center gap-4 w-full md:w-auto">
          {/* Date Picker */}
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 outline-none text-sm"
          />

          {/* Min Amount */}
          <input
            type="number"
            placeholder="Min ml"
            value={minAmount}
            onChange={(e) => setMinAmount(e.target.value)}
            className="px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 outline-none text-sm w-24"
          />

          {/* Max Amount */}
          <input
            type="number"
            placeholder="Max ml"
            value={maxAmount}
            onChange={(e) => setMaxAmount(e.target.value)}
            className="px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 outline-none text-sm w-24"
          />

          {/* Sort Selection */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 outline-none text-sm"
          >
            <option value="latest">Latest Logs</option>
            <option value="highest">Highest Intake</option>
            <option value="lowest">Lowest Intake</option>
          </select>
        </div>
      </div>

      {/* Table Data */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-20 text-center flex justify-center items-center">
            <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full" />
          </div>
        ) : records.length === 0 ? (
          <div className="p-20 text-center text-slate-400 dark:text-slate-500">
            No water records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                  <th className="py-4 px-6 font-semibold text-slate-500 dark:text-slate-400 text-sm">User</th>
                  <th className="py-4 px-6 font-semibold text-slate-500 dark:text-slate-400 text-sm">Date</th>
                  <th className="py-4 px-6 font-semibold text-slate-500 dark:text-slate-400 text-sm">Time</th>
                  <th className="py-4 px-6 font-semibold text-slate-500 dark:text-slate-400 text-sm">Amount</th>
                  <th className="py-4 px-6 font-semibold text-slate-500 dark:text-slate-400 text-sm">Goal Status</th>
                  <th className="py-4 px-6 font-semibold text-slate-500 dark:text-slate-400 text-sm">Notes</th>
                  <th className="py-4 px-6 font-semibold text-slate-500 dark:text-slate-400 text-sm text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((rec) => {
                  const metGoal = rec.amount_ml >= rec.daily_goal
                  return (
                    <tr key={rec.id} className="border-b border-slate-100 dark:border-slate-900 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all">
                      <td className="py-4 px-6 font-medium text-slate-800 dark:text-slate-200 text-sm">{rec.username}</td>
                      <td className="py-4 px-6 text-slate-600 dark:text-slate-400 text-sm">{rec.date}</td>
                      <td className="py-4 px-6 text-slate-500 dark:text-slate-400 text-sm">
                        {new Date(rec.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-4 px-6 text-slate-800 dark:text-slate-100 font-bold text-sm">
                        <span className="flex items-center gap-1">
                          <Droplets className="h-4 w-4 text-blue-500" /> {rec.amount_ml}ml
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full ${
                          metGoal 
                            ? 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/20' 
                            : 'text-amber-700 bg-amber-50 dark:bg-amber-950/20'
                        }`}>
                          {metGoal ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                          {metGoal ? 'Completed' : 'Under Goal'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-500 dark:text-slate-450 text-sm italic">
                        {rec.notes || '—'}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => {
                              setEditingRecord(rec)
                              setEditAmount(rec.amount_ml)
                              setEditNotes(rec.notes || '')
                            }}
                            className="p-1.5 hover:bg-amber-50 dark:hover:bg-amber-950/20 text-amber-500 rounded-lg transition-colors"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(rec)}
                            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={page} totalCount={totalCount} onPageChange={setPage} />
      </div>

      {/* CREATE MODAL */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 max-w-sm w-full shadow-2xl">
              <h3 className="text-lg font-bold mb-4">Create Water Record</h3>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">User ID</label>
                  <input type="number" required value={createForm.user_id} onChange={(e) => setCreateForm({ ...createForm, user_id: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Date</label>
                  <input type="date" value={createForm.date} onChange={(e) => setCreateForm({ ...createForm, date: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Amount (ml)</label>
                  <input type="number" min={1} required value={createForm.amount_ml} onChange={(e) => setCreateForm({ ...createForm, amount_ml: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm outline-none" />
                </div>
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-sm text-slate-500">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-semibold">Create</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT MODAL */}
      <AnimatePresence>
        {editingRecord && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 max-w-sm w-full shadow-2xl"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Edit Water Log</h3>
                <button onClick={() => setEditingRecord(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Water Amount (ml)</label>
                  <input
                    type="number"
                    min="1"
                    max="5000"
                    value={editAmount}
                    onChange={(e) => setEditAmount(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 outline-none text-sm focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Notes</label>
                  <textarea
                    rows={2}
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="E.g., drank with workout..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 outline-none text-sm focus:ring-2 focus:ring-blue-400 resize-none"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingRecord(null)}
                    className="px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-sm text-slate-500 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-xl text-sm text-white font-semibold shadow-md shadow-blue-500/25"
                  >
                    Update Log
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 max-w-sm w-full shadow-2xl"
            >
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">Delete Record Entry?</h3>
              <p className="text-sm text-slate-400 mb-6">
                Are you sure you want to delete water entry of <strong className="text-slate-700 dark:text-slate-200">{deleteConfirm.amount_ml}ml</strong> logged by <strong className="text-slate-700 dark:text-slate-200">"{deleteConfirm.username}"</strong> on <strong className="text-slate-700 dark:text-slate-200">{deleteConfirm.date}</strong>?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-sm text-slate-500 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-xl text-sm text-white font-semibold shadow-md shadow-red-500/20"
                >
                  Delete Log
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
