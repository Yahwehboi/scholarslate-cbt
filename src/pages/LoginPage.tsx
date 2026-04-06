import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

// ─── SVG Icons (inline — no font dependency) ──────────────────────
const Icons = {
  school: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/>
    </svg>
  ),
  person: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
    </svg>
  ),
  help: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
    </svg>
  ),
  mail: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
      <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
    </svg>
  ),
  error: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
    </svg>
  ),
}

// ─── Left hero panel ───────────────────────────────────────────────
function LoginHero() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="hidden md:flex flex-col justify-between p-12 relative overflow-hidden"
      style={{ backgroundColor: '#f3f4f5' }}
    >
      {/* Decorative blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute rounded-full blur-3xl"
          style={{ top: '-10%', right: '-10%', width: '22rem', height: '22rem', backgroundColor: '#22c55e', opacity: 0.09 }} />
        <div className="absolute rounded-full blur-3xl"
          style={{ bottom: '-5%', left: '-5%', width: '15rem', height: '15rem', backgroundColor: '#afefb4', opacity: 0.13 }} />
      </div>

      {/* Logo */}
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-14">
          <div className="w-10 h-10 flex items-center justify-center text-white"
            style={{ backgroundColor: '#006e2f', borderRadius: '0.5rem' }}>
            {Icons.school}
          </div>
          <span className="text-xl font-extrabold tracking-tight"
            style={{ fontFamily: 'Manrope, sans-serif', color: '#191c1d' }}>
            ScholarSlate
          </span>
        </div>

        {/* Headline */}
        <div className="space-y-5">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="font-extrabold tracking-tight leading-tight"
            style={{ fontFamily: 'Manrope, sans-serif', fontSize: 'clamp(2.6rem, 4vw, 3.6rem)', color: '#191c1d' }}
          >
            Focused <br />
            <span style={{ color: '#006e2f', fontStyle: 'italic' }}>Learning</span>,<br />
            Simplified.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="text-base leading-relaxed max-w-xs"
            style={{ color: '#3d4a3d' }}
          >
            A premium, distraction-free environment built for secondary school excellence.
          </motion.p>

          {/* Exam badges */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.4 }}
            className="flex gap-2 flex-wrap pt-1"
          >
            {['WAEC Mock', 'NECO Mock', 'JAMB Mock', 'School CBT'].map((badge) => (
              <span key={badge} className="text-xs font-semibold px-3 py-1"
                style={{
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(0,110,47,0.08)',
                  color: '#006e2f',
                  fontFamily: 'Inter, sans-serif',
                  border: '1px solid rgba(0,110,47,0.15)',
                }}>
                {badge}
              </span>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Social proof */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="relative z-10 flex items-center gap-4 p-5"
        style={{
          background: 'rgba(255,255,255,0.55)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRadius: '9999px',
          border: '1px solid rgba(188,203,185,0.2)',
        }}
      >
        <div className="flex -space-x-2 shrink-0">
          {[
            { bg: '#006e2f', letter: 'A', color: '#fff' },
            { bg: '#22c55e', letter: 'B', color: '#fff' },
            { bg: '#afefb4', letter: 'C', color: '#006e2f' },
          ].map(({ bg, letter, color }, i) => (
            <div key={i} className="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold"
              style={{ backgroundColor: bg, color, zIndex: 3 - i }}>
              {letter}
            </div>
          ))}
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: '#191c1d' }}>Join 5,000+ students</p>
          <p className="text-xs" style={{ color: '#3d4a3d' }}>Accessing their exams daily.</p>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Login form (Student ID only) ─────────────────────────────────
function LoginForm() {
  const navigate = useNavigate()
  const [studentId, setStudentId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!studentId.trim()) {
      setError('Please enter your Student ID to continue.')
      return
    }
    setIsLoading(true)
    // Simulated login — replace with real API call later
    setTimeout(() => {
      setIsLoading(false)
      navigate('/dashboard')
    }, 1400)
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="flex flex-col justify-center px-8 py-14 md:px-14 lg:px-20"
      style={{ backgroundColor: '#ffffff' }}
    >
      {/* Mobile logo */}
      <div className="flex md:hidden items-center gap-2 mb-10">
        <div className="w-9 h-9 flex items-center justify-center text-white"
          style={{ backgroundColor: '#006e2f', borderRadius: '0.45rem' }}>
          {Icons.school}
        </div>
        <span className="text-lg font-black" style={{ fontFamily: 'Manrope, sans-serif', color: '#006e2f' }}>
          ScholarSlate
        </span>
      </div>

      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
        className="mb-10"
      >
        <h2 className="text-3xl font-bold tracking-tight mb-2"
          style={{ fontFamily: 'Manrope, sans-serif', color: '#191c1d' }}>
          Welcome back
        </h2>
        <p style={{ color: '#3d4a3d', fontSize: '0.95rem' }}>
          Enter your Student ID to access your portal.
        </p>
      </motion.div>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 px-4 py-3 flex items-center gap-2 text-sm font-medium"
          style={{ backgroundColor: '#ffdad6', color: '#93000a', borderRadius: '0.75rem' }}
        >
          {Icons.error}
          {error}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Student ID */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, duration: 0.4 }}
          className="space-y-2"
        >
          <label htmlFor="student-id"
            className="block text-xs font-bold uppercase tracking-widest"
            style={{ color: '#3d4a3d', fontFamily: 'Inter, sans-serif' }}>
            Student ID
          </label>
          <div className="relative">
            <span className="absolute left-0 top-1/2 -translate-y-1/2 transition-colors duration-200"
              style={{ color: isFocused ? '#006e2f' : '#bccbb9' }}>
              {Icons.person}
            </span>
            <input
              id="student-id"
              type="text"
              autoComplete="off"
              placeholder="e.g. SS2/2024/001"
              value={studentId}
              onChange={e => setStudentId(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              style={{
                width: '100%',
                background: 'transparent',
                outline: 'none',
                paddingTop: '10px',
                paddingBottom: '10px',
                paddingLeft: '32px',
                paddingRight: '12px',
                fontSize: '1rem',
                fontFamily: 'Inter, sans-serif',
                color: '#191c1d',
                borderTop: 'none',
                borderLeft: 'none',
                borderRight: 'none',
                borderBottom: isFocused ? '2px solid #006e2f' : '1px solid rgba(188,203,185,0.5)',
                transition: 'border-color 0.2s',
                WebkitBoxShadow: '0 0 0px 1000px #ffffff inset',
              }}
            />
          </div>
          <p className="text-xs pl-1" style={{ color: '#6d7b6c' }}>
            Your Student ID is provided by your school administrator.
          </p>
        </motion.div>

        {/* Forgot ID */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="flex justify-end"
          style={{ marginTop: '-16px' }}
        >
          <button type="button" className="text-sm font-semibold transition-colors duration-200"
            style={{ color: '#006e2f' }}>
            Forgot your Student ID?
          </button>
        </motion.div>

        {/* Submit */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38, duration: 0.4 }}
        >
          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: isLoading ? 1 : 1.02, boxShadow: '0 6px 24px rgba(34,197,94,0.4)' }}
            whileTap={{ scale: isLoading ? 1 : 0.97 }}
            style={{
              width: '100%',
              paddingTop: '1rem',
              paddingBottom: '1rem',
              fontFamily: 'Manrope, sans-serif',
              fontWeight: 700,
              fontSize: '1.05rem',
              color: '#ffffff',
              borderRadius: '9999px',
              background: 'linear-gradient(135deg, #006e2f 0%, #22c55e 100%)',
              boxShadow: '0 4px 20px rgba(34,197,94,0.28)',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.85 : 1,
              border: 'none',
            }}
          >
            {isLoading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <svg style={{ animation: 'spin 1s linear infinite' }} width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
                  <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="4" />
                  <path d="M4 12a8 8 0 018-8v8z" fill="white" />
                </svg>
                Signing in...
              </span>
            ) : (
              'Access My Portal'
            )}
          </motion.button>
        </motion.div>
      </form>

      {/* Support */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="mt-14 flex flex-col items-center gap-5"
      >
        <div className="flex items-center gap-4 w-full">
          <div className="flex-1" style={{ height: '1px', backgroundColor: '#e7e8e9' }} />
          <span className="text-xs font-bold uppercase tracking-widest"
            style={{ color: '#bccbb9', fontFamily: 'Inter, sans-serif' }}>
            Support
          </span>
          <div className="flex-1" style={{ height: '1px', backgroundColor: '#e7e8e9' }} />
        </div>
        <div className="flex gap-8">
          {[
            { icon: Icons.help, label: 'Help Center' },
            { icon: Icons.mail, label: 'Admin Support' },
          ].map(({ icon, label }) => (
            <button key={label} type="button"
              className="flex items-center gap-1.5 text-sm font-medium transition-colors duration-200"
              style={{ color: '#3d4a3d' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#006e2f')}
              onMouseLeave={e => (e.currentTarget.style.color = '#3d4a3d')}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Page root ─────────────────────────────────────────────────────
export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-6"
      style={{ backgroundColor: '#f8f9fa' }}>

      <motion.main
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{
          width: '100%',
          maxWidth: '1050px',
          display: 'grid',
          gridTemplateColumns: '1fr',
          backgroundColor: '#ffffff',
          borderRadius: '1.5rem',
          boxShadow: '0px 16px 56px rgba(25,28,29,0.09)',
          overflow: 'hidden',
        }}
      >
        {/* Two-column on md+ screens */}
        <style>{`
          @media (min-width: 768px) {
            .login-grid { grid-template-columns: 1fr 1fr !important; }
          }
        `}</style>
        <div className="login-grid" style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
        }}>
          <LoginHero />
          <LoginForm />
        </div>
      </motion.main>

      <p className="fixed bottom-6 left-0 right-0 text-center text-xs tracking-wider uppercase"
        style={{ color: '#bccbb9', fontFamily: 'Inter, sans-serif', pointerEvents: 'none', opacity: 0.7 }}>
        © {new Date().getFullYear()} ScholarSlate CBT • Secure Academic Infrastructure
      </p>
    </div>
  )
}