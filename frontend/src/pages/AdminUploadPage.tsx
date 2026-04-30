import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/apiClient'

const Ic = {
  admin:    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg>,
  upload:   <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M19.35 10.04A7.49 7.49 0 0 0 12 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 0 0 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/></svg>,
  settings: <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58z"/></svg>,
  analytics:<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/></svg>,
  students: <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>,
  menu:     <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>,
  send:     <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>,
  edit:     <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>,
  delete:   <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>,
  csv:      <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/></svg>,
  cloud:    <svg viewBox="0 0 24 24" fill="currentColor" width="32" height="32"><path d="M19.35 10.04A7.49 7.49 0 0 0 12 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 0 0 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/></svg>,
  check:    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>,
  filter:   <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/></svg>,
  download: <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>,
  spinner:  <svg viewBox="0 0 24 24" fill="none" width="18" height="18"><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="4"/><path d="M4 12a8 8 0 018-8v8z" fill="white"/></svg>,
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

function FField({ label, value, onChange, type = 'text', as = 'input', placeholder = '', options = [] }:
  { label: string; value: string; onChange: (v: string) => void; type?: string; as?: 'input' | 'textarea' | 'select'; placeholder?: string; options?: string[] }) {
  const [focused, setFocused] = useState(false)
  const base: React.CSSProperties = {
    width: '100%', background: 'transparent', border: 'none', outline: 'none',
    borderBottom: focused ? '2px solid #006e2f' : '1px solid rgba(188,203,185,0.5)',
    padding: '10px 0', fontFamily: 'Inter,sans-serif', fontSize: '0.9rem',
    color: '#191c1d', fontWeight: 500, transition: 'border-color 0.2s',
  }
  return (
    <div className="space-y-1.5">
      <label className="block text-[10px] font-bold uppercase tracking-wider" style={{ color: '#6d7b6c' }}>{label}</label>
      {as === 'textarea' ? (
        <textarea value={value} placeholder={placeholder} rows={4}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{ ...base, resize: 'none' }} />
      ) : as === 'select' ? (
        <select value={value} onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={base}>
          <option value="">Select subject...</option>
          {options.map(s => <option key={s}>{s}</option>)}
        </select>
      ) : (
        <input type={type} value={value} placeholder={placeholder}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={base} />
      )}
    </div>
  )
}

// Generate and trigger CSV download
const downloadCSV = (filename: string, headers: string[], rows: string[][]) => {
  const content = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

const downloadQuestionTemplate = () => {
  downloadCSV(
    'questions_template.csv',
    ['subject', 'question', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_answer', 'difficulty'],
    [
      ['Mathematics', 'What is 2 + 2?', '3', '4', '5', '6', 'B', 'Standard'],
      ['Physics', 'What is the unit of force?', 'Joule', 'Newton', 'Pascal', 'Watt', 'B', 'Standard'],
    ]
  )
}

const downloadStudentTemplate = () => {
  downloadCSV(
    'students_template.csv',
    ['student_id', 'full_name', 'class', 'email', 'phone', 'gender'],
    [
      ['SS2/2024/001', 'Amina Yusuf', 'SS2 Science', 'amina@example.com', '08012345678', 'Female'],
      ['SS2/2024/002', 'Emeka Eze', 'SS2 Science', 'emeka@example.com', '08098765432', 'Male'],
    ]
  )
}

function DropZone({ label, hint, accept, onFile, file }: {
  label: string; hint: string; accept: string;
  onFile: (f: File) => void; file: File | null
}) {
  const ref = useRef<HTMLInputElement>(null)
  const [drag, setDrag] = useState(false)
  return (
    <div
      onClick={() => ref.current?.click()}
      onDragOver={e => { e.preventDefault(); setDrag(true) }}
      onDragLeave={() => setDrag(false)}
      onDrop={e => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) onFile(f) }}
      className="flex flex-col items-center justify-center p-8 rounded-2xl cursor-pointer transition-all duration-200 text-center"
      style={{ border: `2px dashed ${drag ? '#006e2f' : '#bccbb9'}`, backgroundColor: drag ? '#e8f5ed' : '#f3f4f5', minHeight: '160px' }}>
      <input ref={ref} type="file" accept={accept} className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f) }} />
      <span style={{ color: drag ? '#006e2f' : '#bccbb9', marginBottom: '12px' }}>{Ic.cloud}</span>
      {file ? (
        <>
          <p className="font-bold text-sm" style={{ color: '#006e2f' }}>{file.name}</p>
          <p className="text-xs mt-1" style={{ color: '#6d7b6c' }}>{(file.size / 1024).toFixed(1)} KB • Click to change</p>
        </>
      ) : (
        <>
          <p className="font-bold text-sm" style={{ color: '#191c1d' }}>{label}</p>
          <p className="text-xs mt-1" style={{ color: '#6d7b6c' }}>{hint}</p>
        </>
      )}
    </div>
  )
}

type Question = {
  id: string
  preview: string
  answer: string
  date: string
  text: string
  options: string[]
  correctAnswer: number
  difficulty: 'Easy' | 'Standard' | 'Hard'
  subjectId: number
}
type UploadState = 'idle' | 'uploading' | 'done' | 'error'

const answerLabel = (idx?: number) => {
  if (idx === 0) return 'A'
  if (idx === 1) return 'B'
  if (idx === 2) return 'C'
  if (idx === 3) return 'D'
  return '-'
}

const toDisplayDate = (raw: string | undefined) => {
  if (!raw) return '-'
  if (raw === 'CURRENT_TIMESTAMP') return '-'
  const parsed = new Date(raw)
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toLocaleString('en-GB', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }
  const isoLike = raw.includes(' ') ? raw.replace(' ', 'T') : raw
  const parsedIsoLike = new Date(isoLike)
  if (!Number.isNaN(parsedIsoLike.getTime())) {
    return parsedIsoLike.toLocaleString('en-GB', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }
  return '-'
}

const answerFromIndex = (idx?: number) => {
  if (idx === 0) return 'A'
  if (idx === 1) return 'B'
  if (idx === 2) return 'C'
  if (idx === 3) return 'D'
  return 'A'
}

const parseOptionArray = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map(v => String(v))
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      if (Array.isArray(parsed)) return parsed.map(v => String(v))
    } catch {
      return []
    }
  }
  return []
}

export default function AdminUploadPage() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'manual' | 'batch-q' | 'batch-s'>('manual')
  const [toastMsg, setToastMsg] = useState('')
  const [registeredCount, setRegisteredCount] = useState(0)
  const [subjectMap, setSubjectMap] = useState<Map<string, number>>(new Map())
  const [subjectNames, setSubjectNames] = useState<string[]>([])
  const [subjectNameById, setSubjectNameById] = useState<Map<number, string>>(new Map())

  const refreshSubjects = async () => {
    const r = await api.subjects.list()
    const names = r.subjects.map(s => s.name)
    const nameToId = new Map(r.subjects.map(s => [s.name, s.id]))
    const idToName = new Map(r.subjects.map(s => [s.id, s.name]))
    setSubjectNames(names)
    setSubjectMap(nameToId)
    setSubjectNameById(idToName)
    return { nameToId, idToName }
  }

  const [form, setForm] = useState({ subject: '', difficulty: 'Standard', question: '', optA: '', optB: '', optC: '', optD: '', answer: 'A' })
  const [submitting, setSubmitting] = useState(false)
  const [questions, setQuestions] = useState<Question[]>([])
  const [qFile,   setQFile]   = useState<File | null>(null)
  const [sFile,   setSFile]   = useState<File | null>(null)
  const [qState,  setQState]  = useState<UploadState>('idle')
  const [sState,  setSState]  = useState<UploadState>('idle')
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null)
  const [deleteDialogQuestionId, setDeleteDialogQuestionId] = useState<string | null>(null)

  const loadRecentQuestions = async () => {
    try {
      const result = await api.questions.listAll({ limit: 100 })
      const merged = result.questions
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 30)

      const mapped: Question[] = merged.map(q => ({
        id: q.id,
        preview: q.text.slice(0, 70) + (q.text.length > 70 ? '...' : ''),
        answer: answerLabel(q.correctAnswer),
        date: toDisplayDate(q.createdAt),
        text: q.text,
        options: parseOptionArray(q.options),
        correctAnswer: q.correctAnswer ?? 0,
        difficulty: q.difficulty,
        subjectId: q.subjectId,
      }))

      setQuestions(mapped)
    } catch {
      // Keep UI usable even if question fetch fails.
    }
  }

  useEffect(() => {
    api.students.list({ limit: 1 }).then(r => setRegisteredCount(r.total)).catch(() => {})
    void (async () => {
      try {
        await refreshSubjects()
        await loadRecentQuestions()
      } catch {
        // Keep page interactive even if initial data fetch fails.
      }
    })()
  }, [])

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 5000)
  }

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.subject || !form.question || !form.optA || !form.optB || !form.optC || !form.optD) {
      showToast('⚠ Please fill in all fields before submitting.')
      return
    }
    const subjectId = subjectMap.get(form.subject)
    if (subjectId === undefined) { showToast('⚠ Subject not found. Create it in Subjects Control first.'); return }
    setSubmitting(true)
    try {
      if (editingQuestionId) {
        await api.questions.update(editingQuestionId, {
          subjectId,
          text: form.question,
          options: [form.optA, form.optB, form.optC, form.optD],
          correctAnswer: ['A', 'B', 'C', 'D'].indexOf(form.answer),
          difficulty: form.difficulty as 'Easy' | 'Standard' | 'Hard',
        })
      } else {
        await api.questions.create({
          subjectId,
          text: form.question,
          options: [form.optA, form.optB, form.optC, form.optD],
          correctAnswer: ['A', 'B', 'C', 'D'].indexOf(form.answer),
          difficulty: form.difficulty as 'Easy' | 'Standard' | 'Hard',
        })
      }
      setForm({ subject: '', difficulty: 'Standard', question: '', optA: '', optB: '', optC: '', optD: '', answer: 'A' })
      setEditingQuestionId(null)
      showToast(editingQuestionId ? '✅ Question updated successfully!' : '✅ Question saved to database successfully!')
      await refreshSubjects()
      await loadRecentQuestions()
    } catch (err) {
      showToast(`⚠ ${err instanceof Error ? err.message : 'Failed to save question.'}`)
    } finally {
      setSubmitting(false)
    }
  }

  const handleQuestionUpload = async () => {
    if (!qFile) { showToast('⚠ Please select a CSV file first.'); return }
    setQState('uploading')
    try {
      const result = await api.questions.uploadCsv(qFile)
      setQState('done')
      const skippedNote = result.skipped > 0 ? ` (${result.skipped} skipped)` : ''
      showToast(`✅ ${result.inserted} questions imported successfully!${skippedNote}`)
      setQFile(null)
      await refreshSubjects()
      await loadRecentQuestions()
      setTimeout(() => setQState('idle'), 3000)
    } catch (err) {
      setQState('error')
      showToast(`⚠ ${err instanceof Error ? err.message : 'Upload failed.'}`)
      setTimeout(() => setQState('idle'), 3000)
    }
  }

  const handleStudentUpload = async () => {
    if (!sFile) { showToast('⚠ Please select a CSV file first.'); return }
    setSState('uploading')
    try {
      const result = await api.students.uploadCsv(sFile)
      setSState('done')
      const skippedNote = result.skipped > 0 ? ` (${result.skipped} skipped)` : ''
      showToast(`✅ ${result.inserted} students registered successfully!${skippedNote}`)
      setSFile(null)
      api.students.list({ limit: 1 }).then(r => setRegisteredCount(r.total)).catch(() => {})
      setTimeout(() => setSState('idle'), 3000)
    } catch (err) {
      setSState('error')
      showToast(`⚠ ${err instanceof Error ? err.message : 'Upload failed.'}`)
      setTimeout(() => setSState('idle'), 3000)
    }
  }

  const handleLogout = () => {
    logout().then(() => navigate('/login', { replace: true }))
  }

  const handleDeleteQuestion = async (id: string) => {
    try {
      await api.questions.delete(id)
      setQuestions(prev => prev.filter(x => x.id !== id))
      showToast('✅ Question deleted.')
    } catch (err) {
      showToast(`⚠ ${err instanceof Error ? err.message : 'Failed to delete question.'}`)
    }
  }

  const handleEditQuestion = (q: Question) => {
    const subjectName = subjectNameById.get(q.subjectId) ?? ''
    setForm({
      subject: subjectName,
      difficulty: q.difficulty,
      question: q.text,
      optA: q.options[0] ?? '',
      optB: q.options[1] ?? '',
      optC: q.options[2] ?? '',
      optD: q.options[3] ?? '',
      answer: answerFromIndex(q.correctAnswer),
    })
    setEditingQuestionId(q.id)
    setActiveTab('manual')
    showToast('Editing question loaded into form.')
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f9fa' }}>
      <style>{`@media(min-width:768px){.sidebar-desktop{transform:translateX(0)!important;}.main-content{margin-left:256px;}}@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Toast */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 px-5 py-3 rounded-xl text-sm font-bold"
            style={{ backgroundColor: toastMsg.startsWith('⚠') ? '#ffdad6' : '#e8f5ed', color: toastMsg.startsWith('⚠') ? '#9e4036' : '#006e2f', boxShadow: '0 8px 24px rgba(25,28,29,0.12)', border: '1px solid rgba(0,110,47,0.2)', maxWidth: '360px' }}>
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {deleteDialogQuestionId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(25,28,29,0.45)' }}>
          <div className="w-[92vw] max-w-md rounded-2xl p-6" style={{ backgroundColor: '#ffffff', boxShadow: '0 16px 40px rgba(25,28,29,0.25)' }}>
            <h3 className="text-lg font-extrabold mb-2" style={{ color: '#191c1d', fontFamily: 'Manrope,sans-serif' }}>Confirm Deletion</h3>
            <p className="text-sm mb-5" style={{ color: '#3d4a3d' }}>Are you sure you want to delete this question? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteDialogQuestionId(null)} className="px-4 py-2 rounded-full text-sm font-bold" style={{ backgroundColor: '#f3f4f5', color: '#6d7b6c' }}>Cancel</button>
              <button
                onClick={() => {
                  const id = deleteDialogQuestionId
                  setDeleteDialogQuestionId(null)
                  if (id) void handleDeleteQuestion(id)
                }}
                className="px-4 py-2 rounded-full text-sm font-bold"
                style={{ backgroundColor: '#9e4036', color: '#ffffff' }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="main-content flex flex-col min-h-screen">
        <header className="sticky top-0 z-20 flex items-center justify-between px-6 md:px-8 h-16"
          style={{ backgroundColor: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', boxShadow: '0 1px 0 rgba(188,203,185,0.3)' }}>
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(o => !o)} className="p-2 rounded-lg md:hidden" style={{ color: '#3d4a3d' }}>{Ic.menu}</button>
            <div>
              <h2 className="text-lg font-bold leading-none" style={{ fontFamily: 'Manrope,sans-serif', color: '#191c1d' }}>Upload Questions</h2>
              <p className="text-xs" style={{ color: '#6d7b6c' }}>ScholarSlate CBT Admin</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium hidden sm:block" style={{ color: '#3d4a3d' }}>Administrator</span>
            <button onClick={handleLogout} className="text-sm font-bold" style={{ color: '#006e2f' }}>Logout</button>
          </div>
        </header>

        <main className="flex-1 p-5 md:p-8 max-w-screen-xl mx-auto w-full">
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-1" style={{ fontFamily: 'Manrope,sans-serif', color: '#191c1d' }}>Question Bank Manager</h1>
            <p className="text-base" style={{ color: '#3d4a3d' }}>Add questions manually, upload batches via CSV, or register students in bulk.</p>
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-2 mb-7 flex-wrap">
            {([
              { key: 'manual',  label: '✏ Manual Entry' },
              { key: 'batch-q', label: '📄 Batch Questions' },
              { key: 'batch-s', label: '👥 Register Students' },
            ] as const).map(({ key, label }) => (
              <button key={key} onClick={() => setActiveTab(key)}
                className="px-5 py-2.5 rounded-full text-sm font-bold transition-all"
                style={{ backgroundColor: activeTab === key ? '#006e2f' : '#ffffff', color: activeTab === key ? '#ffffff' : '#3d4a3d', boxShadow: activeTab === key ? 'none' : '0 1px 4px rgba(25,28,29,0.08)' }}>
                {label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">

            {/* ── Manual Entry ── */}
            {activeTab === 'manual' && (
              <motion.div key="manual" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="p-7 md:p-10 rounded-2xl mb-7" style={{ backgroundColor: '#ffffff', boxShadow: '0 4px 20px rgba(25,28,29,0.07)' }}>
                  <h3 className="text-xl font-bold mb-1" style={{ fontFamily: 'Manrope,sans-serif', color: '#191c1d' }}>New Question Entry</h3>
                  <p className="text-sm mb-8" style={{ color: '#6d7b6c' }}>Populate the subject curriculum with exam items.</p>

                  <form onSubmit={handleManualSubmit} className="space-y-7">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="md:col-span-2">
                        <FField label="Target Subject" value={form.subject} onChange={v => setForm(f => ({ ...f, subject: v }))} as="select" options={subjectNames} />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: '#6d7b6c' }}>Difficulty</label>
                        <div className="flex gap-2 mt-2">
                          {['Easy', 'Standard', 'Hard'].map(d => (
                            <button key={d} type="button" onClick={() => setForm(f => ({ ...f, difficulty: d }))}
                              className="px-3 py-1.5 rounded-full text-xs font-bold"
                              style={{ backgroundColor: form.difficulty === d ? '#006e2f' : '#f3f4f5', color: form.difficulty === d ? '#fff' : '#3d4a3d' }}>
                              {d}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <FField label="Question Content" value={form.question} onChange={v => setForm(f => ({ ...f, question: v }))} as="textarea" placeholder="Enter the question statement here..." />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                      {(['A','B','C','D'] as const).map(l => (
                        <FField key={l} label={`Option ${l}`} value={(form as Record<string,string>)[`opt${l}`]} onChange={v => setForm(f => ({ ...f, [`opt${l}`]: v }))} placeholder={`Enter option ${l}`} />
                      ))}
                    </div>

                    <div className="flex flex-wrap items-end justify-between gap-6 pt-5" style={{ borderTop: '1px solid #edeeef' }}>
                      {editingQuestionId && (
                        <button type="button" onClick={() => { setEditingQuestionId(null); setForm({ subject: '', difficulty: 'Standard', question: '', optA: '', optB: '', optC: '', optD: '', answer: 'A' }) }}
                          className="px-4 py-2 rounded-full text-xs font-bold"
                          style={{ color: '#6d7b6c', backgroundColor: '#f3f4f5' }}>
                          Cancel Edit
                        </button>
                      )}
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: '#6d7b6c' }}>Correct Answer Key</label>
                        <div className="flex gap-2">
                          {['A','B','C','D'].map(l => (
                            <button key={l} type="button" onClick={() => setForm(f => ({ ...f, answer: l }))}
                              className="w-10 h-10 rounded-full font-black text-sm"
                              style={{ backgroundColor: form.answer === l ? '#006e2f' : '#f3f4f5', color: form.answer === l ? '#fff' : '#3d4a3d', fontFamily: 'Manrope,sans-serif' }}>
                              {l}
                            </button>
                          ))}
                        </div>
                      </div>
                      <motion.button type="submit" whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }} disabled={submitting}
                        className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm text-white"
                        style={{ background: 'linear-gradient(135deg,#006e2f,#22c55e)', boxShadow: '0 4px 14px rgba(34,197,94,0.3)', opacity: submitting ? 0.8 : 1 }}>
                        {submitting ? 'Saving...' : <>{Ic.send} {editingQuestionId ? 'Save Changes' : 'Upload to Question Bank'}</>}
                      </motion.button>
                    </div>
                  </form>
                </div>

                {/* Recent table */}
                <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#ffffff', boxShadow: '0 4px 20px rgba(25,28,29,0.07)' }}>
                  <div className="flex items-center justify-between px-7 py-5" style={{ borderBottom: '1px solid #edeeef' }}>
                    <div>
                      <h3 className="font-bold text-lg" style={{ fontFamily: 'Manrope,sans-serif', color: '#191c1d' }}>Recently Uploaded</h3>
                      <p className="text-sm" style={{ color: '#6d7b6c' }}>{questions.length} questions in bank</p>
                    </div>
                  </div>
                  <div className="grid px-6 py-3 text-[11px] font-bold uppercase tracking-widest"
                    style={{ gridTemplateColumns: '1fr 3fr 1fr 1fr 80px', backgroundColor: '#e7e8e9', color: '#3d4a3d' }}>
                    <span>ID</span><span>Preview</span><span className="text-center">Answer</span><span>Date</span><span className="text-right">Actions</span>
                  </div>
                  {questions.map((q, i) => (
                    <div key={q.id} className="grid px-6 py-4 items-center"
                      style={{ gridTemplateColumns: '1fr 3fr 1fr 1fr 80px', borderTop: i === 0 ? 'none' : '1px solid #f3f4f5' }}
                      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#f8f9fa')}
                      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = 'transparent')}>
                      <span className="text-sm font-mono" style={{ color: '#6d7b6c' }}>{q.id.slice(0, 8).toUpperCase()}</span>
                      <p className="text-sm truncate pr-4" style={{ color: '#191c1d', fontWeight: 500 }}>{q.preview}</p>
                      <div className="flex justify-center">
                        <span className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black"
                          style={{ backgroundColor: '#e8f5ed', color: '#006e2f', fontFamily: 'Manrope,sans-serif' }}>{q.answer}</span>
                      </div>
                      <span className="text-xs" style={{ color: '#6d7b6c' }}>{q.date}</span>
                      <div className="flex justify-end gap-1">
                        <button onClick={() => handleEditQuestion(q)} className="p-2 rounded-full" style={{ color: '#bccbb9' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#006e2f'; (e.currentTarget as HTMLElement).style.backgroundColor = '#e8f5ed' }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#bccbb9'; (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}>
                          {Ic.edit}
                        </button>
                        <button onClick={() => setDeleteDialogQuestionId(q.id)}
                          className="p-2 rounded-full" style={{ color: '#bccbb9' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#9e4036'; (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(158,64,54,0.08)' }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#bccbb9'; (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}>
                          {Ic.delete}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── Batch Questions ── */}
            {activeTab === 'batch-q' && (
              <motion.div key="batch-q" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="p-8 md:p-10 rounded-2xl" style={{ backgroundColor: '#ffffff', boxShadow: '0 4px 20px rgba(25,28,29,0.07)' }}>
                  <h3 className="text-xl font-bold mb-1" style={{ fontFamily: 'Manrope,sans-serif', color: '#191c1d' }}>Batch Upload Questions</h3>
                  <p className="text-sm mb-8" style={{ color: '#6d7b6c' }}>Upload a CSV file with multiple questions at once.</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <DropZone label="Drop your CSV file here" hint="or click to browse • .csv accepted"
                      accept=".csv" onFile={setQFile} file={qFile} />
                    <div className="flex flex-col gap-4">
                      <div className="p-5 rounded-xl" style={{ backgroundColor: '#f3f4f5' }}>
                        <h4 className="font-bold text-sm mb-3" style={{ color: '#191c1d' }}>Required CSV Columns</h4>
                        <div className="space-y-1.5">
                          {['subject', 'question', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_answer', 'difficulty'].map(col => (
                            <div key={col} className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#006e2f' }} />
                              <code className="text-xs" style={{ color: '#3d4a3d' }}>{col}</code>
                            </div>
                          ))}
                        </div>
                      </div>
                      {/* Working download button */}
                      <div className="p-4 rounded-xl flex items-center gap-3" style={{ backgroundColor: '#e8f5ed', border: '1px solid rgba(0,110,47,0.15)' }}>
                        <span style={{ color: '#006e2f' }}>{Ic.csv}</span>
                        <div className="flex-1">
                          <p className="text-sm font-bold" style={{ color: '#006e2f' }}>Download Template</p>
                          <p className="text-xs" style={{ color: '#2f6a3c' }}>CSV with example rows</p>
                        </div>
                        <motion.button whileTap={{ scale: 0.95 }} onClick={downloadQuestionTemplate}
                          className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-full"
                          style={{ backgroundColor: '#006e2f', color: '#fff' }}>
                          {Ic.download} Download
                        </motion.button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <motion.button whileTap={{ scale: 0.97 }} onClick={handleQuestionUpload}
                      disabled={qState === 'uploading'}
                      className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm text-white"
                      style={{ background: qState === 'done' ? '#2f6a3c' : 'linear-gradient(135deg,#006e2f,#22c55e)', boxShadow: '0 4px 14px rgba(34,197,94,0.3)', opacity: qState === 'uploading' ? 0.8 : 1 }}>
                      {qState === 'uploading' ? (
                        <><span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>{Ic.spinner}</span> Processing...</>
                      ) : qState === 'done' ? (
                        <>{Ic.check} Uploaded!</>
                      ) : (
                        <>{Ic.upload} Upload Questions</>
                      )}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── Register Students ── */}
            {activeTab === 'batch-s' && (
              <motion.div key="batch-s" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="p-8 md:p-10 rounded-2xl" style={{ backgroundColor: '#ffffff', boxShadow: '0 4px 20px rgba(25,28,29,0.07)' }}>
                  <h3 className="text-xl font-bold mb-1" style={{ fontFamily: 'Manrope,sans-serif', color: '#191c1d' }}>Batch Register Students</h3>
                  <p className="text-sm mb-8" style={{ color: '#6d7b6c' }}>Upload a student CSV to create multiple accounts at once.</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <DropZone label="Drop student CSV here" hint="or click to browse • .csv accepted"
                      accept=".csv" onFile={setSFile} file={sFile} />
                    <div className="flex flex-col gap-4">
                      <div className="p-5 rounded-xl" style={{ backgroundColor: '#f3f4f5' }}>
                        <h4 className="font-bold text-sm mb-3" style={{ color: '#191c1d' }}>Required CSV Columns</h4>
                        <div className="space-y-1.5">
                          {['student_id', 'full_name', 'class', 'email (optional)', 'phone (optional)', 'gender'].map(col => (
                            <div key={col} className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#006e2f' }} />
                              <code className="text-xs" style={{ color: '#3d4a3d' }}>{col}</code>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="p-4 rounded-xl" style={{ backgroundColor: 'rgba(158,64,54,0.06)', border: '1px solid rgba(158,64,54,0.15)' }}>
                        <p className="text-xs font-bold uppercase mb-1" style={{ color: '#9e4036' }}>⚠ Important</p>
                        <p className="text-xs" style={{ color: '#3d4a3d' }}>Student IDs must be unique. Duplicates will be skipped. Registered students sign in with only their school-issued Student ID.</p>
                      </div>
                      <div className="p-4 rounded-xl" style={{ backgroundColor: '#ffffff', border: '1px solid #e7e8e9' }}>
                        <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#6d7b6c' }}>Registry Status</p>
                        <p className="text-lg font-extrabold" style={{ color: '#191c1d', fontFamily: 'Manrope,sans-serif' }}>{registeredCount}</p>
                        <p className="text-xs mt-1" style={{ color: '#6d7b6c' }}>Students currently available for Student ID login.</p>
                      </div>
                      {/* Working download button */}
                      <div className="p-4 rounded-xl flex items-center gap-3" style={{ backgroundColor: '#e8f5ed', border: '1px solid rgba(0,110,47,0.15)' }}>
                        <span style={{ color: '#006e2f' }}>{Ic.csv}</span>
                        <div className="flex-1">
                          <p className="text-sm font-bold" style={{ color: '#006e2f' }}>Download Student Template</p>
                          <p className="text-xs" style={{ color: '#2f6a3c' }}>CSV with example student rows</p>
                        </div>
                        <motion.button whileTap={{ scale: 0.95 }} onClick={downloadStudentTemplate}
                          className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-full"
                          style={{ backgroundColor: '#006e2f', color: '#fff' }}>
                          {Ic.download} Download
                        </motion.button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <motion.button whileTap={{ scale: 0.97 }} onClick={handleStudentUpload}
                      disabled={sState === 'uploading'}
                      className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm text-white"
                      style={{ background: sState === 'done' ? '#2f6a3c' : 'linear-gradient(135deg,#006e2f,#22c55e)', boxShadow: '0 4px 14px rgba(34,197,94,0.3)', opacity: sState === 'uploading' ? 0.8 : 1 }}>
                      {sState === 'uploading' ? (
                        <><span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>{Ic.spinner}</span> Processing...</>
                      ) : sState === 'done' ? (
                        <>{Ic.check} Registered!</>
                      ) : sState === 'error' ? (
                        <>Retry Registration</>
                      ) : (
                        <>{Ic.students} Register Students</>
                      )}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}