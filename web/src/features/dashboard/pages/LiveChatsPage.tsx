import { Box, Text } from '@chakra-ui/react'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { LiveChatsSection } from '../components/LiveChatsSection'

export function LiveChatsPage() {
  const navigate = useNavigate()

  return (
    <Box
      minHeight="100vh"
      bg="#F7F9FB"
      fontFamily='"AvenirNext", "Helvetica Neue", helvetica, arial, sans-serif'
    >
      <Box
        as="header"
        bg="white"
        borderBottom="1px solid #EBEFF4"
        px={{ base: '16px', md: '40px' }}
        height="60px"
        display="flex"
        alignItems="center"
        gap="12px"
      >
        <Box
          as="button"
          display="flex"
          alignItems="center"
          justifyContent="center"
          width="32px"
          height="32px"
          borderRadius="2px"
          border="none"
          bg="transparent"
          cursor="pointer"
          color="#5C5E6A"
          _hover={{ bg: '#F7F9FB', color: '#5463D6' }}
          transition="all 0.2s"
          onClick={() => navigate('/dashboard')}
          title="Back to dashboard"
        >
          <ArrowLeft size={18} />
        </Box>
        <Box width="1px" height="18px" bg="#EBEFF4" flexShrink={0} />
        <Text
          fontSize="18px"
          fontWeight={600}
          color="#1E2549"
          fontFamily='"AvenirNext", "Helvetica Neue", helvetica, arial, sans-serif'
        >
          Live Chats
        </Text>
      </Box>

      <Box
        maxWidth="1200px"
        mx="auto"
        px={{ base: '16px', md: '40px' }}
        py="32px"
      >
        <LiveChatsSection fullPage />
      </Box>
    </Box>
  )
}
