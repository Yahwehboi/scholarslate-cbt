import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'

const Ic = {
  school:    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/></svg>,
  timer:     <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M15 1H9v2h6V1zm-4 13h2V8h-2v6zm8.03-6.61l1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42A8.962 8.962 0 0 0 12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9a8.994 8.994 0 0 0 7.03-14.61zM12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg>,
  list:      <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/></svg>,
  norefresh: <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>,
  autosubmit:<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>,
  tab:       <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h10v4h8v10z"/></svg>,
  flag:      <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z"/></svg>,
  honest:    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>,
  play:      <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M8 5v14l11-7z"/></svg>,
  back:      <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>,
  help:      <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg>,
  check:     <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>,
}

// ── Confirm modal ──────────────────────────────────────────────────
function ConfirmModal({ subjectName, onConfirm, onCancel }: { subjectName: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(25,28,29,0.45)', backdropFilter: 'blur(6px)' }}>
      <motion.div initial={{ opacity: 0, scale: 0.93, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 16 }} transition={{ duration: 0.25, ease: 'easeOut' }}
        className="w-full max-w-sm p-8 flex flex-col items-center text-center"
        style={{ backgroundColor: '#ffffff', borderRadius: '1.25rem', boxShadow: '0 24px 64px rgba(25,28,29,0.14)' }}>
        <div className="w-14 h-14 rounded-full flex items-center justify-center mb-5"
          style={{ backgroundColor: '#e8f5ed', color: '#006e2f' }}>
          {Ic.play}
        </div>
        <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'Manrope,sans-serif', color: '#191c1d' }}>
          Ready to Begin?
        </h3>
        <p className="text-sm mb-2" style={{ color: '#3d4a3d', lineHeight: 1.6 }}>
          You are about to start:
        </p>
        <p className="text-base font-bold mb-5" style={{ color: '#006e2f', fontFamily: 'Manrope,sans-serif' }}>
          {subjectName}
        </p>
        <p className="text-sm mb-8" style={{ color: '#3d4a3d', lineHeight: 1.6 }}>
          Once you start, the timer begins immediately. Make sure you are in a quiet environment.
        </p>
        <div className="flex gap-3 w-full">
          <button onClick={onCancel} className="flex-1 py-3 rounded-full font-bold text-sm transition-colors"
            style={{ backgroundColor: '#f3f4f5', color: '#191c1d' }}
            onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#e7e8e9')}
            onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#f3f4f5')}>
            Wait, Go Back
          </button>
          <motion.button whileTap={{ scale: 0.96 }} onClick={onConfirm}
            className="flex-1 py-3 rounded-full font-bold text-sm text-white"
            style={{ background: 'linear-gradient(135deg,#006e2f,#22c55e)', boxShadow: '0 4px 14px rgba(34,197,94,0.3)' }}>
            Yes, Start Now
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Rule item ──────────────────────────────────────────────────────
function RuleItem({ icon, title, desc, delay }: { icon: React.ReactNode; title: string; desc: string; delay: number }) {
  return (
    <motion.li initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }} className="flex gap-4">
      <div className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-200 cursor-default"
        style={{ backgroundColor: '#e7e8e9', color: '#3d4a3d' }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#e8f5ed'; (e.currentTarget as HTMLElement).style.color = '#006e2f' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#e7e8e9'; (e.currentTarget as HTMLElement).style.color = '#3d4a3d' }}>
        {icon}
      </div>
      <div>
        <p className="font-semibold mb-0.5" style={{ color: '#191c1d' }}>{title}</p>
        <p className="text-sm leading-relaxed" style={{ color: '#3d4a3d' }}>{desc}</p>
      </div>
    </motion.li>
  )
}

// ── Page ───────────────────────────────────────────────────────────
export default function InstructionsPage() {
  const navigate   = useNavigate()
  const location   = useLocation()
  const [agreed,   setAgreed]   = useState(false)
  const [showModal, setShowModal] = useState(false)

  // ── Read subject passed from SelectSubjectPage ──────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const subjectData = (location.state as any)?.subject
  const subjectName     = subjectData?.name        ?? 'Mathematics'
  const subjectQuestions= subjectData?.questions   ?? 50
  const subjectTime     = subjectData?.time        ?? 60
  const subjectDuration = `${subjectTime} Minutes`
  const attemptsUsed    = subjectData?.attemptsUsed  ?? 0
  const maxAttempts     = subjectData?.maxAttempts   ?? 2
  const attemptLabel    = `${attemptsUsed + 1} of ${maxAttempts}`

  const rules = [
    { icon: Ic.list,       title: 'Total Questions',    desc: `This examination contains ${subjectQuestions} multiple-choice questions. All questions carry equal marks.` },
    { icon: Ic.norefresh,  title: 'No Refreshing',      desc: 'Do not refresh your browser or press the Back button. Doing so may expire your session and invalidate your progress.' },
    { icon: Ic.autosubmit, title: 'Auto-Submit',        desc: 'The system automatically submits your answers when the timer reaches zero. Attempt all questions before time runs out.' },
    { icon: Ic.tab,        title: 'Tab Monitoring',     desc: 'Switching browser tabs or windows is prohibited. The system logs focus losses and may flag your attempt for review.' },
    { icon: Ic.flag,       title: 'Flag for Review',    desc: 'You can flag any question to revisit it before final submission using the question palette on the right.' },
    { icon: Ic.honest,     title: 'Academic Integrity', desc: 'All work must be your own. Use of external materials, phones, or assistance from others is strictly prohibited.' },
  ]

  return (
    <>
      <AnimatePresence>
        {showModal && (
          <ConfirmModal
            subjectName={subjectName}
            onConfirm={() => navigate('/exam', { state: { subject: subjectData } })}
            onCancel={() => setShowModal(false)}
          />
        )}
      </AnimatePresence>

      <div className="min-h-screen" style={{ backgroundColor: '#f8f9fa' }}>
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex items-center justify-between px-6 md:px-10 h-16"
          style={{ backgroundColor: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', boxShadow: '0 1px 0 rgba(188,203,185,0.3)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center text-white flex-shrink-0"
              style={{ backgroundColor: '#006e2f', borderRadius: '0.4rem' }}>
              {Ic.school}
            </div>
            <span className="font-bold text-base" style={{ fontFamily: 'Manrope,sans-serif', color: '#191c1d' }}>
              School CBT System
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold leading-none" style={{ color: '#191c1d' }}>Amina Yusuf</p>
              <p className="text-[10px] uppercase tracking-tight mt-0.5" style={{ color: '#6d7b6c' }}>SS2 • Science</p>
            </div>
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
              style={{ background: 'linear-gradient(135deg,#006e2f,#22c55e)' }}>AY</div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-64px)] flex items-center justify-center p-5 md:p-10">
          <div className="w-full max-w-4xl relative">

            {/* Decorative blobs */}
            <div className="absolute pointer-events-none" style={{ top:'-5rem', left:'-5rem', width:'18rem', height:'18rem', backgroundColor:'#22c55e', opacity:0.05, borderRadius:'50%', filter:'blur(60px)', zIndex:0 }}/>
            <div className="absolute pointer-events-none" style={{ bottom:'-5rem', right:'-5rem', width:'22rem', height:'22rem', backgroundColor:'#afefb4', opacity:0.07, borderRadius:'50%', filter:'blur(60px)', zIndex:0 }}/>

            {/* Main card */}
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="relative z-10 p-7 md:p-14 rounded-2xl"
              style={{ backgroundColor: '#ffffff', boxShadow: '0 8px 40px rgba(25,28,29,0.07)' }}>

              {/* Subject header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 mb-10">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest block mb-1" style={{ color: '#6d7b6c' }}>
                    Examination Session
                  </span>
                  <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                    className="text-3xl md:text-4xl font-extrabold tracking-tight"
                    style={{ fontFamily: 'Manrope,sans-serif', color: '#006e2f' }}>
                    {subjectName}
                  </motion.h1>
                </div>

                {/* Time badge */}
                <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                  className="flex items-center gap-4 px-6 py-4 rounded-xl flex-shrink-0"
                  style={{ backgroundColor: '#f3f4f5' }}>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-wider font-medium mb-0.5" style={{ color: '#6d7b6c' }}>Time Allowed</p>
                    <p className="text-xl font-bold" style={{ fontFamily: 'Manrope,sans-serif', color: '#191c1d' }}>{subjectDuration}</p>
                  </div>
                  <div style={{ width: 1, height: '2.5rem', backgroundColor: '#e7e8e9' }}/>
                  <span style={{ color: '#006e2f' }}>{Ic.timer}</span>
                </motion.div>
              </div>

              {/* Two-col layout */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">

                {/* Rules */}
                <div className="md:col-span-2">
                  <h2 className="text-lg font-bold flex items-center gap-2 mb-6"
                    style={{ fontFamily: 'Manrope,sans-serif', color: '#191c1d' }}>
                    <span style={{ color: '#006e2f' }}>{Ic.honest}</span>
                    Exam Rules & Guidelines
                  </h2>
                  <ul className="space-y-6">
                    {rules.map((r, i) => (
                      <RuleItem key={r.title} {...r} delay={0.15 + i * 0.07} />
                    ))}
                  </ul>
                </div>

                {/* Student summary */}
                <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25, duration: 0.45 }}
                  className="md:col-span-1">
                  <div className="p-6 rounded-xl flex flex-col gap-5" style={{ backgroundColor: '#f3f4f5' }}>
                    {/* Avatar */}
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-white text-xl font-black"
                        style={{ background: 'linear-gradient(135deg,#006e2f,#22c55e)', boxShadow: '0 4px 16px rgba(34,197,94,0.25)' }}>
                        AY
                      </div>
                      <h3 className="font-bold text-base" style={{ color: '#191c1d', fontFamily: 'Manrope,sans-serif' }}>
                        Amina Yusuf
                      </h3>
                      <p className="text-xs font-medium" style={{ color: '#6d7b6c' }}>SS2 • Science Class</p>
                    </div>

                    {/* Exam details — dynamically built from subject data */}
                    <div className="space-y-3 pt-4" style={{ borderTop: '1px solid rgba(188,203,185,0.3)' }}>
                      {[
                        { label: 'Subject',   value: subjectName },
                        { label: 'Questions', value: `${subjectQuestions} MCQ` },
                        { label: 'Duration',  value: subjectDuration },
                        { label: 'Attempt',   value: attemptLabel },
                        { label: 'Term',      value: '2025/2026' },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex justify-between items-center text-sm">
                          <span style={{ color: '#6d7b6c' }}>{label}</span>
                          <span className="font-semibold" style={{ color: '#191c1d' }}>{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Agreement checkbox */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.4 }}
                className="flex items-start gap-3 mb-8 p-4 rounded-xl cursor-pointer"
                style={{ backgroundColor: agreed ? '#e8f5ed' : '#f3f4f5', border: `1px solid ${agreed ? 'rgba(0,110,47,0.2)' : 'transparent'}`, transition: 'all 0.2s' }}
                onClick={() => setAgreed(v => !v)}>
                <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-200"
                  style={{ backgroundColor: agreed ? '#006e2f' : '#ffffff', border: agreed ? 'none' : '1.5px solid #bccbb9' }}>
                  {agreed && <span style={{ color: '#fff' }}>{Ic.check}</span>}
                </div>
                <p className="text-sm" style={{ color: '#3d4a3d', lineHeight: 1.6 }}>
                  I have read and understood all the rules and guidelines for this examination session. I agree to abide by the academic integrity policy.
                </p>
              </motion.div>

              {/* Footer actions */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65, duration: 0.4 }}
                className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8"
                style={{ borderTop: '1px solid #edeeef' }}>
                <div className="flex items-center gap-2" style={{ color: '#6d7b6c' }}>
                  {Ic.help}
                  <span className="text-sm font-medium">Need help? Contact your invigilator.</span>
                </div>

                <div className="flex gap-3 w-full sm:w-auto">
                  {/* Back */}
                  <motion.button whileTap={{ scale: 0.96 }}
                    onClick={() => navigate('/select-subject')}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 rounded-full font-bold text-sm transition-colors"
                    style={{ backgroundColor: '#f3f4f5', color: '#191c1d' }}
                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#e7e8e9')}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = '#f3f4f5')}>
                    {Ic.back} Back
                  </motion.button>

                  {/* Start */}
                  <motion.button
                    whileHover={agreed ? { y: -2, boxShadow: '0 8px 24px rgba(34,197,94,0.35)' } : {}}
                    whileTap={agreed ? { scale: 0.96 } : {}}
                    onClick={() => agreed && setShowModal(true)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm text-white transition-all duration-200"
                    style={{
                      background: agreed ? 'linear-gradient(135deg,#006e2f,#22c55e)' : '#d9dadb',
                      boxShadow: agreed ? '0 4px 16px rgba(34,197,94,0.25)' : 'none',
                      cursor: agreed ? 'pointer' : 'not-allowed',
                      color: agreed ? '#ffffff' : '#6d7b6c',
                    }}>
                    I Understand, Start Exam
                    {Ic.play}
                  </motion.button>
                </div>
              </motion.div>

              {/* Disclaimer */}
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.75 }}
                className="mt-8 text-center text-xs"
                style={{ color: '#bccbb9', lineHeight: 1.7 }}>
                By clicking "I Understand, Start Exam", you acknowledge that you have read and understood the rules for this CBT session. All actions are logged for security and integrity purposes.
              </motion.p>

            </motion.div>
          </div>
        </main>
      </div>
    </>
  )
}