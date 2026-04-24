import { Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { LandingPage } from './features/landing/LandingPage'
import { ParentChatPage } from './features/parent-chat/pages/ParentChatPage'

export function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<div>Dashboard — coming soon</div>} />
        {/* Feature routes are registered per feature module */}
      </Route>
      <Route path="/school/:schoolId/chat" element={<ParentChatPage />} />
    </Routes>
  )
}
