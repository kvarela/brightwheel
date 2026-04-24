import { Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { LandingPage } from './features/landing/LandingPage'
import { HandbookUploadPage } from './features/handbook/HandbookUploadPage'

export function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/handbook" element={<HandbookUploadPage />} />
        {/* Feature routes are registered per feature module */}
      </Route>
    </Routes>
  )
}
