import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  buildAdminSession,
  buildStudentSession,
  findStudentById,
  getDefaultAdmin,
  loadSession,
  saveSession,
  verifyAdminCredentials,
  type AuthSession,
} from '../lib/auth'

type AuthContextValue = {
  session: AuthSession | null
  loginStudent: (studentId: string) => { ok: true } | { ok: false; message: string }
  loginAdmin: (username: string, password: string) => { ok: true } | { ok: false; message: string }
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null)

  useEffect(() => {
    setSession(loadSession())
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      loginStudent: (studentId: string) => {
        const student = findStudentById(studentId)
        if (!student) {
          return {
            ok: false,
            message: 'Student ID not found. Contact your school administrator to get registered.',
          }
        }

        const nextSession = buildStudentSession(student)
        setSession(nextSession)
        saveSession(nextSession)

        return { ok: true }
      },
      loginAdmin: (username: string, password: string) => {
        if (!verifyAdminCredentials(username, password)) {
          return {
            ok: false,
            message: 'Invalid admin credentials.',
          }
        }

        const nextSession = buildAdminSession()
        setSession(nextSession)
        saveSession(nextSession)

        return { ok: true }
      },
      logout: () => {
        setSession(null)
        saveSession(null)
      },
    }),
    [session],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider')
  }

  return context
}

export const demoAdmin = getDefaultAdmin()
