import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'

const Ic = {
  school:    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/></svg>,
  dashboard: <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>,
  book:      <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z"/></svg>,
  results:   <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/></svg>,
  profile:   <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>,
  help:      <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg>,
  logout:    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>,
  menu:      <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>,
  save:      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18"><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg>,
  key:       <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg>,
  download:  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>,
  badge:     <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/></svg>,
  info:      <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>,
  check:     <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>,
}

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate(), location = useLocation()
  const navItems = [
    { icon: Ic.dashboard, label: 'Dashboard',  path: '/dashboard' },
    { icon: Ic.book,      label: 'Subjects',   path: '/select-subject' },
    { icon: Ic.results,   label: 'Results',    path: '/results-history' },
    { icon: Ic.profile,   label: 'Profile',    path: '/profile' },
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
              onClick={() => label === 'Logout' && navigate('/login')}>
              {icon}<span>{label}</span>
            </button>
          ))}
        </div>
      </aside>
    </>
  )
}

// Flushed input field component
function Field({ label, value, onChange, type = 'text', readOnly = false }:
  { label: string; value: string; onChange?: (v: string) => void; type?: string; readOnly?: boolean }) {
  const [focused, setFocused] = useState(false)
  return (
    <div className="space-y-1.5">
      <label className="block text-[10px] font-bold uppercase tracking-wider" style={{ color: '#6d7b6c' }}>{label}</label>
      <input
        type={type}
        value={value}
        readOnly={readOnly}
        onChange={e => onChange && onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%', background: 'transparent', border: 'none', outline: 'none',
          borderBottom: readOnly ? '1px solid #edeeef' : focused ? '2px solid #006e2f' : '1px solid rgba(188,203,185,0.5)',
          padding: '10px 0', fontFamily: 'Inter,sans-serif', fontSize: '0.95rem',
          color: readOnly ? '#6d7b6c' : '#191c1d', fontWeight: 500,
          cursor: readOnly ? 'default' : 'text', transition: 'border-color 0.2s',
        }}
      />
    </div>
  )
}

export default function StudentProfilePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showPwModal, setShowPwModal] = useState(false)

  const [form, setForm] = useState({
    fullName: 'Amina Yusuf',
    email: 'amina.yusuf@example.com',
    phone: '+234 803 456 7890',
    address: '12 Maitama Street, Abuja',
  })

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f9fa' }}>
      <style>{`
        @media(min-width:768px){.sidebar-desktop{transform:translateX(0)!important;}.main-content{margin-left:256px;}}
      `}</style>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Change Password Modal */}
      {showPwModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(25,28,29,0.5)', backdropFilter: 'blur(8px)' }}>
          <motion.div initial={{ opacity: 0, scale: 0.93 }} animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm p-8" style={{ backgroundColor: '#fff', borderRadius: '1.25rem', boxShadow: '0 24px 64px rgba(25,28,29,0.15)' }}>
            <h3 className="text-xl font-bold mb-6" style={{ fontFamily: 'Manrope,sans-serif', color: '#191c1d' }}>Change Password</h3>
            <div className="space-y-5">
              {['Current Password', 'New Password', 'Confirm New Password'].map(l => (
                <Field key={l} label={l} value="" type="password" onChange={() => {}} />
              ))}
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setShowPwModal(false)} className="flex-1 py-3 rounded-full font-bold text-sm"
                style={{ backgroundColor: '#f3f4f5', color: '#191c1d' }}>Cancel</button>
              <button onClick={() => setShowPwModal(false)} className="flex-1 py-3 rounded-full font-bold text-sm text-white"
                style={{ background: 'linear-gradient(135deg,#006e2f,#22c55e)' }}>Update Password</button>
            </div>
          </motion.div>
        </div>
      )}

      <div className="main-content flex flex-col min-h-screen">
        <header className="sticky top-0 z-20 flex items-center justify-between px-6 md:px-8 h-16"
          style={{ backgroundColor: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', boxShadow: '0 1px 0 rgba(188,203,185,0.3)' }}>
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(o => !o)} className="p-2 rounded-lg md:hidden" style={{ color: '#3d4a3d' }}>{Ic.menu}</button>
            <h2 className="text-lg font-bold" style={{ fontFamily: 'Manrope,sans-serif', color: '#191c1d' }}>School CBT System</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold leading-none" style={{ color: '#191c1d' }}>Amina Yusuf</p>
              <p className="text-[10px] uppercase tracking-tight mt-0.5" style={{ color: '#6d7b6c' }}>SS2 • Science</p>
            </div>
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: 'linear-gradient(135deg,#006e2f,#22c55e)' }}>AY</div>
          </div>
        </header>

        <main className="flex-1 p-5 md:p-8 max-w-5xl mx-auto w-full">
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-1" style={{ fontFamily: 'Manrope,sans-serif', color: '#191c1d' }}>Student Profile</h1>
            <p className="text-xs uppercase tracking-widest font-medium" style={{ color: '#6d7b6c' }}>Academic Workspace / Settings</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            {/* Left: Identity card */}
            <div className="lg:col-span-4 flex flex-col gap-5">
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="p-8 rounded-2xl relative overflow-hidden"
                style={{ backgroundColor: '#ffffff', boxShadow: '0 4px 24px rgba(25,28,29,0.07)' }}>
                <div className="absolute pointer-events-none" style={{ top: '-3rem', right: '-3rem', width: '12rem', height: '12rem', backgroundColor: '#22c55e', opacity: 0.05, borderRadius: '50%', filter: 'blur(40px)' }} />
                <div className="relative z-10 flex flex-col items-center">
                  {/* Avatar */}
                  <div className="relative mb-5">
                    <div className="w-28 h-28 rounded-full flex items-center justify-center text-white text-4xl font-black"
                      style={{ background: 'linear-gradient(135deg,#006e2f,#22c55e)', boxShadow: '0 8px 24px rgba(34,197,94,0.25)' }}>
                      AY
                    </div>
                    <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: '#006e2f' }}>
                      <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                    </button>
                  </div>
                  <h3 className="text-xl font-bold text-center mb-1" style={{ fontFamily: 'Manrope,sans-serif', color: '#191c1d' }}>Amina Yusuf</h3>
                  <p className="text-sm mb-6" style={{ color: '#6d7b6c' }}>amina.yusuf@example.com</p>

                  <div className="w-full space-y-3 pt-5" style={{ borderTop: '1px solid #edeeef' }}>
                    {[
                      { label: 'Student ID', value: 'SS2/2024/001' },
                      { label: 'Class', value: 'SS2 Science' },
                      { label: 'Term', value: '2025/2026 First' },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between items-center text-sm">
                        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#6d7b6c' }}>{label}</span>
                        <span className="font-bold" style={{ color: '#191c1d' }}>{value}</span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#6d7b6c' }}>Status</span>
                      <span className="flex items-center gap-1.5 text-xs font-bold" style={{ color: '#006e2f' }}>
                        <span className="w-2 h-2 rounded-full bg-green-500" style={{ animation: 'pulse 2s infinite' }} />
                        Active
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Academic summary */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
                className="p-6 rounded-2xl" style={{ backgroundColor: '#f3f4f5' }}>
                <h4 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: '#6d7b6c' }}>Academic Summary</h4>
                <div className="grid grid-cols-2 gap-3">
                  {[{ label: 'Avg Score', value: '78%', color: '#006e2f' }, { label: 'Rank', value: 'Top 15%', color: '#2f6a3c' }, { label: 'Exams Done', value: '6', color: '#191c1d' }, { label: 'Pass Rate', value: '83%', color: '#006e2f' }].map(({ label, value, color }) => (
                    <div key={label} className="p-4 rounded-xl" style={{ backgroundColor: '#ffffff' }}>
                      <p className="text-xs mb-1" style={{ color: '#6d7b6c' }}>{label}</p>
                      <p className="text-xl font-extrabold" style={{ fontFamily: 'Manrope,sans-serif', color }}>{value}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Right: Edit form */}
            <div className="lg:col-span-8 flex flex-col gap-5">
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                className="p-8 md:p-10 rounded-2xl" style={{ backgroundColor: '#ffffff', boxShadow: '0 4px 24px rgba(25,28,29,0.07)' }}>
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-xl font-bold mb-1" style={{ fontFamily: 'Manrope,sans-serif', color: '#191c1d' }}>Personal Information</h2>
                    <p className="text-sm" style={{ color: '#6d7b6c' }}>Manage your academic and contact details.</p>
                  </div>
                  <span style={{ color: '#bccbb9' }}>{Ic.badge}</span>
                </div>

                <form onSubmit={handleSave}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-7">
                    <Field label="School" value="Sunshine Secondary School" readOnly />
                    <Field label="Class / Form" value="SS2 — Science" readOnly />
                    <Field label="Full Name" value={form.fullName} onChange={v => setForm(f => ({ ...f, fullName: v }))} />
                    <Field label="Personal Email" value={form.email} type="email" onChange={v => setForm(f => ({ ...f, email: v }))} />
                    <Field label="Phone Number" value={form.phone} type="tel" onChange={v => setForm(f => ({ ...f, phone: v }))} />
                    <Field label="Home Address" value={form.address} onChange={v => setForm(f => ({ ...f, address: v }))} />
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-10 pt-8" style={{ borderTop: '1px solid #edeeef' }}>
                    <p className="text-xs flex items-center gap-1.5" style={{ color: '#6d7b6c' }}>
                      {Ic.info} Changes are logged and verified by the school registrar.
                    </p>
                    <motion.button type="submit" whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
                      className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm text-white"
                      style={{ background: 'linear-gradient(135deg,#006e2f,#22c55e)', boxShadow: '0 4px 14px rgba(34,197,94,0.3)', fontFamily: 'Manrope,sans-serif' }}>
                      {saved ? <>{Ic.check} Saved!</> : <>{Ic.save} Save Changes</>}
                    </motion.button>
                  </div>
                </form>
              </motion.div>

              {/* Quick action cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                  className="p-5 rounded-2xl flex items-center gap-4"
                  style={{ backgroundColor: 'rgba(158,64,54,0.06)', border: '1px solid rgba(158,64,54,0.12)' }}>
                  <div className="w-11 h-11 rounded-full flex items-center justify-center text-white flex-shrink-0" style={{ backgroundColor: '#9e4036' }}>{Ic.key}</div>
                  <div className="flex-1">
                    <h4 className="font-bold text-sm" style={{ color: '#191c1d' }}>Update Password</h4>
                    <p className="text-xs" style={{ color: '#6d7b6c' }}>Last updated 3 months ago</p>
                  </div>
                  <button onClick={() => setShowPwModal(true)} className="text-sm font-bold transition-colors" style={{ color: '#9e4036' }}>Change</button>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                  className="p-5 rounded-2xl flex items-center gap-4"
                  style={{ backgroundColor: 'rgba(47,106,60,0.06)', border: '1px solid rgba(47,106,60,0.12)' }}>
                  <div className="w-11 h-11 rounded-full flex items-center justify-center text-white flex-shrink-0" style={{ backgroundColor: '#2f6a3c' }}>{Ic.download}</div>
                  <div className="flex-1">
                    <h4 className="font-bold text-sm" style={{ color: '#191c1d' }}>My Result Transcript</h4>
                    <p className="text-xs" style={{ color: '#6d7b6c' }}>Download PDF version</p>
                  </div>
                  <button onClick={() => window.print()} className="text-sm font-bold transition-colors" style={{ color: '#2f6a3c' }}>View</button>
                </motion.div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}