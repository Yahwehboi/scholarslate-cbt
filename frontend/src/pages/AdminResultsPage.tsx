import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Ic = {
  admin:    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>,
  upload:   <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M19.35 10.04A7.49 7.49 0 0 0 12 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 0 0 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/></svg>,
  settings: <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>,
  analytics:<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/></svg>,
  students: <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>,
  menu:     <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>,
}

const RESULTS = [
  { id: 'R-1001', studentId: 'SS2/2024/001', studentName: 'Amina Yusuf', subject: 'Mathematics', score: 85, status: 'Pass', date: 'Apr 22, 2026' },
  { id: 'R-1002', studentId: 'SS2/2024/002', studentName: 'Emeka Eze', subject: 'Physics', score: 68, status: 'Pass', date: 'Apr 22, 2026' },
  { id: 'R-1003', studentId: 'SS2/2024/014', studentName: 'Ruth James', subject: 'Chemistry', score: 44, status: 'Fail', date: 'Apr 21, 2026' },
]

function AdminSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate()
  const location = useLocation()
  const navItems = [
    { icon: Ic.admin, label: 'Admin Home', path: '/admin' },
    { icon: Ic.upload, label: 'Upload Questions', path: '/admin/upload' },
    { icon: Ic.settings, label: 'Subjects Control', path: '/admin/subjects' },
    { icon: Ic.analytics, label: 'View Results', path: '/admin/results' },
    { icon: Ic.students, label: 'Students', path: '/admin/students' },
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
                style={{ color: active ? '#006e2f' : '#3d4a3d', backgroundColor: active ? '#ffffff' : 'transparent', borderLeft: active ? '4px solid #006e2f' : '4px solid transparent', fontWeight: active ? 600 : 500, fontFamily: 'Inter,sans-serif' }}>
                {icon}<span>{label}</span>
              </button>
            )
          })}
        </nav>
      </aside>
    </>
  )
}

export default function AdminResultsPage() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const passCount = RESULTS.filter(r => r.status === 'Pass').length
  const avgScore = Math.round(RESULTS.reduce((acc, row) => acc + row.score, 0) / RESULTS.length)

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f9fa' }}>
      <style>{`@media(min-width:768px){.sidebar-desktop{transform:translateX(0)!important;}.main-content{margin-left:256px;}}`}</style>
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main-content flex flex-col min-h-screen">
        <header className="sticky top-0 z-20 flex items-center justify-between px-6 md:px-8 h-16"
          style={{ backgroundColor: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', boxShadow: '0 1px 0 rgba(188,203,185,0.3)' }}>
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(o => !o)} className="p-2 rounded-lg md:hidden" style={{ color: '#3d4a3d' }}>{Ic.menu}</button>
            <h2 className="text-lg font-bold" style={{ fontFamily: 'Manrope,sans-serif', color: '#191c1d' }}>Results Dashboard</h2>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium hidden sm:block" style={{ color: '#3d4a3d' }}>Administrator</span>
            <button onClick={handleLogout} className="text-sm font-bold" style={{ color: '#006e2f' }}>Logout</button>
          </div>
        </header>

        <main className="flex-1 p-5 md:p-8 max-w-screen-xl mx-auto w-full">
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2" style={{ fontFamily: 'Manrope,sans-serif', color: '#191c1d' }}>Exam Results</h1>
            <p className="text-base" style={{ color: '#3d4a3d' }}>Review student outcomes across subjects.</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-5 rounded-xl" style={{ backgroundColor: '#ffffff', boxShadow: '0 2px 12px rgba(25,28,29,0.06)' }}>
              <p className="text-xs" style={{ color: '#6d7b6c' }}>Total Results</p>
              <p className="text-3xl font-black" style={{ color: '#191c1d', fontFamily: 'Manrope,sans-serif' }}>{RESULTS.length}</p>
            </div>
            <div className="p-5 rounded-xl" style={{ backgroundColor: '#ffffff', boxShadow: '0 2px 12px rgba(25,28,29,0.06)' }}>
              <p className="text-xs" style={{ color: '#6d7b6c' }}>Passed</p>
              <p className="text-3xl font-black" style={{ color: '#006e2f', fontFamily: 'Manrope,sans-serif' }}>{passCount}</p>
            </div>
            <div className="p-5 rounded-xl" style={{ backgroundColor: '#ffffff', boxShadow: '0 2px 12px rgba(25,28,29,0.06)' }}>
              <p className="text-xs" style={{ color: '#6d7b6c' }}>Average Score</p>
              <p className="text-3xl font-black" style={{ color: '#2f6a3c', fontFamily: 'Manrope,sans-serif' }}>{avgScore}%</p>
            </div>
            <div className="p-5 rounded-xl" style={{ backgroundColor: '#ffffff', boxShadow: '0 2px 12px rgba(25,28,29,0.06)' }}>
              <p className="text-xs" style={{ color: '#6d7b6c' }}>Fail Count</p>
              <p className="text-3xl font-black" style={{ color: '#9e4036', fontFamily: 'Manrope,sans-serif' }}>{RESULTS.length - passCount}</p>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#ffffff', boxShadow: '0 4px 20px rgba(25,28,29,0.07)' }}>
            <div className="grid px-6 py-4 text-[11px] font-bold uppercase tracking-widest"
              style={{ gridTemplateColumns: '1fr 1.2fr 1.3fr 1fr 1fr 1fr', backgroundColor: '#e7e8e9', color: '#3d4a3d' }}>
              <span>Result ID</span>
              <span>Student</span>
              <span>Subject</span>
              <span>Score</span>
              <span>Status</span>
              <span>Date</span>
            </div>

            {RESULTS.map((row, index) => (
              <div key={row.id} className="grid px-6 py-4 items-center"
                style={{ gridTemplateColumns: '1fr 1.2fr 1.3fr 1fr 1fr 1fr', borderTop: index === 0 ? 'none' : '1px solid #f3f4f5' }}>
                <span className="text-sm" style={{ color: '#6d7b6c' }}>{row.id}</span>
                <span className="text-sm" style={{ color: '#191c1d' }}>{row.studentName} ({row.studentId})</span>
                <span className="text-sm" style={{ color: '#3d4a3d' }}>{row.subject}</span>
                <span className="text-sm font-bold" style={{ color: '#191c1d' }}>{row.score}%</span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full w-fit"
                  style={{ backgroundColor: row.status === 'Pass' ? '#e8f5ed' : '#ffdad6', color: row.status === 'Pass' ? '#006e2f' : '#9e4036' }}>
                  {row.status}
                </span>
                <span className="text-sm" style={{ color: '#6d7b6c' }}>{row.date}</span>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}