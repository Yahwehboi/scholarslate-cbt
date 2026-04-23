import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Ic = {
  admin:    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>,
  upload:   <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M19.35 10.04A7.49 7.49 0 0 0 12 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 0 0 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/></svg>,
  settings: <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>,
  analytics:<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/></svg>,
  students: <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>,
  logout:   <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>,
  menu:     <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>,
  add:      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>,
  save:     <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg>,
  delete:   <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>,
  edit:     <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>,
  check:    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>,
  math:     <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM7.5 18l2-4H7v-2h3.5l-2-4H11l1 2.5L13 8h2.5l-2 4H17v2h-2.5l2 4H14l-2-5-2 5H7.5z"/></svg>,
  science:  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M7 2v2h1v7.6L4.8 17c-.5.8-.3 1.9.5 2.4.3.2.6.3.9.3h11.6c.9 0 1.7-.8 1.7-1.7 0-.3-.1-.6-.2-.9L16 11.6V4h1V2H7z"/></svg>,
  english:  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04z"/></svg>,
  history:  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9z"/></svg>,
  book:     <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1z"/></svg>,
}

export type SubjectConfig = {
  id: number; name: string; code: string;
  iconKey: string; iconBg: string;
  active: boolean; time: number; maxAttempts: number;
  description: string; questions: number; credits: number;
  status: 'not-taken' | 'in-progress' | 'completed';
  attemptsUsed: number; duration: string;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  math: Ic.math, science: Ic.science, english: Ic.english,
  history: Ic.history, book: Ic.book,
}

const DEFAULT_SUBJECTS: SubjectConfig[] = [
  { id:1, name:'Mathematics',      code:'MATH-S1',  iconKey:'math',    iconBg:'#e8f5e9', active:true,  time:60, maxAttempts:2, description:'Algebra, calculus, statistics and number theory.', questions:50, credits:2, status:'not-taken', attemptsUsed:0, duration:'60 mins' },
  { id:2, name:'Physics',          code:'PHYS-S1',  iconKey:'science', iconBg:'#e3f2fd', active:true,  time:45, maxAttempts:2, description:'Mechanics, electromagnetism and modern physics.', questions:50, credits:3, status:'not-taken', attemptsUsed:0, duration:'45 mins' },
  { id:3, name:'English Language', code:'ENGL-S1',  iconKey:'english', iconBg:'#fce4ec', active:true,  time:60, maxAttempts:3, description:'Comprehension, grammar and essay composition.', questions:60, credits:3, status:'in-progress', attemptsUsed:1, duration:'60 mins' },
  { id:4, name:'Chemistry',        code:'CHEM-S1',  iconKey:'science', iconBg:'#fff3e0', active:false, time:45, maxAttempts:2, description:'Organic reactions, periodic trends and chemical bonding.', questions:50, credits:3, status:'not-taken', attemptsUsed:0, duration:'45 mins' },
  { id:5, name:'History',          code:'HIST-S1',  iconKey:'history', iconBg:'#f3e5f5', active:false, time:45, maxAttempts:2, description:'Pre-colonial Africa, independence movements and governance.', questions:40, credits:2, status:'not-taken', attemptsUsed:0, duration:'45 mins' },
  { id:6, name:'Biology',          code:'BIO-S1',   iconKey:'science', iconBg:'#e8f5e9', active:true,  time:60, maxAttempts:2, description:'Cell biology, genetics and ecological systems.', questions:50, credits:4, status:'completed', attemptsUsed:2, duration:'60 mins' },
]

// Save/load subjects from localStorage so all pages share the same list
export const loadSubjects = (): SubjectConfig[] => {
  try {
    const saved = localStorage.getItem('cbt_subjects')
    return saved ? JSON.parse(saved) : DEFAULT_SUBJECTS
  } catch { return DEFAULT_SUBJECTS }
}

export const saveSubjectsToStorage = (subjects: SubjectConfig[]) => {
  localStorage.setItem('cbt_subjects', JSON.stringify(subjects))
}

function AdminSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate(), location = useLocation()
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
              <p className="text-[10px]" style={{ color: '#6d7b6c' }}>ID: 44920</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!checked)} style={{ width: '44px', height: '24px', position: 'relative', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}>
      <div style={{ width: '100%', height: '100%', borderRadius: '9999px', backgroundColor: checked ? '#006e2f' : '#e1e3e4', transition: 'background-color 0.2s' }} />
      <div style={{ position: 'absolute', top: '2px', left: '2px', width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.15)', transform: checked ? 'translateX(20px)' : 'translateX(0)', transition: 'transform 0.2s' }} />
    </button>
  )
}

const ICON_OPTIONS = [
  { key: 'math',    label: 'Maths',   bg: '#e8f5e9' },
  { key: 'science', label: 'Science', bg: '#e3f2fd' },
  { key: 'english', label: 'English', bg: '#fce4ec' },
  { key: 'history', label: 'History', bg: '#f3e5f5' },
  { key: 'book',    label: 'Book',    bg: '#fff3e0' },
]

export default function AdminControlPage() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [saved, setSaved] = useState(false)
  const [subjects, setSubjects] = useState<SubjectConfig[]>(() => loadSubjects())
  const [editingId, setEditingId] = useState<number | null>(null)

  // Sync to localStorage whenever subjects change
  useEffect(() => {
    if (hasChanges) saveSubjectsToStorage(subjects)
  }, [subjects, hasChanges])

  const update = (id: number, field: keyof SubjectConfig, val: unknown) => {
    setSubjects(prev => prev.map(s => s.id === id ? { ...s, [field]: val } : s))
    setHasChanges(true)
  }

  const deleteSubject = (id: number) => {
    setSubjects(prev => prev.filter(s => s.id !== id))
    setHasChanges(true)
  }

  const addSubject = () => {
    const id = Date.now()
    const newS: SubjectConfig = {
      id, name: 'New Subject', code: `SUB-${id}`, iconKey: 'book', iconBg: '#fff3e0',
      active: false, time: 60, maxAttempts: 2,
      description: 'Subject description goes here.', questions: 50, credits: 2,
      status: 'not-taken', attemptsUsed: 0, duration: '60 mins',
    }
    setSubjects(prev => [...prev, newS])
    setHasChanges(true)
    setEditingId(id) // auto-open edit for new subject
  }

  const saveChanges = () => {
    // Update duration strings to match time
    const updated = subjects.map(s => ({ ...s, duration: `${s.time} mins`, questions: s.questions || 50 }))
    setSubjects(updated)
    saveSubjectsToStorage(updated)
    setSaved(true)
    setHasChanges(false)
    setTimeout(() => setSaved(false), 3000)
  }

  const activeCount = subjects.filter(s => s.active).length
  const avgTime = Math.round(subjects.reduce((s, r) => s + r.time, 0) / (subjects.length || 1))
  const handleLogout = () => {
    logout().then(() => navigate('/login', { replace: true }))
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f9fa' }}>
      <style>{`@media(min-width:768px){.sidebar-desktop{transform:translateX(0)!important;}.main-content{margin-left:256px;}}`}</style>
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main-content flex flex-col min-h-screen">
        <header className="sticky top-0 z-20 flex items-center justify-between px-6 md:px-8 h-16"
          style={{ backgroundColor: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', boxShadow: '0 1px 0 rgba(188,203,185,0.3)' }}>
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(o => !o)} className="p-2 rounded-lg md:hidden" style={{ color: '#3d4a3d' }}>{Ic.menu}</button>
            <h2 className="text-lg font-bold" style={{ fontFamily: 'Manrope,sans-serif', color: '#191c1d' }}>School CBT System</h2>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium hidden sm:block" style={{ color: '#3d4a3d' }}>Administrator</span>
            <button onClick={handleLogout} className="text-sm font-bold" style={{ color: '#006e2f' }}>Logout</button>
          </div>
        </header>

        <main className="flex-1 p-5 md:p-8 max-w-screen-xl mx-auto w-full pb-32">
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2" style={{ fontFamily: 'Manrope,sans-serif', color: '#191c1d' }}>Subjects Control</h1>
            <p className="text-base max-w-2xl" style={{ color: '#3d4a3d' }}>
              Manage exam availability, timing and attempt limits. Changes are instantly reflected on the student portal after saving.
            </p>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            {[
              { label: 'Active Subjects', value: `${activeCount}`, sub: `/ ${subjects.length} Total`, color: '#006e2f', bg: '#ffffff' },
              { label: 'Avg. Exam Time',  value: `${avgTime}`,     sub: 'Minutes',                   color: '#2f6a3c', bg: '#ffffff' },
              { label: 'System Status',   value: 'Live',           sub: '& Accepting Exams',         color: '#004b1e', bg: '#22c55e' },
            ].map(({ label, value, sub, color, bg }, i) => (
              <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className="p-7 rounded-2xl flex flex-col gap-3" style={{ backgroundColor: bg, boxShadow: '0 2px 12px rgba(25,28,29,0.07)' }}>
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: bg === '#22c55e' ? 'rgba(0,75,30,0.8)' : '#6d7b6c' }}>{label}</span>
                <div className="flex items-end gap-2">
                  <span className="text-5xl font-extrabold" style={{ fontFamily: 'Manrope,sans-serif', color }}>{value}</span>
                  <span className="mb-1 text-sm" style={{ color: bg === '#22c55e' ? 'rgba(0,75,30,0.7)' : '#6d7b6c' }}>{sub}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Table */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="p-6 md:p-8 rounded-2xl mb-6" style={{ backgroundColor: '#ffffff', boxShadow: '0 4px 20px rgba(25,28,29,0.07)' }}>
            <div className="flex items-center justify-between mb-7">
              <h3 className="text-xl font-bold" style={{ fontFamily: 'Manrope,sans-serif', color: '#191c1d' }}>Exam Configuration</h3>
              <motion.button whileTap={{ scale: 0.96 }} onClick={addSubject}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold"
                style={{ backgroundColor: '#e8f5ed', color: '#006e2f' }}>
                {Ic.add} Add Subject
              </motion.button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left" style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#e7e8e9' }}>
                    {['Subject Name', 'Active', 'Time (Mins)', 'Max Attempts', 'Questions', 'Actions'].map((h, i) => (
                      <th key={h} className="py-4 px-5 text-[11px] font-bold uppercase tracking-widest"
                        style={{ color: '#3d4a3d', textAlign: i >= 2 ? 'center' : 'left' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((s, i) => (
                    <>
                      <tr key={s.id} style={{ borderTop: i === 0 ? 'none' : '1px solid #f3f4f5' }}
                        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#f8f9fa')}
                        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = 'transparent')}>

                        {/* Subject name — click to edit */}
                        <td className="py-5 px-5">
                          <div className="flex items-center gap-3">
                            {/* Icon selector */}
                            <button onClick={() => setEditingId(editingId === s.id ? null : s.id)}
                              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
                              style={{ backgroundColor: s.iconBg, color: '#006e2f' }}
                              title="Click to edit subject">
                              {ICON_MAP[s.iconKey] || Ic.book}
                            </button>
                            <div className="min-w-0">
                              {/* Editable name inline */}
                              <input
                                value={s.name}
                                onChange={e => update(s.id, 'name', e.target.value)}
                                onBlur={e => {
                                  // auto-generate code from name
                                  const code = e.target.value.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 4) + '-S1'
                                  update(s.id, 'code', code)
                                }}
                                style={{
                                  background: 'transparent', border: 'none', outline: 'none',
                                  fontFamily: 'Manrope,sans-serif', fontWeight: 700, fontSize: '0.9rem',
                                  color: '#191c1d', width: '100%', padding: '2px 4px',
                                  borderBottom: '1px dashed #bccbb9', cursor: 'text',
                                }}
                                onFocus={e => (e.target.style.borderBottomColor = '#006e2f')}
                              />
                              <p className="text-xs mt-0.5 pl-1" style={{ color: '#6d7b6c', fontFamily: 'monospace' }}>{s.code}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-5 px-5">
                          <Toggle checked={s.active} onChange={v => update(s.id, 'active', v)} />
                        </td>

                        {(['time', 'maxAttempts', 'questions'] as const).map(field => (
                          <td key={field} className="py-5 px-5 text-center">
                            <input type="number" value={s[field] as number} min={field === 'time' ? 15 : 1} max={field === 'time' ? 180 : field === 'questions' ? 200 : 5}
                              onChange={e => update(s.id, field, parseInt(e.target.value) || 1)}
                              style={{ width: '70px', textAlign: 'center', background: 'transparent', border: 'none', borderBottom: '2px solid #e7e8e9', outline: 'none', fontFamily: 'Manrope,sans-serif', fontWeight: 700, fontSize: '0.95rem', color: '#191c1d', padding: '4px 0' }}
                              onFocus={e => (e.target.style.borderBottomColor = '#006e2f')}
                              onBlur={e => (e.target.style.borderBottomColor = '#e7e8e9')} />
                          </td>
                        ))}

                        <td className="py-5 px-5 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <motion.button whileTap={{ scale: 0.9 }}
                              onClick={() => setEditingId(editingId === s.id ? null : s.id)}
                              className="p-2 rounded-full transition-colors" title="Edit details"
                              style={{ color: '#006e2f', backgroundColor: '#e8f5ed' }}>
                              {Ic.edit}
                            </motion.button>
                            <motion.button whileTap={{ scale: 0.9 }} onClick={() => deleteSubject(s.id)}
                              className="p-2 rounded-full transition-colors"
                              style={{ color: '#bccbb9' }}
                              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#9e4036'; (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(158,64,54,0.08)' }}
                              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#bccbb9'; (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}>
                              {Ic.delete}
                            </motion.button>
                          </div>
                        </td>
                      </tr>

                      {/* Expandable edit row */}
                      {editingId === s.id && (
                        <tr key={`edit-${s.id}`}>
                          <td colSpan={6} style={{ padding: 0, backgroundColor: '#f8f9fa' }}>
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                              className="px-6 py-5 flex flex-wrap gap-5 items-start">

                              {/* Icon picker */}
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: '#6d7b6c' }}>Subject Icon</p>
                                <div className="flex gap-2">
                                  {ICON_OPTIONS.map(opt => (
                                    <button key={opt.key} onClick={() => { update(s.id, 'iconKey', opt.key); update(s.id, 'iconBg', opt.bg) }}
                                      className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                                      style={{ backgroundColor: opt.bg, color: '#006e2f', border: s.iconKey === opt.key ? '2px solid #006e2f' : '2px solid transparent' }}
                                      title={opt.label}>
                                      {ICON_MAP[opt.key]}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Description */}
                              <div className="flex-1 min-w-[200px]">
                                <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: '#6d7b6c' }}>Description (shown to students)</p>
                                <input value={s.description} onChange={e => update(s.id, 'description', e.target.value)}
                                  placeholder="Short description of subject topics..."
                                  style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', borderBottom: '1px solid #bccbb9', fontFamily: 'Inter,sans-serif', fontSize: '0.85rem', color: '#191c1d', padding: '6px 0' }}
                                  onFocus={e => (e.target.style.borderBottomColor = '#006e2f')}
                                  onBlur={e => (e.target.style.borderBottomColor = '#bccbb9')} />
                              </div>

                              {/* Credits */}
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: '#6d7b6c' }}>Credits</p>
                                <input type="number" value={s.credits} min={1} max={6}
                                  onChange={e => update(s.id, 'credits', parseInt(e.target.value) || 1)}
                                  style={{ width: '60px', textAlign: 'center', background: '#fff', border: '1px solid #e7e8e9', borderRadius: '0.5rem', outline: 'none', fontFamily: 'Manrope,sans-serif', fontWeight: 700, fontSize: '0.95rem', color: '#191c1d', padding: '6px' }} />
                              </div>

                              <div className="flex items-end">
                                <button onClick={() => setEditingId(null)}
                                  className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold"
                                  style={{ backgroundColor: '#006e2f', color: '#fff' }}>
                                  {Ic.check} Done
                                </button>
                              </div>
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </main>

        {/* Sticky save bar */}
        {hasChanges && (
          <motion.div initial={{ y: 80 }} animate={{ y: 0 }}
            className="fixed bottom-6 left-1/2 z-30 flex items-center justify-between gap-6 px-6 py-4 rounded-2xl"
            style={{ transform: 'translateX(-50%)', backgroundColor: '#ffffff', boxShadow: '0 8px 32px rgba(25,28,29,0.15)', border: '1px solid rgba(0,110,47,0.15)', minWidth: 'min(600px,90vw)' }}>
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#22c55e', animation: 'pulse 2s infinite' }} />
              <p className="text-sm font-medium" style={{ color: '#3d4a3d' }}>You have unsaved changes in subject configurations.</p>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <button onClick={() => { setSubjects(loadSubjects()); setHasChanges(false) }} className="px-5 py-2.5 rounded-full font-bold text-sm" style={{ color: '#6d7b6c', backgroundColor: '#f3f4f5' }}>Discard</button>
              <motion.button whileTap={{ scale: 0.96 }} onClick={saveChanges}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm text-white"
                style={{ background: 'linear-gradient(135deg,#006e2f,#22c55e)', boxShadow: '0 4px 14px rgba(34,197,94,0.3)' }}>
                {Ic.save} Save Settings
              </motion.button>
            </div>
          </motion.div>
        )}

        {saved && (
          <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-6 left-1/2 z-30 flex items-center gap-3 px-6 py-4 rounded-2xl"
            style={{ transform: 'translateX(-50%)', backgroundColor: '#e8f5ed', border: '1px solid rgba(0,110,47,0.2)', boxShadow: '0 8px 32px rgba(25,28,29,0.1)' }}>
            {Ic.check}
            <span className="font-bold text-sm" style={{ color: '#006e2f' }}>Settings saved! Students will see changes on next load.</span>
          </motion.div>
        )}
      </div>
    </div>
  )
}