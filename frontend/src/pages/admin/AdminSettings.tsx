import React, { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import {
  Settings,
  Shield,
  Save,
  CheckCircle,
  Database,
  RefreshCw,
  Bell,
  Sliders,
  FileText
} from 'lucide-react'

import { API_BASE } from '../../utils/adminConfig'

export default function AdminSettings() {
  const [settings, setSettings] = useState<any>({
    default_daily_goal_ml: '2000',
    reminder_interval_mins: '60',
    app_name: 'Water Intake Tracker',
    app_logo: '',
    theme: 'dark',
    enable_notifications: 'true',
    maintenance_mode: 'false',
    privacy_policy: '',
    terms_of_service: '',
    about_app: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [backingUp, setBackingUp] = useState(false)
  const [restoring, setRestoring] = useState(false)

  async function loadSettings() {
    try {
      const res = await axios.get(`${API_BASE}/admin/settings/`)
      setSettings(res.data)
    } catch (err) {
      toast.error('Failed to load system settings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSettings()
  }, [])

  // Auto saving on field blur or switch toggle
  async function handleAutoSave(updatedSettings: any) {
    setSaving(true)
    try {
      await axios.post(`${API_BASE}/admin/settings/`, updatedSettings)
      setSettings(updatedSettings)
    } catch (err) {
      toast.error('Auto save failed')
    } finally {
      setSaving(false)
    }
  }

  function handleFieldChange(key: string, value: string) {
    const nextSettings = { ...settings, [key]: value }
    setSettings(nextSettings)
  }

  // Backup
  async function handleBackup() {
    setBackingUp(true)
    try {
      const res = await axios.get(`${API_BASE}/admin/backup/`)
      toast.success(res.data.message || 'Backup created successfully!')
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Backup failed. Super Admin only.')
    } finally {
      setBackingUp(false)
    }
  }

  // Restore
  async function handleRestore() {
    if (!window.confirm('Warning: Restoring the database will overwrite all current logs/users with the backup version. Proceed?')) {
      return
    }
    setRestoring(true)
    try {
      const res = await axios.post(`${API_BASE}/admin/backup/`)
      toast.success(res.data.message || 'Database restored successfully!')
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Restore failed. Super Admin only.')
    } finally {
      setRestoring(false)
    }
  }

  if (loading) {
    return (
      <div className="p-20 text-center flex justify-center items-center">
        <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">System Settings</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Configure global tracker properties and manage database backups</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-450">
          {saving ? (
            <span className="flex items-center gap-1.5 text-blue-500 animate-pulse">
              <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Saving changes...
            </span>
          ) : (
            <span className="flex items-center gap-1 text-emerald-500">
              <CheckCircle className="h-3.5 w-3.5" /> All settings saved
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* LEFT COLUMN: NAVIGATION GROUPS */}
        <div className="md:col-span-1 space-y-4">
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-1">
            <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase px-3 mb-2">Configuration Groups</h4>
            <div className="px-3 py-2 bg-blue-50 dark:bg-blue-950/20 text-blue-500 rounded-xl text-sm font-semibold flex items-center gap-2">
              <Sliders className="h-4 w-4" /> Global Settings
            </div>
          </div>

          {/* Backup Restore controls */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-slate-850 dark:text-slate-200 flex items-center gap-2">
              <Database className="h-4 w-4 text-blue-500" /> Database Administration
            </h4>
            <div className="space-y-2">
              <button
                onClick={handleBackup}
                disabled={backingUp}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {backingUp ? 'Creating Backup...' : 'Create DB Backup'}
              </button>
              <button
                onClick={handleRestore}
                disabled={restoring}
                className="w-full py-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-650 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {restoring ? 'Restoring Database...' : 'Restore DB Backup'}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: FIELDS FORM */}
        <div className="md:col-span-2 space-y-6">
          {/* General App Info */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
            <h3 className="text-md font-bold text-slate-800 dark:text-slate-100 mb-2">General Specifications</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Application Name</label>
                <input
                  type="text"
                  value={settings.app_name}
                  onChange={(e) => handleFieldChange('app_name', e.target.value)}
                  onBlur={() => handleAutoSave(settings)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 outline-none text-sm focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Application Logo URL</label>
                <input
                  type="text"
                  value={settings.app_logo}
                  onChange={(e) => handleFieldChange('app_logo', e.target.value)}
                  onBlur={() => handleAutoSave(settings)}
                  placeholder="https://example.com/logo.png"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 outline-none text-sm focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Default Daily Goal (ml)</label>
                <input
                  type="number"
                  value={settings.default_daily_goal_ml}
                  onChange={(e) => handleFieldChange('default_daily_goal_ml', e.target.value)}
                  onBlur={() => handleAutoSave(settings)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 outline-none text-sm focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Reminder Interval (minutes)</label>
                <input
                  type="number"
                  value={settings.reminder_interval_mins}
                  onChange={(e) => handleFieldChange('reminder_interval_mins', e.target.value)}
                  onBlur={() => handleAutoSave(settings)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 outline-none text-sm focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Default Theme Mode</label>
                <select
                  value={settings.theme}
                  onChange={(e) => {
                    handleFieldChange('theme', e.target.value)
                    const next = { ...settings, theme: e.target.value }
                    handleAutoSave(next)
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-850 dark:text-slate-100 outline-none text-sm"
                >
                  <option value="light">Light Mode</option>
                  <option value="dark">Dark Mode</option>
                </select>
              </div>
            </div>
          </div>

          {/* System Toggles */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
            <h3 className="text-md font-bold text-slate-800 dark:text-slate-100 mb-2">Toggles & Statuses</h3>
            
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-100 text-sm block">Enable Email Alerts</span>
                <span className="text-xs text-slate-400">Send reminder emails for hydrations</span>
              </div>
              <input
                type="checkbox"
                checked={settings.enable_notifications === 'true'}
                onChange={(e) => {
                  const val = e.target.checked ? 'true' : 'false'
                  handleFieldChange('enable_notifications', val)
                  handleAutoSave({ ...settings, enable_notifications: val })
                }}
                className="h-5 w-5 text-blue-500 rounded border-slate-300 focus:ring-blue-400 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-100 text-sm block">Maintenance Mode</span>
                <span className="text-xs text-slate-400">Lock database inputs and block access</span>
              </div>
              <input
                type="checkbox"
                checked={settings.maintenance_mode === 'true'}
                onChange={(e) => {
                  const val = e.target.checked ? 'true' : 'false'
                  handleFieldChange('maintenance_mode', val)
                  handleAutoSave({ ...settings, maintenance_mode: val })
                }}
                className="h-5 w-5 text-blue-500 rounded border-slate-300 focus:ring-blue-400 cursor-pointer"
              />
            </div>
          </div>

          {/* Legal / Pages content */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
            <h3 className="text-md font-bold text-slate-800 dark:text-slate-100 mb-2 flex items-center gap-1.5">
              <FileText className="h-5 w-5 text-slate-500" /> Legal Info & Policies
            </h3>
            
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">About App Description</label>
              <textarea
                rows={2}
                value={settings.about_app}
                onChange={(e) => handleFieldChange('about_app', e.target.value)}
                onBlur={() => handleAutoSave(settings)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-850 dark:text-slate-100 outline-none text-sm focus:ring-2 focus:ring-blue-400 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Privacy Policy Statement</label>
              <textarea
                rows={2}
                value={settings.privacy_policy}
                onChange={(e) => handleFieldChange('privacy_policy', e.target.value)}
                onBlur={() => handleAutoSave(settings)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 outline-none text-sm focus:ring-2 focus:ring-blue-400 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Terms of Service</label>
              <textarea
                rows={2}
                value={settings.terms_of_service}
                onChange={(e) => handleFieldChange('terms_of_service', e.target.value)}
                onBlur={() => handleAutoSave(settings)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 outline-none text-sm focus:ring-2 focus:ring-blue-400 resize-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
