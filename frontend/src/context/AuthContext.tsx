import { createContext, useContext, useEffect, useState } from 'react'
import {
  loadSession,
  performAdminLogin,
  performLogout,
  performStudentLogin,
  saveSession,
  type AuthSession,
} from '../lib/auth'
import { api } from '../lib/apiClient'

type AuthContextValue = {
  session: AuthSession | null
  loading: boolean
  loginStudent: (studentId: string) => Promise<{ ok: true } | { ok: false; message: string }>
  loginAdmin: (username: string, password: string) => Promise<{ ok: true } | { ok: false; message: string }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [loading, setLoading] = useState(true)

  // On mount: restore from localStorage, then validate token with backend
  useEffect(() => {
    const cached = loadSession()
    if (!cached) {
      setLoading(false)
      return
    }

    setSession(cached)

    api.auth
      .me()
      .then(() => {
        // token still valid — nothing to do
      })
      .catch(() => {
        // token expired or invalid — clear session
        setSession(null)
        saveSession(null)
      })
      .finally(() => setLoading(false))
  }, [])

  async function loginStudent(studentId: string) {
    const result = await performStudentLogin(studentId)
    if (result.ok) {
      setSession(result.session)
      saveSession(result.session)
      return { ok: true as const }
    }
    return result
  }

  async function loginAdmin(username: string, password: string) {
    const result = await performAdminLogin(username, password)
    if (result.ok) {
      setSession(result.session)
      saveSession(result.session)
      return { ok: true as const }
    }
    return result
  }

  async function logout() {
    await performLogout()
    setSession(null)
  }

  return (
    <AuthContext.Provider value={{ session, loading, loginStudent, loginAdmin, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside an AuthProvider')
  return context
}
