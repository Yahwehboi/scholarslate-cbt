import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import SelectSubjectPage from './pages/SelectSubjectPage'
import InstructionsPage from './pages/ExamInstructions'
import ExamPage from './pages/ExamPage'
import ResultPage from './pages/ResultPage'
import ResultsHistoryPage from './pages/ResultsHistoryPage'
import StudentProfilePage from './pages/StudentProfilePage'
import AdminControlPage from './pages/AdminControlPage'
import AdminUploadPage from './pages/AdminUploadPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/select-subject" element={<SelectSubjectPage />} />
      <Route path="/instructions" element={<InstructionsPage />} />
      <Route path="/exam" element={<ExamPage />} />
      <Route path="/result" element={<ResultPage />} />
      <Route path="/results-history" element={<ResultsHistoryPage />} />
      <Route path="/profile" element={<StudentProfilePage />} />
      <Route path="/admin" element={<AdminControlPage />} />
      <Route path="/admin/upload" element={<AdminUploadPage />} />
    </Routes>
  )
}

export default App