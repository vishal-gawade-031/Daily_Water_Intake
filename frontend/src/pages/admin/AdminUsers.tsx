import React, { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Edit2,
  UserCheck,
  UserX,
  Target,
  Trash2,
  Eye,
  X,
  Calendar,
  Award,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Mail,
  Zap,
  Clock
} from 'lucide-react'
import { Line } from 'react-chartjs-2'
import { API_BASE } from '../../utils/adminConfig'
import { extractList, extractPageInfo } from '../../utils/adminApi'
import Pagination from '../../components/admin/Pagination'

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [sortBy, setSortBy] = useState('date_joined')
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  
  // Modals state
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [userHistory, setUserHistory] = useState<any[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [showGoalModal, setShowGoalModal] = useState<any>(null)
  const [newGoal, setNewGoal] = useState(2000)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<any>(null)
  const [showEditModal, setShowEditModal] = useState<any>(null)
  const [editForm, setEditForm] = useState({ email: '', first_name: '', last_name: '', daily_goal_ml: 2000, is_active: true })

  async function loadUsers() {
    setLoading(true)
    try {
      const res = await axios.get(`${API_BASE}/admin/users/`, {
        params: {
          search: searchTerm,
          status: statusFilter,
          role: roleFilter,
          sort_by: sortBy,
          page: page
        }
      })
      // If endpoint is paginated, handle accordingly
      if (res.data.results) {
        setUsers(res.data.results)
        setTotalCount(extractPageInfo(res.data).count)
      } else {
        setUsers(res.data)
        setTotalCount(Array.isArray(res.data) ? res.data.length : 0)
      }
    } catch (err) {
      console.error('Failed to load users:', err)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setPage(1)
  }, [searchTerm, statusFilter, roleFilter, sortBy])

  useEffect(() => {
    loadUsers()
  }, [searchTerm, statusFilter, roleFilter, sortBy, page])

  async function handleEditUser(e: React.FormEvent) {
    e.preventDefault()
    if (!showEditModal) return
    try {
      await axios.patch(`${API_BASE}/admin/users/${showEditModal.id}/`, {
        email: editForm.email,
        first_name: editForm.first_name,
        last_name: editForm.last_name,
        daily_goal_ml: editForm.daily_goal_ml,
        is_active: editForm.is_active,
      })
      toast.success('User updated successfully')
      setShowEditModal(null)
      loadUsers()
    } catch {
      toast.error('Failed to update user')
    }
  }

  function openEditModal(user: any) {
    setEditForm({
      email: user.email,
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      daily_goal_ml: user.daily_goal_ml,
      is_active: user.is_active,
    })
    setShowEditModal(user)
  }

  // Toggle User Active Status
  async function toggleActive(userId: number) {
    try {
      const res = await axios.post(`${API_BASE}/admin/users/${userId}/toggle-active/`)
      toast.success(`User status updated to ${res.data.is_active ? 'Active' : 'Inactive'}`)
      loadUsers()
    } catch (err) {
      toast.error('Failed to toggle status')
    }
  }

  // Reset User Daily Goal
  async function handleResetGoal(e: React.FormEvent) {
    e.preventDefault()
    if (!showGoalModal) return
    try {
      await axios.post(`${API_BASE}/admin/users/${showGoalModal.id}/reset-goal/`, {
        daily_goal_ml: newGoal
      })
      toast.success('Daily goal reset successfully')
      setShowGoalModal(null)
      loadUsers()
    } catch (err) {
      toast.error('Failed to reset daily goal')
    }
  }

  // Delete User (Super Admin required)
  async function handleDeleteUser() {
    if (!showDeleteConfirm) return
    try {
      await axios.delete(`${API_BASE}/admin/users/${showDeleteConfirm.id}/`)
      toast.success('User deleted successfully')
      setShowDeleteConfirm(null)
      loadUsers()
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Only Super Admins can delete users')
      setShowDeleteConfirm(null)
    }
  }

  // View Profile history
  async function viewProfile(user: any) {
    setSelectedUser(user)
    setHistoryLoading(true)
    try {
      const res = await axios.get(`${API_BASE}/admin/users/${user.id}/history/`)
      setUserHistory(res.data)
    } catch (err) {
      toast.error('Failed to load history')
    } finally {
      setHistoryLoading(false)
    }
  }

  // Modal chart setup
  const modalChartData = {
    labels: userHistory.slice(0, 7).reverse().map((h) => h.date) || [],
    datasets: [
      {
        fill: true,
        label: 'Intake (ml)',
        data: userHistory.slice(0, 7).reverse().map((h) => h.amount_ml) || [],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      }
    ]
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">User Management</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Activate, de-activate, reset goals, and audit user streaking behaviors</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col md:flex-row gap-4 justify-between items-center shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by username, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 outline-none text-sm focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all"
          />
        </div>

        <div className="flex flex-wrap gap-4 w-full md:w-auto">
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 outline-none text-sm"
          >
            <option value="">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>

          {/* Role filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 outline-none text-sm"
          >
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>

          {/* Sort selection */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 outline-none text-sm"
          >
            <option value="date_joined">Sort by Join Date</option>
            <option value="username">Sort by Name</option>
            <option value="email">Sort by Email</option>
            <option value="streak">Sort by Current Streak</option>
            <option value="longest_streak">Sort by Longest Streak</option>
            <option value="total_water">Sort by Total Water</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-20 text-center flex justify-center items-center">
            <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full" />
          </div>
        ) : users.length === 0 ? (
          <div className="p-20 text-center text-slate-400 dark:text-slate-500">
            No users matched your query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                  <th className="py-4 px-6 font-semibold text-slate-500 dark:text-slate-400 text-sm">Username</th>
                  <th className="py-4 px-6 font-semibold text-slate-500 dark:text-slate-400 text-sm">Email</th>
                  <th className="py-4 px-6 font-semibold text-slate-500 dark:text-slate-400 text-sm">Daily Goal</th>
                  <th className="py-4 px-6 font-semibold text-slate-500 dark:text-slate-400 text-sm">Current Streak</th>
                  <th className="py-4 px-6 font-semibold text-slate-500 dark:text-slate-400 text-sm">Total Water</th>
                  <th className="py-4 px-6 font-semibold text-slate-500 dark:text-slate-400 text-sm">Status</th>
                  <th className="py-4 px-6 font-semibold text-slate-500 dark:text-slate-400 text-sm text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-slate-100 dark:border-slate-900 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all">
                    <td className="py-4 px-6 font-medium text-slate-800 dark:text-slate-200 text-sm">{user.username}</td>
                    <td className="py-4 px-6 text-slate-600 dark:text-slate-400 text-sm">{user.email}</td>
                    <td className="py-4 px-6 text-slate-600 dark:text-slate-400 text-sm font-semibold">{user.daily_goal_ml}ml</td>
                    <td className="py-4 px-6 text-slate-600 dark:text-slate-400 text-sm">
                      <span className="inline-flex items-center gap-1 text-amber-500 font-bold">
                        🔥 {user.current_streak} days
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-600 dark:text-slate-400 text-sm font-bold">
                      {user.total_water_consumed}ml
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full ${
                        user.is_active 
                          ? 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/20' 
                          : 'text-rose-700 bg-rose-50 dark:bg-rose-950/20'
                      }`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => viewProfile(user)}
                          title="View Profile History"
                          className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-950/20 text-blue-500 rounded-lg transition-colors"
                        >
                          <Eye className="h-4.5 w-4.5" />
                        </button>
                        <button
                          onClick={() => openEditModal(user)}
                          title="Edit User"
                          className="p-1.5 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 text-indigo-500 rounded-lg transition-colors"
                        >
                          <Edit2 className="h-4.5 w-4.5" />
                        </button>
                        <button
                          onClick={() => toggleActive(user.id)}
                          title={user.is_active ? 'Deactivate User' : 'Activate User'}
                          className={`p-1.5 rounded-lg transition-colors ${
                            user.is_active 
                              ? 'hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-500' 
                              : 'hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-emerald-500'
                          }`}
                        >
                          {user.is_active ? <UserX className="h-4.5 w-4.5" /> : <UserCheck className="h-4.5 w-4.5" />}
                        </button>
                        <button
                          onClick={() => {
                            setNewGoal(user.daily_goal_ml)
                            setShowGoalModal(user)
                          }}
                          title="Reset Daily Goal"
                          className="p-1.5 hover:bg-amber-50 dark:hover:bg-amber-950/20 text-amber-500 rounded-lg transition-colors"
                        >
                          <Target className="h-4.5 w-4.5" />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(user)}
                          title="Delete User"
                          className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={page} totalCount={totalCount} onPageChange={setPage} />
      </div>

      {/* VIEW PROFILE MODAL */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                    UserProfile: {selectedUser.username}
                  </h3>
                  <p className="text-sm text-slate-400">{selectedUser.email}</p>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Stats row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                    <span className="text-xs text-slate-400 font-semibold block">Current Streak</span>
                    <span className="text-lg font-bold text-amber-500 block">🔥 {selectedUser.current_streak} days</span>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                    <span className="text-xs text-slate-400 font-semibold block">Longest Streak</span>
                    <span className="text-lg font-bold text-orange-500 block">🏆 {selectedUser.longest_streak} days</span>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                    <span className="text-xs text-slate-400 font-semibold block">Daily Goal</span>
                    <span className="text-lg font-bold text-blue-500 block">💧 {selectedUser.daily_goal_ml}ml</span>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                    <span className="text-xs text-slate-400 font-semibold block">Total Consumed</span>
                    <span className="text-lg font-bold text-purple-500 block">🌊 {selectedUser.total_water_consumed}ml</span>
                  </div>
                </div>

                {/* Profile info fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span>Joined: {new Date(selectedUser.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <span>Last Login: {selectedUser.last_login ? new Date(selectedUser.last_login).toLocaleString() : 'Never'}</span>
                  </div>
                </div>

                {/* Graph */}
                <div className="p-4 border border-slate-100 dark:border-slate-800 rounded-2xl">
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm mb-3">Recent Water Intake (Last 7 Logs)</h4>
                  {historyLoading ? (
                    <div className="h-40 flex items-center justify-center">
                      <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full" />
                    </div>
                  ) : userHistory.length === 0 ? (
                    <div className="h-40 flex items-center justify-center text-slate-400">
                      No logs history found for this user.
                    </div>
                  ) : (
                    <div className="h-48">
                      <Line data={modalChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                    </div>
                  )}
                </div>

                {/* Recent activity entries list */}
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm mb-3">Water Logging Activities</h4>
                  <div className="space-y-2">
                    {userHistory.slice(0, 5).map((h) => (
                      <div key={h.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                        <div>
                          <span className="font-semibold text-slate-700 dark:text-slate-200 text-sm">{h.amount_ml}ml</span>
                          <span className="text-xs text-slate-400 dark:text-slate-500 ml-2">{h.notes || 'No notes'}</span>
                        </div>
                        <span className="text-xs text-slate-500">{new Date(h.date).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* RESET GOAL MODAL */}
      <AnimatePresence>
        {showGoalModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 max-w-sm w-full shadow-xl"
            >
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Reset Daily Goal</h3>
              <form onSubmit={handleResetGoal} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">New Goal amount (ml)</label>
                  <input
                    type="number"
                    min="500"
                    max="10000"
                    value={newGoal}
                    onChange={(e) => setNewGoal(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowGoalModal(null)}
                    className="px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-sm font-semibold text-slate-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-xl text-sm font-semibold text-white shadow-md shadow-blue-500/20"
                  >
                    Save Goal
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT USER MODAL */}
      <AnimatePresence>
        {showEditModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 max-w-md w-full shadow-xl"
            >
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Edit User: {showEditModal.username}</h3>
              <form onSubmit={handleEditUser} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Email</label>
                  <input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">First Name</label>
                    <input type="text" value={editForm.first_name} onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Last Name</label>
                    <input type="text" value={editForm.last_name} onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Daily Goal (ml)</label>
                  <input type="number" min={500} max={10000} value={editForm.daily_goal_ml} onChange={(e) => setEditForm({ ...editForm, daily_goal_ml: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm outline-none" />
                </div>
                <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <input type="checkbox" checked={editForm.is_active} onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })} />
                  Account Active
                </label>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowEditModal(null)} className="px-4 py-2 text-sm text-slate-500">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-semibold">Save Changes</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 max-w-sm w-full shadow-xl"
            >
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">Delete User?</h3>
              <p className="text-sm text-slate-400 mb-6">
                Are you sure you want to permanently delete user <strong className="text-slate-800 dark:text-slate-200">"{showDeleteConfirm.username}"</strong>? This action is irreversible.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-sm font-semibold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteUser}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-xl text-sm font-semibold text-white shadow-md shadow-red-500/20"
                >
                  Yes, Delete User
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
