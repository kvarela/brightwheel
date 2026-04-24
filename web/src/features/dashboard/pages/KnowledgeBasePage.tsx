import { Box, Text } from '@chakra-ui/react'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Link as RouterLink } from 'react-router-dom'
import { KnowledgeBaseSection } from '../components/KnowledgeBaseSection'
import { BrightwheelLogo } from '../../../components/BrightwheelLogo'

export function KnowledgeBasePage() {
  const navigate = useNavigate()

  return (
    <Box
      bg="#F7F9FB"
      fontFamily='"AvenirNext", "Helvetica Neue", helvetica, arial, sans-serif'
    >
      <Box
        as="header"
        bg="#1E2549"
        px={{ base: '16px', md: '40px' }}
        height="60px"
        display="flex"
        alignItems="center"
        gap="12px"
      >
        <RouterLink to="/" style={{ textDecoration: 'none' }}>
          <BrightwheelLogo />
        </RouterLink>
        <Box width="1px" height="18px" bg="rgba(255,255,255,0.15)" flexShrink={0} />
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
          color="rgba(255,255,255,0.6)"
          _hover={{ bg: 'rgba(255,255,255,0.1)', color: 'white' }}
          transition="all 0.2s"
          onClick={() => navigate('/dashboard')}
          title="Back to dashboard"
        >
          <ArrowLeft size={18} />
        </Box>
        <Box width="1px" height="18px" bg="rgba(255,255,255,0.15)" flexShrink={0} />
        <Text
          fontSize="18px"
          fontWeight={600}
          color="white"
          fontFamily='"AvenirNext", "Helvetica Neue", helvetica, arial, sans-serif'
        >
          Knowledge Base
        </Text>
      </Box>

      <Box
        maxWidth="1200px"
        mx="auto"
        px={{ base: '16px', md: '40px' }}
        py="32px"
      >
        <KnowledgeBaseSection fullPage />
      </Box>
    </Box>
  )
}
