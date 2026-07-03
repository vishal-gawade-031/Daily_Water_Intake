import React, { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { Bell, Send, CheckCircle, Clock, Volume2, ShieldAlert, Heart, Trophy, Megaphone } from 'lucide-react'

import { API_BASE } from '../../utils/adminConfig'
import { extractList } from '../../utils/adminApi'

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Form fields
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [type, setType] = useState('reminder')
  const [sending, setSending] = useState(false)

  async function loadNotifications() {
    setLoading(true)
    try {
      const res = await axios.get(`${API_BASE}/admin/notifications/`)
      setNotifications(extractList(res.data))
    } catch (err) {
      toast.error('Failed to load notifications history')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNotifications()
  }, [])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!title || !message) {
      toast.error('Please fill in all fields')
      return
    }
    setSending(true)
    try {
      await axios.post(`${API_BASE}/admin/notifications/`, {
        title,
        message,
        type,
        is_global: true
      })
      toast.success('Notification sent successfully!')
      setTitle('')
      setMessage('')
      loadNotifications()
    } catch (err) {
      toast.error('Failed to send notification')
    } finally {
      setSending(false)
    }
  }

  const notificationIcons: Record<string, any> = {
    reminder: { icon: Volume2, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/20' },
    maintenance: { icon: ShieldAlert, color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/20' },
    health_tip: { icon: Heart, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' },
    congrats: { icon: Trophy, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20' },
    announcement: { icon: Megaphone, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/20' }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">Send System Notifications</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Broadcast reminders, announcements, and health tips to application users</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CREATE FORM */}
        <div className="lg:col-span-1 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm h-fit">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-500" /> Draft Broadcast
          </h3>
          <form onSubmit={handleSend} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-450 dark:text-slate-500 mb-1">Broadcasting Title</label>
              <input
                type="text"
                placeholder="E.g., App Maintenance Tomorrow"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 outline-none text-sm focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-450 dark:text-slate-500 mb-1">Notification Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 outline-none text-sm"
              >
                <option value="reminder">Drink Water Reminder</option>
                <option value="maintenance">Maintenance Notice</option>
                <option value="health_tip">Health Tip</option>
                <option value="congrats">Congratulations</option>
                <option value="announcement">General Announcement</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-450 dark:text-slate-500 mb-1">Alert Message</label>
              <textarea
                rows={4}
                placeholder="Type the notification body here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 outline-none text-sm focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={sending}
              className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all"
            >
              <Send className="h-4.5 w-4.5" />
              {sending ? 'Sending Alert...' : 'Send Broadcast Notification'}
            </button>
          </form>
        </div>

        {/* LOG HISTORY */}
        <div className="lg:col-span-2 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
            <Clock className="h-5 w-5 text-slate-400" /> Notifications Dispatch History
          </h3>

          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin h-8 w-8 border-3 border-blue-500 border-t-transparent rounded-full" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-450 text-sm">
              No notifications sent yet.
            </div>
          ) : (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {notifications.map((notif) => {
                const config = notificationIcons[notif.type] || { icon: Bell, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/20' }
                const IconComp = config.icon
                return (
                  <div key={notif.id} className="p-4 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-start gap-4 hover:shadow-md transition-shadow">
                    <div className={`p-3 rounded-xl ${config.color} shrink-0`}>
                      <IconComp className="h-5 w-5" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{notif.title}</h4>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {new Date(notif.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-650 dark:text-slate-400">{notif.message}</p>
                      <div className="flex justify-between items-center pt-2">
                        <span className="text-xs text-blue-500 font-semibold uppercase">
                          {notif.type.replace('_', ' ')}
                        </span>
                        <span className="text-[11px] text-slate-450 dark:text-slate-500">
                          Sent by: <strong className="text-slate-600 dark:text-slate-350">{notif.sender_username}</strong>
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
