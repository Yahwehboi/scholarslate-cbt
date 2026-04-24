import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/apiClient'

const Ic = {
  admin:    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>,
  upload:   <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M19.35 10.04A7.49 7.49 0 0 0 12 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 0 0 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/></svg>,
  settings: <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>,
  analytics:<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/></svg>,
  students: <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>,
  menu:     <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>,
  arrow:    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/></svg>,
}

function AdminSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate()
  const location = useLocation()
  const navItems = [
    { icon: Ic.admin,    label: 'Admin Home',      path: '/admin' },
    { icon: Ic.upload,   label: 'Upload Questions', path: '/admin/upload' },
    { icon: Ic.settings, label: 'Subjects Control', path: '/admin/subjects' },
    { icon: Ic.analytics,label: 'View Results',     path: '/admin/results' },
    { icon: Ic.students, label: 'Students',         path: '/admin/students' },
  ]

  const activeLabelMap: Record<string, string> = {
    '/admin': 'Admin Home',
    '/admin/subjects': 'Subjects Control',
    '/admin/upload': 'Upload Questions',
    '/admin/students': 'Students',
    '/admin/results': 'View Results',
  }

  const activeLabel = activeLabelMap[location.pathname] ?? ''

  return (
    <>
      {open && <div className="fixed inset-0 z-30 md:hidden" style={{ backgroundColor: 'rgba(25,28,29,0.4)', backdropFilter: 'blur(4px)' }} onClick={onClose} />}
      <aside className="sidebar-desktop fixed left-0 top-0 h-screen z-40 flex flex-col transition-transform duration-300"
        style={{ width: '256px', backgroundColor: '#f3f4f5', transform: open ? 'translateX(0)' : 'translateX(-100%)' }}>
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center text-white flex-shrink-0" style={{ backgroundColor: '#006e2f', borderRadius: '0.5rem' }}>{Ic.admin}</div>
          <div>
            <h1 className="text-base font-black leading-none" style={{ fontFamily: 'Manrope,sans-serif', color: '#006e2f' }}>CBT Admin</h1>
            <p className="text-[10px] uppercase tracking-widest font-bold mt-0.5" style={{ color: '#6d7b6c' }}>Management Suite</p>
          </div>
        </div>
        <nav className="flex-1 mt-2 flex flex-col">
          {navItems.map(({ icon, label, path }) => {
            const active = label === activeLabel
            return (
              <button key={label} onClick={() => { navigate(path); onClose() }}
                className="flex items-center gap-3 py-3 px-6 text-left transition-all duration-200"
                style={{ color: active ? '#006e2f' : '#3d4a3d', backgroundColor: active ? '#ffffff' : 'transparent', borderLeft: active ? '4px solid #006e2f' : '4px solid transparent', fontWeight: active ? 600 : 500, fontFamily: 'Inter,sans-serif' }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = '#e7e8e9' }}
                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}>
                {icon}<span>{label}</span>
              </button>
            )
          })}
        </nav>
        <div className="p-6">
          <div className="p-4 rounded-xl flex items-center gap-3" style={{ backgroundColor: '#e7e8e9' }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: 'linear-gradient(135deg,#006e2f,#22c55e)' }}>SA</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate" style={{ color: '#191c1d' }}>Super Admin</p>
              <p className="text-[10px]" style={{ color: '#6d7b6c' }}>ScholarSlate CBT</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

export default function AdminHomePage() {
  const navigate = useNavigate()
  const { session, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [studentCount, setStudentCount] = useState<number | null>(null)

  useEffect(() => {
    api.students.list({ limit: 1 })
      .then(r => setStudentCount(r.total))
      .catch(() => setStudentCount(0))
  }, [])

  const adminName = session?.role === 'admin' ? session.fullName : 'Administrator'

  const handleLogout = () => {
    logout().then(() => navigate('/login', { replace: true }))
  }

  const quickLinks = [
    {
      label: 'Students',
      description: 'View and search all registered student accounts.',
      path: '/admin/students',
      icon: Ic.students,
      accent: '#006e2f',
      bg: '#e8f5ed',
    },
    {
      label: 'Upload Questions',
      description: 'Add exam questions manually or via CSV batch upload.',
      path: '/admin/upload',
      icon: Ic.upload,
      accent: '#1565c0',
      bg: '#e3f2fd',
    },
    {
      label: 'Subjects Control',
      description: 'Enable subjects, set exam time limits and attempt caps.',
      path: '/admin/subjects',
      icon: Ic.settings,
      accent: '#6a1b9a',
      bg: '#f3e5f5',
    },
    {
      label: 'View Results',
      description: 'Browse and filter all student exam results and scores.',
      path: '/admin/results',
      icon: Ic.analytics,
      accent: '#e65100',
      bg: '#fff3e0',
    },
  ]

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f9fa' }}>
      <style>{`@media(min-width:768px){.sidebar-desktop{transform:translateX(0)!important;}.main-content{margin-left:256px;}}`}</style>
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main-content flex flex-col min-h-screen">
        <header className="sticky top-0 z-20 flex items-center justify-between px-6 md:px-8 h-16"
          style={{ backgroundColor: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', boxShadow: '0 1px 0 rgba(188,203,185,0.3)' }}>
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(o => !o)} className="p-2 rounded-lg md:hidden" style={{ color: '#3d4a3d' }}>{Ic.menu}</button>
            <h2 className="text-lg font-bold" style={{ fontFamily: 'Manrope,sans-serif', color: '#191c1d' }}>Admin Home</h2>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium hidden sm:block" style={{ color: '#3d4a3d' }}>{adminName}</span>
            <button onClick={handleLogout} className="text-sm font-bold" style={{ color: '#006e2f' }}>Logout</button>
          </div>
        </header>

        <main className="flex-1 p-5 md:p-8 max-w-screen-xl mx-auto w-full">
          {/* Welcome */}
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2"
              style={{ fontFamily: 'Manrope,sans-serif', color: '#191c1d' }}>
              Welcome back, {adminName.split(' ')[0]}
            </h1>
            <p className="text-base" style={{ color: '#3d4a3d' }}>
              Here's a quick overview of your CBT system.
            </p>
          </motion.div>

          {/* Stats row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
            {[
              {
                label: 'Registered Students',
                value: studentCount === null ? '...' : String(studentCount),
                sub: 'in the system',
                color: '#006e2f',
              },
              {
                label: 'System Status',
                value: 'Live',
                sub: 'accepting exams',
                color: '#1565c0',
              },
              {
                label: 'Backend',
                value: 'Connected',
                sub: 'API responding',
                color: '#6a1b9a',
              },
            ].map(({ label, value, sub, color }, i) => (
              <motion.div key={label}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className="p-7 rounded-2xl"
                style={{ backgroundColor: '#ffffff', boxShadow: '0 2px 12px rgba(25,28,29,0.07)' }}>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: '#6d7b6c' }}>{label}</p>
                <p className="text-4xl font-extrabold" style={{ fontFamily: 'Manrope,sans-serif', color }}>{value}</p>
                <p className="text-sm mt-1" style={{ color: '#6d7b6c' }}>{sub}</p>
              </motion.div>
            ))}
          </div>

          {/* Quick links */}
          <h2 className="text-lg font-bold mb-4" style={{ fontFamily: 'Manrope,sans-serif', color: '#191c1d' }}>Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {quickLinks.map(({ label, description, path, icon, accent, bg }, i) => (
              <motion.button key={label}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.07 }}
                whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }}
                onClick={() => navigate(path)}
                className="text-left p-6 rounded-2xl flex flex-col gap-4"
                style={{ backgroundColor: '#ffffff', boxShadow: '0 2px 12px rgba(25,28,29,0.07)', cursor: 'pointer', border: 'none', width: '100%' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: bg, color: accent }}>
                  {icon}
                </div>
                <div className="flex-1">
                  <p className="text-base font-bold mb-1" style={{ fontFamily: 'Manrope,sans-serif', color: '#191c1d' }}>{label}</p>
                  <p className="text-xs leading-relaxed" style={{ color: '#6d7b6c' }}>{description}</p>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold" style={{ color: accent }}>
                  Open {Ic.arrow}
                </div>
              </motion.button>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
