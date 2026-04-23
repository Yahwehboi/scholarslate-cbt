import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { formatClassLabel, getUserInitials } from '../lib/auth'

// ── Shared subject config type (mirrors AdminControlPage) ──────────
export type SubjectStatus = 'not-taken' | 'in-progress' | 'completed'

export interface SubjectConfig {
  id: number; name: string; code: string;
  iconKey: string; iconBg: string;
  active: boolean; time: number; maxAttempts: number;
  description: string; questions: number; credits: number;
  status: SubjectStatus; attemptsUsed: number; duration: string;
}

const DEFAULT_SUBJECTS: SubjectConfig[] = [
  { id:1, name:'Mathematics',      code:'MATH-S1',  iconKey:'math',    iconBg:'#e8f5e9', active:true,  time:60, maxAttempts:2, description:'Algebra, calculus, statistics and number theory.',       questions:50, credits:2, status:'not-taken',   attemptsUsed:0, duration:'60 mins' },
  { id:2, name:'Physics',          code:'PHYS-S1',  iconKey:'science', iconBg:'#e3f2fd', active:true,  time:45, maxAttempts:2, description:'Mechanics, electromagnetism and modern physics.',         questions:50, credits:3, status:'not-taken',   attemptsUsed:0, duration:'45 mins' },
  { id:3, name:'English Language', code:'ENGL-S1',  iconKey:'english', iconBg:'#fce4ec', active:true,  time:60, maxAttempts:3, description:'Comprehension, grammar and essay composition.',           questions:60, credits:3, status:'in-progress', attemptsUsed:1, duration:'60 mins' },
  { id:4, name:'Chemistry',        code:'CHEM-S1',  iconKey:'science', iconBg:'#fff3e0', active:false, time:45, maxAttempts:2, description:'Organic reactions, periodic trends and chemical bonding.', questions:50, credits:3, status:'not-taken',   attemptsUsed:0, duration:'45 mins' },
  { id:5, name:'History',          code:'HIST-S1',  iconKey:'history', iconBg:'#f3e5f5', active:false, time:45, maxAttempts:2, description:'Pre-colonial Africa, independence movements and governance.',questions:40, credits:2, status:'not-taken',   attemptsUsed:0, duration:'45 mins' },
  { id:6, name:'Biology',          code:'BIO-S1',   iconKey:'science', iconBg:'#e8f5e9', active:true,  time:60, maxAttempts:2, description:'Cell biology, genetics and ecological systems.',            questions:50, credits:4, status:'completed',   attemptsUsed:2, duration:'60 mins' },
]

const loadSubjects = (): SubjectConfig[] => {
  try {
    const saved = localStorage.getItem('cbt_subjects')
    return saved ? JSON.parse(saved) : DEFAULT_SUBJECTS
  } catch { return DEFAULT_SUBJECTS }
}

// ── SVG Icons ──────────────────────────────────────────────────────
const Ic = {
  school:    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/></svg>,
  dashboard: <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>,
  book:      <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z"/></svg>,
  results:   <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/></svg>,
  profile:   <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>,
  help:      <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg>,
  logout:    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>,
  menu:      <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>,
  search:    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>,
  arrow:     <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg>,
  play:      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M8 5v14l11-7z"/></svg>,
  lock:      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>,
  more:      <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28"><path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>,
  info:      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>,
  calendar:  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z"/></svg>,
  clock:     <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>,
  // Subject-specific icons by iconKey
  math:      <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM7.5 18l2-4H7v-2h3.5l-2-4H11l1 2.5L13 8h2.5l-2 4H17v2h-2.5l2 4H14l-2-5-2 5H7.5z"/></svg>,
  english:   <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04z"/></svg>,
  science:   <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M7 2v2h1v7.6L4.8 17c-.5.8-.3 1.9.5 2.4.3.2.6.3.9.3h11.6c.9 0 1.7-.8 1.7-1.7 0-.3-.1-.6-.2-.9L16 11.6V4h1V2H7zm3 2h4v2h-4V4zm-1.2 8h6.4l1.7 3H8.1l1.7-3z"/></svg>,
  history:   <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/></svg>,
}

const ICON_MAP: Record<string, React.ReactNode> = {
  math: Ic.math, science: Ic.science, english: Ic.english,
  history: Ic.history, book: Ic.book,
}

const statusConfig = {
  'not-taken':   { label: 'Not Taken',   dot: '#006e2f', text: '#006e2f', progressBg: '#006e2f' },
  'in-progress': { label: 'In Progress', dot: '#9e4036', text: '#9e4036', progressBg: '#9e4036' },
  'completed':   { label: 'Completed',   dot: '#6d7b6c', text: '#6d7b6c', progressBg: '#6d7b6c' },
}

// ── Sidebar ────────────────────────────────────────────────────────
function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate(), location = useLocation()
  const { logout } = useAuth()
  const navItems = [
    { icon: Ic.dashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Ic.book,      label: 'Subjects',  path: '/select-subject' },
    { icon: Ic.results,   label: 'Results',   path: '/results-history' },
    { icon: Ic.profile,   label: 'Profile',   path: '/profile' },
  ]
  return (
    <>
      {open && <div className="fixed inset-0 z-30 md:hidden" style={{ backgroundColor: 'rgba(25,28,29,0.4)', backdropFilter: 'blur(4px)' }} onClick={onClose} />}
      <aside className="sidebar-desktop fixed left-0 top-0 h-screen z-40 flex flex-col transition-transform duration-300"
        style={{ width: '256px', backgroundColor: '#f3f4f5', transform: open ? 'translateX(0)' : 'translateX(-100%)' }}>
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center text-white flex-shrink-0" style={{ backgroundColor: '#006e2f', borderRadius: '0.5rem' }}>{Ic.school}</div>
          <div>
            <h1 className="text-base font-black leading-none" style={{ fontFamily: 'Manrope,sans-serif', color: '#006e2f' }}>ScholarSlate</h1>
            <p className="text-[10px] uppercase tracking-widest font-bold mt-0.5" style={{ color: '#6d7b6c' }}>Student Portal</p>
          </div>
        </div>
        <nav className="flex-1 mt-2 flex flex-col">
          {navItems.map(({ icon, label, path }) => {
            const active = location.pathname === path
            return (
              <button key={path} onClick={() => { navigate(path); onClose() }}
                className="flex items-center gap-3 py-3 px-6 text-left transition-all duration-200"
                style={{ color: active ? '#006e2f' : '#3d4a3d', backgroundColor: active ? '#ffffff' : 'transparent', borderLeft: active ? '4px solid #006e2f' : '4px solid transparent', fontWeight: active ? 600 : 500, fontFamily: 'Inter,sans-serif' }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = '#e7e8e9' }}
                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}>
                {icon}<span>{label}</span>
              </button>
            )
          })}
        </nav>
        <div className="p-4 flex flex-col gap-1">
          {[{ icon: Ic.help, label: 'Help Center' }, { icon: Ic.logout, label: 'Logout' }].map(({ icon, label }) => (
            <button key={label} className="flex items-center gap-3 py-3 px-6 text-sm font-medium transition-colors duration-200"
              style={{ color: '#3d4a3d', fontFamily: 'Inter,sans-serif', borderRadius: '0.5rem' }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#e7e8e9')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = 'transparent')}
              onClick={() => {
                if (label !== 'Logout') return
                logout()
                navigate('/login', { replace: true })
              }}>
              {icon}<span>{label}</span>
            </button>
          ))}
        </div>
      </aside>
    </>
  )
}

// ── TopBar ─────────────────────────────────────────────────────────
function TopBar({ onMenuClick }: { onMenuClick: () => void }) {
  const { session } = useAuth()
  const studentName = session?.role === 'student' ? session.fullName : 'Student'
  const studentClass = session?.role === 'student' ? formatClassLabel(session.className ?? '') : ''
  const studentInitials = getUserInitials(studentName)

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between px-6 md:px-8 h-16"
      style={{ backgroundColor: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', boxShadow: '0 1px 0 rgba(188,203,185,0.3)' }}>
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="p-2 rounded-lg transition-colors md:hidden" style={{ color: '#3d4a3d' }}>{Ic.menu}</button>
        <h2 className="text-lg font-bold" style={{ fontFamily: 'Manrope,sans-serif', color: '#191c1d' }}>School CBT System</h2>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-bold leading-none" style={{ color: '#191c1d' }}>{studentName}</p>
          <p className="text-[10px] uppercase tracking-tight mt-0.5" style={{ color: '#6d7b6c' }}>{studentClass}</p>
        </div>
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
          style={{ background: 'linear-gradient(135deg,#006e2f,#22c55e)' }}>{studentInitials}</div>
      </div>
    </header>
  )
}

// ── Subject card ───────────────────────────────────────────────────
function SubjectCard({ subject, index }: { subject: SubjectConfig; index: number }) {
  const navigate = useNavigate()
  const cfg = statusConfig[subject.status]
  const progressPct = subject.maxAttempts > 0 ? (subject.attemptsUsed / subject.maxAttempts) * 100 : 0
  const isLocked = subject.status === 'completed'
  const btnLabel = subject.status === 'not-taken' ? 'Start Exam' : subject.status === 'in-progress' ? 'Resume Exam' : 'Limit Reached'
  const icon = ICON_MAP[subject.iconKey] || ICON_MAP['book']

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 + index * 0.06, duration: 0.4, ease: 'easeOut' }}
      whileHover={!isLocked ? { y: -4, boxShadow: '0 16px 48px rgba(25,28,29,0.1)' } : {}}
      className="flex flex-col p-7 rounded-2xl"
      style={{ backgroundColor: '#ffffff', boxShadow: '0 2px 16px rgba(25,28,29,0.06)', opacity: isLocked ? 0.72 : 1 }}>

      <div className="flex justify-between items-start mb-5">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: subject.iconBg, color: '#006e2f' }}>
          {icon}
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full"
          style={{ backgroundColor: '#e7e8e9', color: '#3d4a3d' }}>
          {subject.credits} Credits
        </span>
      </div>

      <h3 className="text-xl font-bold mb-1" style={{ fontFamily: 'Manrope,sans-serif', color: '#191c1d' }}>{subject.name}</h3>
      <p className="text-sm mb-5 leading-relaxed" style={{ color: '#3d4a3d' }}>{subject.description}</p>

      <div className="flex gap-3 mb-5">
        <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ backgroundColor: '#f3f4f5', color: '#6d7b6c' }}>{subject.questions} questions</span>
        <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ backgroundColor: '#f3f4f5', color: '#6d7b6c' }}>{subject.duration}</span>
      </div>

      <div className="mt-auto space-y-3">
        <div className="flex justify-between text-sm">
          <span style={{ color: '#3d4a3d' }}>Attempts used</span>
          <span className="font-bold" style={{ color: '#191c1d' }}>{subject.attemptsUsed} / {subject.maxAttempts}</span>
        </div>
        <div className="w-full h-1.5 rounded-full" style={{ backgroundColor: '#edeeef' }}>
          <motion.div
            initial={{ width: 0 }} animate={{ width: `${progressPct}%` }}
            transition={{ delay: 0.3 + index * 0.06, duration: 0.6, ease: 'easeOut' }}
            className="h-1.5 rounded-full" style={{ backgroundColor: cfg.progressBg }} />
        </div>
        <div className="flex items-center gap-2 pb-1">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cfg.dot }} />
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: cfg.text }}>{cfg.label}</span>
        </div>

        {isLocked ? (
          <div className="w-full py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm font-bold cursor-not-allowed"
            style={{ backgroundColor: '#edeeef', color: '#6d7b6c' }}>
            {Ic.lock}<span>Limit Reached</span>
          </div>
        ) : (
          <motion.button whileHover={{ opacity: 0.9 }} whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/instructions', { state: { subject } })}
            className="w-full py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #006e2f 0%, #22c55e 100%)', boxShadow: '0 4px 12px rgba(34,197,94,0.25)' }}>
            <span>{btnLabel}</span>
            {subject.status === 'in-progress' ? Ic.play : Ic.arrow}
          </motion.button>
        )}
      </div>
    </motion.div>
  )
}

// ── Page root ──────────────────────────────────────────────────────
export default function SelectSubjectPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')

  // Load subjects from localStorage (set by AdminControlPage)
  const [subjects, setSubjects] = useState<SubjectConfig[]>([])

  useEffect(() => {
    const loaded = loadSubjects()
    // Only show active subjects on student page
    setSubjects(loaded)
  }, [])

  type FilterKey = 'All' | 'Not Taken' | 'In Progress' | 'Completed'
  const filterMap: Record<FilterKey, SubjectStatus | null> = {
    'All': null, 'Not Taken': 'not-taken', 'In Progress': 'in-progress', 'Completed': 'completed',
  }

  const filtered = subjects.filter(s => {
    if (!s.active) return false // only show active subjects
    const matchSearch = s.name.toLowerCase().includes(query.toLowerCase())
    const matchFilter = filterMap[activeFilter as FilterKey] === null || s.status === filterMap[activeFilter as FilterKey]
    return matchSearch && matchFilter
  })

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f9fa' }}>
      <style>{`@media(min-width:768px){.sidebar-desktop{transform:translateX(0)!important;}.main-content{margin-left:256px;}}`}</style>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main-content flex flex-col min-h-screen">
        <TopBar onMenuClick={() => setSidebarOpen(o => !o)} />

        <main className="flex-1 p-5 md:p-8 max-w-screen-xl mx-auto w-full">
          <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-8">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2" style={{ fontFamily: 'Manrope,sans-serif', color: '#191c1d' }}>Select Your Subject</h2>
            <p className="text-base" style={{ color: '#3d4a3d' }}>Choose a subject to begin your examination. Ensure you have a stable connection.</p>
          </motion.section>

          {/* Search + filter */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#bccbb9' }}>{Ic.search}</span>
              <input type="text" placeholder="Search subjects..." value={query} onChange={e => setQuery(e.target.value)}
                style={{ width: '100%', paddingLeft: '40px', paddingRight: '16px', paddingTop: '10px', paddingBottom: '10px', backgroundColor: '#ffffff', border: '1px solid #e7e8e9', borderRadius: '0.75rem', outline: 'none', fontFamily: 'Inter,sans-serif', fontSize: '0.9rem', color: '#191c1d', boxShadow: '0 1px 4px rgba(25,28,29,0.04)' }}
                onFocus={e => (e.target.style.borderColor = '#006e2f')}
                onBlur={e => (e.target.style.borderColor = '#e7e8e9')} />
            </div>
            <div className="flex gap-2 flex-wrap">
              {(['All', 'Not Taken', 'In Progress', 'Completed'] as FilterKey[]).map(f => (
                <button key={f} onClick={() => setActiveFilter(f)}
                  className="px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200"
                  style={{ backgroundColor: activeFilter === f ? '#006e2f' : '#ffffff', color: activeFilter === f ? '#ffffff' : '#3d4a3d', border: activeFilter === f ? '1px solid #006e2f' : '1px solid #e7e8e9', boxShadow: '0 1px 4px rgba(25,28,29,0.04)' }}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filtered.map((subject, i) => <SubjectCard key={subject.id} subject={subject} index={i} />)}
              {activeFilter === 'All' && query === '' && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                  className="flex flex-col items-center justify-center p-10 rounded-2xl text-center"
                  style={{ backgroundColor: '#f3f4f5', border: '2px dashed rgba(188,203,185,0.5)', minHeight: '240px' }}>
                  <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#ffffff', boxShadow: '0 2px 8px rgba(25,28,29,0.06)', color: '#6d7b6c' }}>{Ic.more}</div>
                  <h4 className="text-lg font-bold mb-2" style={{ fontFamily: 'Manrope,sans-serif', color: '#3d4a3d' }}>More Subjects Soon</h4>
                  <p className="text-sm" style={{ color: '#6d7b6c', maxWidth: '200px' }}>Upcoming exams will appear here once scheduled by your administrator.</p>
                </motion.div>
              )}
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#e7e8e9', color: '#6d7b6c' }}>{Ic.search}</div>
              <h4 className="text-xl font-bold mb-1" style={{ fontFamily: 'Manrope,sans-serif', color: '#191c1d' }}>No subjects found</h4>
              <p className="text-sm" style={{ color: '#6d7b6c' }}>Try a different search term or filter.</p>
            </motion.div>
          )}

          {/* Footer */}
          <motion.footer initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            className="mt-14 pt-6 flex flex-col md:flex-row justify-between items-center gap-4"
            style={{ borderTop: '1px solid #edeeef' }}>
            <div className="flex items-center gap-5 text-sm font-medium" style={{ color: '#6d7b6c' }}>
              <span className="flex items-center gap-1.5">{Ic.calendar} Term: 2025/2026</span>
              <span className="flex items-center gap-1.5">{Ic.clock} Timezone: GMT+1</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-xs" style={{ backgroundColor: '#e7e8e9', color: '#3d4a3d' }}>
              <span style={{ color: '#006e2f' }}>{Ic.info}</span>
              System status: <span className="font-bold ml-1" style={{ color: '#006e2f' }}>ALL SYSTEMS OPERATIONAL</span>
            </div>
          </motion.footer>
        </main>
      </div>
    </div>
  )
}