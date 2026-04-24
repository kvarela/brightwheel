import { Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { LandingPage } from './features/landing/LandingPage'
import { DashboardPage } from './features/dashboard/DashboardPage'
import { ParentChatPage } from './features/parent-chat/pages/ParentChatPage'

export function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<LandingPage />} />
        {/* Feature routes are registered per feature module */}
      </Route>
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/school/:schoolId/chat" element={<ParentChatPage />} />
    </Routes>
  )
}
