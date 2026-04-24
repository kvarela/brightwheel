import { Box } from '@chakra-ui/react'
import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { LoginModal } from '../features/auth/LoginModal'
import { RegisterModal } from '../features/auth/RegisterModal'
import { useStaffSocket } from '../hooks/useStaffSocket'
import { useAuthStore } from '../store/authStore'

export function AppLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  useStaffSocket()

  return (
    <Box display="flex" flexDirection="column" minH="100vh">
      {!isAuthenticated && <Header />}
      <Box as="main" flex={1}>
        <Outlet />
      </Box>
      <Footer />
      <LoginModal />
      <RegisterModal />
    </Box>
  )
}
