import { api, clearToken, storeToken, type ApiUser } from './apiClient'

// ─── Core types ───────────────────────────────────────────────────────────────
export type UserRole = 'student' | 'admin'

export type AuthSession =
  | {
      role: 'student'
      id: string
      studentId: string
      fullName: string
      className: string | null
    }
  | {
      role: 'admin'
      id: string
      username: string
      fullName: string
    }

// ─── Map API user → AuthSession ───────────────────────────────────────────────
export function apiUserToSession(user: ApiUser): AuthSession {
  if (user.role === 'student') {
    return {
      role: 'student',
      id: user.id,
      studentId: user.studentId,
      fullName: user.fullName,
      className: user.className ?? null,
    }
  }
  return {
    role: 'admin',
    id: user.id,
    username: 'username' in user ? user.username : '',
    fullName: user.fullName,
  }
}

const SESSION_KEY = 'cbt_session'

// ─── Session persistence ───────────────────────────────────────────────────────
export const loadSession = (): AuthSession | null => {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? (JSON.parse(raw) as AuthSession) : null
  } catch {
    return null
  }
}

export const saveSession = (session: AuthSession | null) => {
  if (!session) {
    localStorage.removeItem(SESSION_KEY)
    clearToken()
    return
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

// ─── Auth actions ─────────────────────────────────────────────────────────────
export async function performStudentLogin(
  studentId: string,
): Promise<{ ok: true; session: AuthSession } | { ok: false; message: string }> {
  try {
    const { token, user } = await api.auth.loginStudent(studentId)
    storeToken(token)
    return { ok: true, session: apiUserToSession(user) }
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : 'Login failed.' }
  }
}

export async function performAdminLogin(
  username: string,
  password: string,
): Promise<{ ok: true; session: AuthSession } | { ok: false; message: string }> {
  try {
    const { token, user } = await api.auth.loginAdmin(username, password)
    storeToken(token)
    return { ok: true, session: apiUserToSession(user) }
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : 'Login failed.' }
  }
}

export async function performLogout(): Promise<void> {
  try {
    await api.auth.logout()
  } catch {
    // best-effort; always clear locally
  } finally {
    saveSession(null)
  }
}

// ─── Utility helpers ──────────────────────────────────────────────────────────
export const getUserInitials = (fullName: string) =>
  fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? '')
    .join('')

export const formatClassLabel = (className: string) => {
  const [level, ...rest] = className.split(' ').filter(Boolean)
  if (!level) return ''
  return rest.length > 0 ? `${level} • ${rest.join(' ')}` : level
}
