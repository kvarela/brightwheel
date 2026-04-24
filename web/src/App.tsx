import { Navigate, Route, Routes } from 'react-router-dom'
import { DashboardPage } from './features/dashboard/DashboardPage'

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/dashboard" element={<DashboardPage />} />
    </Routes>
  )
}
