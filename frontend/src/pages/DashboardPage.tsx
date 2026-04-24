import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { formatClassLabel, getUserInitials } from '../lib/auth'

// ── Types ──────────────────────────────────────────────────────────
interface NavItem {
  icon: React.ReactNode
  label: string
  path: string
}

// ── SVG Icon Library ───────────────────────────────────────────────
const Ic = {
  school: <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/></svg>,
  dashboard: <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>,
  book: <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z"/></svg>,
  results: <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/></svg>,
  profile: <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>,
  help: <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg>,
  logout: <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>,
  menu: <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>,
  close: <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>,
  star: <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>,
  library: <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z"/></svg>,
  check: <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>,
  history: <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/></svg>,
  play: <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M8 5v14l11-7z"/></svg>,
  arrow: <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/></svg>,
  math: <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm4 8H8v-1c0-1.33 2.67-2 4-2s4 .67 4 2v1z"/></svg>,
  science: <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M7 2v2h1v7.6L4.8 17c-.5.8-.3 1.9.5 2.4.3.2.6.3.9.3h.1l-.1-.1.1.1h11.4c.9 0 1.7-.8 1.7-1.7 0-.3-.1-.6-.2-.9L16 11.6V4h1V2H7zm3 2h4v2h-4V4zm-1.2 8h6.4l1.7 3H8.1l1.7-3z"/></svg>,
  english: <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/></svg>,
  notification: <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>,
}

// ── Sidebar ────────────────────────────────────────────────────────
function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout } = useAuth()

  const navItems: NavItem[] = [
    { icon: Ic.dashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Ic.book,      label: 'Subjects',  path: '/select-subject' },
    { icon: Ic.results,   label: 'Results',   path: '/results-history' },
    { icon: Ic.profile,   label: 'Profile',   path: '/profile' },
  ]

  const handleNav = (path: string) => {
    navigate(path)
    onClose()
  }

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-30 md:hidden"
          style={{ backgroundColor: 'rgba(25,28,29,0.4)', backdropFilter: 'blur(4px)' }}
          onClick={onClose} />
      )}

      <aside
        className="sidebar-desktop fixed left-0 top-0 h-screen z-40 flex flex-col transition-transform duration-300"
        style={{
          width: '256px',
          backgroundColor: '#f3f4f5',
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
        }}
      >
        {/* Logo */}
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center text-white flex-shrink-0"
            style={{ backgroundColor: '#006e2f', borderRadius: '0.5rem' }}>
            {Ic.school}
          </div>
          <div>
            <h1 className="text-base font-black leading-none"
              style={{ fontFamily: 'Manrope, sans-serif', color: '#006e2f' }}>
              ScholarSlate
            </h1>
            <p className="text-[10px] uppercase tracking-widest font-bold mt-0.5"
              style={{ color: '#6d7b6c' }}>
              Student Portal
            </p>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 mt-2 flex flex-col">
          {navItems.map(({ icon, label, path }) => {
            const active = location.pathname === path
            return (
              <button key={path} onClick={() => handleNav(path)}
                className="flex items-center gap-3 py-3 px-6 text-left transition-all duration-200 relative"
                style={{
                  color: active ? '#006e2f' : '#3d4a3d',
                  backgroundColor: active ? '#ffffff' : 'transparent',
                  borderLeft: active ? '4px solid #006e2f' : '4px solid transparent',
                  fontWeight: active ? 600 : 500,
                  fontFamily: 'Inter, sans-serif',
                }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = '#e7e8e9' }}
                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}
              >
                {icon}
                <span>{label}</span>
              </button>
            )
          })}
        </nav>

        {/* Bottom actions */}
        <div className="p-4 flex flex-col gap-1">
          {[
            { icon: Ic.help, label: 'Help Center' },
            { icon: Ic.logout, label: 'Logout' },
          ].map(({ icon, label }) => (
            <button key={label}
              className="flex items-center gap-3 py-3 px-6 text-sm font-medium transition-colors duration-200"
              style={{ color: '#3d4a3d', fontFamily: 'Inter, sans-serif', borderRadius: '0.5rem' }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#e7e8e9')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = 'transparent')}
              onClick={() => {
                if (label !== 'Logout') return
                logout()
                navigate('/login', { replace: true })
              }}
            >
              {icon}
              <span>{label}</span>
            </button>
          ))}
        </div>
      </aside>
    </>
  )
}

// ── Top bar ────────────────────────────────────────────────────────
function TopBar({ onMenuClick }: { onMenuClick: () => void }) {
  const { session } = useAuth()
  const studentName = session?.role === 'student' ? session.fullName : 'Student'
  const studentClass = session?.role === 'student' ? formatClassLabel(session.className) : ''
  const studentInitials = getUserInitials(studentName)

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between px-6 md:px-8 h-16"
      style={{
        backgroundColor: 'rgba(255,255,255,0.8)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow: '0 1px 0 rgba(188,203,185,0.3)',
      }}>
      {/* Left: hamburger + title */}
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="p-2 rounded-lg transition-colors"
          style={{ color: '#3d4a3d' }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#e7e8e9')}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = 'transparent')}
        >
          {Ic.menu}
        </button>
        <h2 className="text-lg font-bold hidden sm:block"
          style={{ fontFamily: 'Manrope, sans-serif', color: '#191c1d' }}>
          School CBT System
        </h2>
      </div>

      {/* Right: status + student info */}
      <div className="flex items-center gap-4 md:gap-6">
        {/* Exam window status */}
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-xs font-medium" style={{ color: '#3d4a3d' }}>Exam Window: Open</span>
          <span className="w-2 h-2 rounded-full bg-green-500"
            style={{ animation: 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite' }} />
        </div>

        {/* Student info */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold leading-none" style={{ color: '#191c1d' }}>{studentName}</p>
            <p className="text-[10px] uppercase tracking-tight mt-0.5" style={{ color: '#6d7b6c' }}>{studentClass}</p>
          </div>
          {/* Avatar initials */}
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#006e2f,#22c55e)' }}>
            {studentInitials}
          </div>
        </div>
      </div>
    </header>
  )
}

// ── Stat cards ─────────────────────────────────────────────────────
const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.4, ease: 'easeOut' as const },
})

function StatCards() {
  const stats = [
    { label: 'Available Subjects', value: '12', sub: '+2 new this term', icon: Ic.library, accent: '#006e2f', bg: '#ffffff' },
    { label: 'Completed', value: '08', sub: null, progress: 66, icon: Ic.check, accent: '#2f6a3c', bg: '#ffffff' },
    { label: 'Remaining Attempts', value: '03', sub: 'Expiring in 4 days', icon: Ic.history, accent: '#9e4036', bg: '#ffffff' },
    { label: 'Total Score', value: '842', sub: 'Top 5% of class', icon: Ic.star, accent: '#004b1e', bg: '#22c55e', dark: true },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
      {stats.map((s, i) => (
        <motion.div key={s.label} {...fadeUp(0.1 + i * 0.07)}
          className="p-5 rounded-xl flex flex-col justify-between cursor-default"
          style={{
            height: '9rem',
            backgroundColor: s.bg,
            boxShadow: '0 2px 12px rgba(25,28,29,0.06)',
            transition: 'box-shadow 0.2s, transform 0.2s',
          }}
          whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(25,28,29,0.1)' }}
        >
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold uppercase tracking-wider"
              style={{ color: s.dark ? 'rgba(0,75,30,0.8)' : '#3d4a3d' }}>
              {s.label}
            </span>
            <span style={{ color: s.dark ? '#004b1e' : s.accent }}>{s.icon}</span>
          </div>
          <div>
            <p className="text-4xl font-black" style={{ fontFamily: 'Manrope,sans-serif', color: s.dark ? '#004b1e' : '#191c1d' }}>
              {s.value}
            </p>
            {s.progress !== undefined ? (
              <div className="w-full h-1.5 rounded-full mt-2" style={{ backgroundColor: '#edeeef' }}>
                <div className="h-1.5 rounded-full" style={{ width: `${s.progress}%`, backgroundColor: '#2f6a3c' }} />
              </div>
            ) : (
              <p className="text-xs font-medium mt-1" style={{ color: s.dark ? '#004b1e' : s.accent }}>{s.sub}</p>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// ── Mock exam cards ────────────────────────────────────────────────
function MockExamSection() {
  const navigate = useNavigate()
  const exams = [
    {
      name: 'WAEC Mock',
      full: 'West Africa Examinations Council',
      subjects: 'English, Maths, Sciences & more',
      questions: '60 questions • 2 hrs',
      color: '#1a6b3a',
      light: '#e8f5ed',
      badge: 'WA',
      badgeBg: '#006e2f',
    },
    {
      name: 'NECO Mock',
      full: 'National Examinations Council',
      subjects: 'Core & Elective subjects',
      questions: '60 questions • 2 hrs',
      color: '#1e4d8c',
      light: '#e8eef8',
      badge: 'NE',
      badgeBg: '#1e4d8c',
    },
    {
      name: 'JAMB Mock',
      full: 'Joint Admissions & Matric. Board',
      subjects: 'Use of English + 3 subjects',
      questions: '60 questions • 1 hr 45 min',
      color: '#7a1f1a',
      light: '#fdf0ef',
      badge: 'JA',
      badgeBg: '#9e4036',
    },
  ]

  return (
    <motion.div {...fadeUp(0.28)} className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-bold" style={{ fontFamily: 'Manrope,sans-serif', color: '#191c1d' }}>
          Mock Examinations
        </h4>
        <span className="text-xs font-semibold px-3 py-1 rounded-full"
          style={{ backgroundColor: '#e8f5ed', color: '#006e2f' }}>
          AI-Powered
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {exams.map((exam, i) => (
          <motion.button
            key={exam.name}
            {...fadeUp(0.3 + i * 0.08)}
            whileHover={{ y: -4, boxShadow: `0 12px 32px rgba(25,28,29,0.12)` }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/select-subject')}
            className="text-left p-5 rounded-xl flex flex-col gap-3"
            style={{
              backgroundColor: '#ffffff',
              boxShadow: '0 2px 12px rgba(25,28,29,0.06)',
              border: `1px solid ${exam.light}`,
            }}
          >
            {/* Badge + name */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-black text-base flex-shrink-0"
                style={{ backgroundColor: exam.badgeBg }}>
                {exam.badge}
              </div>
              <div>
                <p className="font-bold text-base" style={{ fontFamily: 'Manrope,sans-serif', color: '#191c1d' }}>
                  {exam.name}
                </p>
                <p className="text-[11px] font-medium" style={{ color: '#6d7b6c' }}>{exam.full}</p>
              </div>
            </div>
            {/* Subjects */}
            <p className="text-xs" style={{ color: '#3d4a3d' }}>{exam.subjects}</p>
            {/* Meta + arrow */}
            <div className="flex items-center justify-between mt-auto pt-1">
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                style={{ backgroundColor: exam.light, color: exam.color }}>
                {exam.questions}
              </span>
              <span style={{ color: exam.color }}>{Ic.arrow}</span>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}

// ── Recent activity table ──────────────────────────────────────────
function RecentActivity() {
  const rows = [
    { subject: 'Mathematics', icon: Ic.math,    iconBg: '#fff3e0', iconColor: '#e65100', date: 'Apr 2, 2026', score: '92/100', status: 'Excellent',  statusBg: '#afefb4', statusColor: '#146b35' },
    { subject: 'English Language', icon: Ic.english, iconBg: '#e3f2fd', iconColor: '#1565c0', date: 'Mar 28, 2026', score: '78/100', status: 'Good',  statusBg: '#e8f5ed', statusColor: '#2f6a3c' },
    { subject: 'Biology',    icon: Ic.science,  iconBg: '#f3e5f5', iconColor: '#6a1b9a', date: 'Mar 24, 2026', score: '65/100', status: 'Average',    statusBg: '#edeeef', statusColor: '#3d4a3d' },
    { subject: 'Chemistry',  icon: Ic.science,  iconBg: '#e0f7fa', iconColor: '#006064', date: 'Mar 20, 2026', score: '89/100', status: 'Excellent',  statusBg: '#afefb4', statusColor: '#146b35' },
  ]

  return (
    <motion.div {...fadeUp(0.36)} className="lg:col-span-2">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-bold" style={{ fontFamily: 'Manrope,sans-serif', color: '#191c1d' }}>
          Recent Activity
        </h4>
        <button className="text-sm font-semibold transition-colors" style={{ color: '#006e2f' }}>
          View All
        </button>
      </div>
      <div className="rounded-xl overflow-hidden" style={{ backgroundColor: '#ffffff', boxShadow: '0 2px 12px rgba(25,28,29,0.06)' }}>
        {/* Table header */}
        <div className="grid px-5 py-3"
          style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr', backgroundColor: '#e7e8e9' }}>
          {['Subject', 'Date', 'Score', 'Status'].map((h, i) => (
            <span key={h} className="text-[11px] font-bold uppercase tracking-wider"
              style={{ color: '#3d4a3d', textAlign: i >= 2 ? 'center' : 'left' }}>
              {h}
            </span>
          ))}
        </div>
        {/* Rows */}
        {rows.map((row, i) => (
          <motion.div
            key={row.subject}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + i * 0.06 }}
            className="grid px-5 py-4 items-center transition-colors duration-150"
            style={{
              gridTemplateColumns: '2fr 1fr 1fr 1fr',
              borderTop: i === 0 ? 'none' : '1px solid #edeeef',
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#f3f4f5')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = 'transparent')}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: row.iconBg, color: row.iconColor }}>
                {row.icon}
              </div>
              <span className="font-semibold text-sm" style={{ color: '#191c1d' }}>{row.subject}</span>
            </div>
            <span className="text-sm" style={{ color: '#6d7b6c' }}>{row.date}</span>
            <span className="text-sm font-bold text-center" style={{ color: '#191c1d' }}>{row.score}</span>
            <div className="flex justify-center">
              <span className="text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full"
                style={{ backgroundColor: row.statusBg, color: row.statusColor }}>
                {row.status}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

// ── Coming up panel ────────────────────────────────────────────────
function ComingUp() {
  const upcoming = [
    { month: 'APR', day: '10', subject: 'Physics', time: '09:00 AM', room: 'Hall A', questions: 40, mins: 60 },
    { month: 'APR', day: '14', subject: 'Further Maths', time: '11:00 AM', room: 'Hall B', questions: 50, mins: 90 },
  ]

  return (
    <motion.div {...fadeUp(0.4)} className="flex flex-col gap-5">
      <h4 className="text-lg font-bold" style={{ fontFamily: 'Manrope,sans-serif', color: '#191c1d' }}>
        Coming Up
      </h4>

      {upcoming.map((item, i) => (
        <div key={i} className="p-5 rounded-xl flex flex-col gap-3"
          style={{ backgroundColor: '#f3f4f5', border: '1px solid rgba(188,203,185,0.2)' }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0"
              style={{ backgroundColor: '#ffffff', boxShadow: '0 2px 8px rgba(25,28,29,0.08)' }}>
              <span className="text-[9px] font-black uppercase" style={{ color: '#006e2f' }}>{item.month}</span>
              <span className="text-lg font-black leading-none" style={{ fontFamily: 'Manrope,sans-serif', color: '#191c1d' }}>{item.day}</span>
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color: '#191c1d' }}>{item.subject}</p>
              <p className="text-xs" style={{ color: '#6d7b6c' }}>{item.time} • {item.room}</p>
            </div>
          </div>
          <p className="text-xs" style={{ color: '#3d4a3d' }}>
            {item.questions} questions • {item.mins} minutes
          </p>
          <button className="w-full py-2 text-sm font-bold rounded-lg transition-colors"
            style={{ backgroundColor: '#ffffff', color: '#191c1d', border: '1px solid #e7e8e9' }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#f8f9fa')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#ffffff')}
          >
            Set Reminder
          </button>
        </div>
      ))}

      {/* Preparation progress */}
      <div className="p-5 rounded-xl" style={{ backgroundColor: '#ffffff', boxShadow: '0 2px 12px rgba(25,28,29,0.06)' }}>
        <div className="flex justify-between items-center mb-4">
          <span className="font-bold text-sm" style={{ color: '#191c1d' }}>Preparation Progress</span>
          <span className="text-xs font-bold" style={{ color: '#006e2f' }}>74% Total</span>
        </div>
        {[
          { label: 'Reading Material', val: 88, color: '#006e2f' },
          { label: 'Assignments',      val: 62, color: '#2f6a3c' },
          { label: 'Practice Exams',   val: 45, color: '#9e4036' },
        ].map(({ label, val, color }) => (
          <div key={label} className="mb-3">
            <div className="flex justify-between text-[11px] font-bold uppercase mb-1.5" style={{ color: '#3d4a3d' }}>
              <span>{label}</span><span>{val}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full" style={{ backgroundColor: '#edeeef' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${val}%` }}
                transition={{ delay: 0.6, duration: 0.7, ease: 'easeOut' }}
                className="h-1.5 rounded-full"
                style={{ backgroundColor: color }}
              />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// ── Dashboard Page root ────────────────────────────────────────────
export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f9fa' }}>
      <style>{`
        @media (min-width: 768px) {
          .sidebar-desktop { transform: translateX(0) !important; }
          .main-content   { margin-left: 256px; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
      `}</style>

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main-content flex flex-col min-h-screen">
        <TopBar onMenuClick={() => setSidebarOpen(o => !o)} />

        <main className="flex-1 p-5 md:p-8 max-w-screen-xl mx-auto w-full">

          {/* Greeting */}
          <motion.section {...fadeUp(0.05)} className="mb-8 flex flex-wrap gap-4 items-end justify-between">
            <div>
              <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight"
                style={{ fontFamily: 'Manrope,sans-serif', color: '#191c1d' }}>
                Welcome back, Amina 👋
              </h3>
              <p className="mt-1 text-sm" style={{ color: '#3d4a3d' }}>
                You have <span className="font-bold" style={{ color: '#006e2f' }}>3 exams</span> scheduled this week. Stay focused.
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-5 py-2.5 text-white font-bold text-sm rounded-xl"
              style={{ backgroundColor: '#006e2f', boxShadow: '0 4px 12px rgba(0,110,47,0.25)', fontFamily: 'Manrope,sans-serif' }}
            >
              {Ic.play}
              Start Mock Test
            </motion.button>
          </motion.section>

          {/* Stats */}
          <StatCards />

          {/* Mock exams */}
          <MockExamSection />

          {/* Bottom split: table + coming up */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <RecentActivity />
            <ComingUp />
          </div>

        </main>
      </div>
    </div>
  )
}