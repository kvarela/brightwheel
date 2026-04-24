import { Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { LandingPage } from './features/landing/LandingPage'
import { HandbookUploadPage } from './features/handbook/HandbookUploadPage'
import { HandbookUploadDetailPage } from './features/handbook/pages/HandbookUploadDetailPage'
import { DashboardPage } from './features/dashboard/DashboardPage'
import { LiveChatsPage } from './features/dashboard/pages/LiveChatsPage'
import { StaffChatPage } from './features/dashboard/pages/StaffChatPage'
import { KnowledgeBasePage } from './features/dashboard/pages/KnowledgeBasePage'
import { ParentChatPage } from './features/parent-chat/pages/ParentChatPage'

export function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/handbook" element={<HandbookUploadPage />} />
        <Route
          path="/handbook-uploads/:handbookUploadId"
          element={<HandbookUploadDetailPage />}
        />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/dashboard/chats" element={<LiveChatsPage />} />
        <Route path="/dashboard/chats/:sessionId" element={<StaffChatPage />} />
        <Route path="/dashboard/knowledge-base" element={<KnowledgeBasePage />} />
        <Route path="/school/:schoolId/chat" element={<ParentChatPage />} />
      </Route>
    </Routes>
  )
}
