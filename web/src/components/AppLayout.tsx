import { Box } from '@chakra-ui/react'
import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { LoginModal } from '../features/auth/LoginModal'
import { RegisterModal } from '../features/auth/RegisterModal'

export function AppLayout() {
  return (
    <Box display="flex" flexDirection="column" minH="100vh">
      <Header />
      <Box as="main" flex={1}>
        <Outlet />
      </Box>
      <Footer />
      <LoginModal />
      <RegisterModal />
    </Box>
  )
}
