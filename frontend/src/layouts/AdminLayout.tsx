import React, { useState, useEffect, useCallback } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Toaster } from 'react-hot-toast'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { registerCharts } from '../utils/chartSetup'
import { API_BASE } from '../utils/adminConfig'
import {
  Home,
  Users,
  Droplets,
  BarChart2,
  Trophy,
  Bell,
  FileText,
  Settings,
  ClipboardList,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Search,
  User as UserIcon,
  X,
} from 'lucide-react'

registerCharts()

interface AdminLayoutProps {
  children: React.ReactNode
}

interface SearchResults {
  users: { id: number; username: string; email: string }[]
  records: { id: number; username: string; date: string; amount_ml: number }[]
  notifications: { id: number; title: string; type: string; created_at: string }[]
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark')

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [darkMode])

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  const runSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setSearchResults(null)
      return
    }
    try {
      const res = await axios.get(`${API_BASE}/admin/search/`, { params: { q } })
      setSearchResults(res.data)
      setSearchOpen(true)
    } catch {
      setSearchResults(null)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => runSearch(searchQuery), 300)
    return () => clearTimeout(timer)
  }, [searchQuery, runSearch])

  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: Home },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Water Records', path: '/admin/records', icon: Droplets },
    { name: 'Analytics', path: '/admin/analytics', icon: BarChart2 },
    { name: 'Leaderboard', path: '/admin/leaderboard', icon: Trophy },
    { name: 'Notifications', path: '/admin/notifications', icon: Bell },
    { name: 'Reports', path: '/admin/reports', icon: FileText },
    { name: 'Activity Logs', path: '/admin/logs', icon: ClipboardList },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ]

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const NavLinks = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {menuItems.map((item) => {
        const isActive = location.pathname.startsWith(item.path)
        const Icon = item.icon
        return (
          <Link key={item.name} to={item.path}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center gap-4 px-4 py-3.5 rounded-xl font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
              {(!collapsed || mobile) && <span className="text-sm">{item.name}</span>}
            </motion.div>
          </Link>
        )
      })}
    </>
  )

  const hasResults =
    searchResults &&
    (searchResults.users.length > 0 ||
      searchResults.records.length > 0 ||
      searchResults.notifications.length > 0)

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300">
      <Toaster position="top-right" reverseOrder={false} />

      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 80 : 260 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="hidden md:flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 h-full relative z-20 shadow-lg"
      >
        <div className="p-5 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl text-white shadow-md">
                <Droplets className="h-6 w-6" />
              </div>
              <span className="font-extrabold text-xl bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent dark:from-blue-400 dark:to-teal-400">
                AquaAdmin
              </span>
            </motion.div>
          )}
          {collapsed && (
            <div className="p-1 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg text-white mx-auto shadow-md">
              <Droplets className="h-5 w-5" />
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="absolute -right-3 top-6 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-1 shadow-md border border-white dark:border-slate-900 transition-colors"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <NavLinks />
        </nav>
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
          >
            <LogOut className="h-5 w-5" />
            {!collapsed && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/50 z-40 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-50 md:hidden flex flex-col"
            >
              <div className="p-5 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
                <span className="font-extrabold text-lg text-blue-600">AquaAdmin</span>
                <button onClick={() => setMobileOpen(false)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                <NavLinks mobile />
              </nav>
              <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-600 font-medium">
                  <LogOut className="h-5 w-5" /> Logout
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 relative z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="relative hidden sm:block">
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-1.5 border border-slate-200 dark:border-slate-700">
                <Search className="h-4 w-4 text-slate-400 mr-2" />
                <input
                  type="text"
                  placeholder="Global search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery && setSearchOpen(true)}
                  className="bg-transparent text-sm text-slate-800 dark:text-slate-100 outline-none border-none w-48 focus:w-64 transition-all duration-300"
                />
              </div>
              <AnimatePresence>
                {searchOpen && searchQuery && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute top-full left-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50"
                  >
                    {!hasResults ? (
                      <p className="p-4 text-sm text-slate-400">No results found</p>
                    ) : (
                      <div className="p-2 space-y-3">
                        {searchResults!.users.length > 0 && (
                          <div>
                            <p className="px-3 py-1 text-xs font-bold text-slate-400 uppercase">Users</p>
                            {searchResults!.users.map((u) => (
                              <button
                                key={u.id}
                                onClick={() => { navigate('/admin/users'); setSearchOpen(false); setSearchQuery('') }}
                                className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-sm"
                              >
                                <span className="font-semibold text-slate-800 dark:text-slate-100">{u.username}</span>
                                <span className="block text-xs text-slate-400">{u.email}</span>
                              </button>
                            ))}
                          </div>
                        )}
                        {searchResults!.records.length > 0 && (
                          <div>
                            <p className="px-3 py-1 text-xs font-bold text-slate-400 uppercase">Records</p>
                            {searchResults!.records.map((r) => (
                              <button
                                key={r.id}
                                onClick={() => { navigate('/admin/records'); setSearchOpen(false); setSearchQuery('') }}
                                className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-sm"
                              >
                                {r.username} — {r.amount_ml}ml on {r.date}
                              </button>
                            ))}
                          </div>
                        )}
                        {searchResults!.notifications.length > 0 && (
                          <div>
                            <p className="px-3 py-1 text-xs font-bold text-slate-400 uppercase">Notifications</p>
                            {searchResults!.notifications.map((n) => (
                              <button
                                key={n.id}
                                onClick={() => { navigate('/admin/notifications'); setSearchOpen(false); setSearchQuery('') }}
                                className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-sm"
                              >
                                {n.title}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
            >
              {darkMode ? <Sun className="h-5 w-5 text-yellow-500" /> : <Moon className="h-5 w-5 text-indigo-500" />}
            </button>
            <Link
              to="/admin/notifications"
              className="relative p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
            >
              <Bell className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </Link>
            <div className="flex items-center gap-3 pl-2 border-l border-slate-200 dark:border-slate-800">
              <div className="hidden md:flex flex-col text-right">
                <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">{user?.username}</span>
                <span className="text-xs text-blue-500 font-medium">Administrator</span>
              </div>
              <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <UserIcon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-6">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  )
}
