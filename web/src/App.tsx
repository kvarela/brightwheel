import { Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { LandingPage } from './features/landing/LandingPage'
import { HandbookUploadPage } from './features/handbook/HandbookUploadPage'
import { DashboardPage } from './features/dashboard/DashboardPage'
import { LiveChatsPage } from './features/dashboard/pages/LiveChatsPage'
import { KnowledgeBasePage } from './features/dashboard/pages/KnowledgeBasePage'
import { ParentChatPage } from './features/parent-chat/pages/ParentChatPage'

export function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/handbook" element={<HandbookUploadPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/dashboard/chats" element={<LiveChatsPage />} />
        <Route path="/dashboard/knowledge-base" element={<KnowledgeBasePage />} />
        <Route path="/school/:schoolId/chat" element={<ParentChatPage />} />
      </Route>
    </Routes>
  )
}
