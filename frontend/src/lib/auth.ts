export type UserRole = 'student' | 'admin'

export type StudentRecord = {
  studentId: string
  fullName: string
  className: string
  email: string
  phone: string
  gender: string
}

export type AdminRecord = {
  username: string
  fullName: string
}

export type AuthSession =
  | {
      role: 'student'
      studentId: string
      fullName: string
      className: string
      email: string
      phone: string
      gender: string
    }
  | {
      role: 'admin'
      username: string
      fullName: string
    }

const STUDENTS_STORAGE_KEY = 'cbt_students'
const SESSION_STORAGE_KEY = 'cbt_session'

const DEFAULT_STUDENTS: StudentRecord[] = [
  {
    studentId: 'SS2/2024/001',
    fullName: 'Amina Yusuf',
    className: 'SS2 Science',
    email: 'amina@example.com',
    phone: '08012345678',
    gender: 'Female',
  },
  {
    studentId: 'SS2/2024/002',
    fullName: 'Emeka Eze',
    className: 'SS2 Science',
    email: 'emeka@example.com',
    phone: '08098765432',
    gender: 'Male',
  },
]

const DEFAULT_ADMIN: AdminRecord = {
  username: 'admin',
  fullName: 'Super Admin',
}

const DEFAULT_ADMIN_PASSWORD = 'admin123'

const normalizeStudentId = (studentId: string) => studentId.trim().toUpperCase()

const splitCsvLine = (line: string) => {
  const values: string[] = []
  let current = ''
  let insideQuotes = false

  for (const char of line) {
    if (char === '"') {
      insideQuotes = !insideQuotes
      continue
    }

    if (char === ',' && !insideQuotes) {
      values.push(current.trim())
      current = ''
      continue
    }

    current += char
  }

  values.push(current.trim())
  return values
}

const hasWindow = () => typeof window !== 'undefined'

export const getDefaultAdmin = () => DEFAULT_ADMIN

export const verifyAdminCredentials = (username: string, password: string) =>
  username.trim().toLowerCase() === DEFAULT_ADMIN.username && password === DEFAULT_ADMIN_PASSWORD

export const getInitialStudents = (): StudentRecord[] => DEFAULT_STUDENTS

export const loadStudents = (): StudentRecord[] => {
  if (!hasWindow()) return DEFAULT_STUDENTS

  try {
    const saved = window.localStorage.getItem(STUDENTS_STORAGE_KEY)
    if (!saved) return DEFAULT_STUDENTS

    const parsed = JSON.parse(saved) as StudentRecord[]
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_STUDENTS

    return parsed.map(student => ({
      ...student,
      studentId: normalizeStudentId(student.studentId),
    }))
  } catch {
    return DEFAULT_STUDENTS
  }
}

export const saveStudents = (students: StudentRecord[]) => {
  if (!hasWindow()) return

  window.localStorage.setItem(
    STUDENTS_STORAGE_KEY,
    JSON.stringify(
      students.map(student => ({
        ...student,
        studentId: normalizeStudentId(student.studentId),
      })),
    ),
  )
}

export const findStudentById = (studentId: string) => {
  const normalizedId = normalizeStudentId(studentId)
  return loadStudents().find(student => student.studentId === normalizedId) ?? null
}

export const loadSession = (): AuthSession | null => {
  if (!hasWindow()) return null

  try {
    const saved = window.localStorage.getItem(SESSION_STORAGE_KEY)
    return saved ? (JSON.parse(saved) as AuthSession) : null
  } catch {
    return null
  }
}

export const saveSession = (session: AuthSession | null) => {
  if (!hasWindow()) return

  if (!session) {
    window.localStorage.removeItem(SESSION_STORAGE_KEY)
    return
  }

  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
}

export const buildStudentSession = (student: StudentRecord): AuthSession => ({
  role: 'student',
  studentId: normalizeStudentId(student.studentId),
  fullName: student.fullName,
  className: student.className,
  email: student.email,
  phone: student.phone,
  gender: student.gender,
})

export const buildAdminSession = (): AuthSession => ({
  role: 'admin',
  username: DEFAULT_ADMIN.username,
  fullName: DEFAULT_ADMIN.fullName,
})

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

export const importStudentsFromCsv = (csvText: string) => {
  const lines = csvText
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)

  if (lines.length < 2) {
    throw new Error('The CSV file is empty or missing student rows.')
  }

  const headers = splitCsvLine(lines[0]).map(header => header.toLowerCase())
  const studentIdIndex = headers.indexOf('student_id')
  const fullNameIndex = headers.indexOf('full_name')
  const classIndex = headers.indexOf('class')
  const emailIndex = headers.indexOf('email')
  const phoneIndex = headers.indexOf('phone')
  const genderIndex = headers.indexOf('gender')

  if (studentIdIndex === -1 || fullNameIndex === -1 || classIndex === -1) {
    throw new Error('CSV must include student_id, full_name, and class columns.')
  }

  const existingStudents = loadStudents()
  const existingIds = new Set(existingStudents.map(student => student.studentId))
  const importedStudents: StudentRecord[] = []
  let duplicates = 0

  for (const line of lines.slice(1)) {
    const columns = splitCsvLine(line)
    const studentId = normalizeStudentId(columns[studentIdIndex] ?? '')
    const fullName = (columns[fullNameIndex] ?? '').trim()
    const className = (columns[classIndex] ?? '').trim()

    if (!studentId || !fullName || !className) {
      continue
    }

    if (existingIds.has(studentId)) {
      duplicates += 1
      continue
    }

    existingIds.add(studentId)
    importedStudents.push({
      studentId,
      fullName,
      className,
      email: (columns[emailIndex] ?? '').trim(),
      phone: (columns[phoneIndex] ?? '').trim(),
      gender: (columns[genderIndex] ?? '').trim(),
    })
  }

  const nextStudents = [...existingStudents, ...importedStudents]
  saveStudents(nextStudents)

  return {
    added: importedStudents.length,
    duplicates,
    total: nextStudents.length,
  }
}
