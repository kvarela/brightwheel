import { Box, Text } from '@chakra-ui/react'
import { LiveChatsSection } from './components/LiveChatsSection'
import { HandbookUploadsSection } from './components/HandbookUploadsSection'
import { KnowledgeBaseSection } from './components/KnowledgeBaseSection'

export function DashboardPage() {
  return (
    <Box
      minHeight="100vh"
      bg="#F7F9FB"
      fontFamily='"AvenirNext", "Helvetica Neue", helvetica, arial, sans-serif'
    >
      <Box
        bg="white"
        borderBottom="1px solid #EBEFF4"
        px={{ base: '16px', md: '40px' }}
        py="16px"
        display="flex"
        alignItems="center"
      >
        <Text
          fontSize="22px"
          fontWeight={600}
          color="#1E2549"
          fontFamily='"AvenirNext", "Helvetica Neue", helvetica, arial, sans-serif'
        >
          Brightwheel AI Front Desk
        </Text>
      </Box>

      <Box
        maxWidth="960px"
        mx="auto"
        px={{ base: '16px', md: '40px' }}
        py="32px"
        display="flex"
        flexDirection="column"
        gap="24px"
      >
        <LiveChatsSection />
        <HandbookUploadsSection />
        <KnowledgeBaseSection />
      </Box>
    </Box>
  )
}
