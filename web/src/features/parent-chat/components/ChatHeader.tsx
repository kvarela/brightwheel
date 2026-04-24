import { Box, Flex, Text } from '@chakra-ui/react'
import { X } from 'lucide-react'
import { Link as RouterLink } from 'react-router-dom'

interface ChatHeaderProps {
  schoolName: string
}

export function ChatHeader({ schoolName }: ChatHeaderProps) {
  return (
    <Flex
      align="center"
      justify="space-between"
      bg="white"
      borderBottom="1px solid #EBEFF4"
      px={{ base: '16px', md: '24px' }}
      py="14px"
      gap={3}
    >
      <Flex align="center" gap={3} minW={0}>
        <Box
          w="36px"
          h="36px"
          borderRadius="50%"
          bg="#5463D6"
          color="white"
          display="flex"
          alignItems="center"
          justifyContent="center"
          fontSize="14px"
          fontWeight={600}
          flexShrink={0}
        >
          AI
        </Box>
        <Box minW={0}>
          <Text
            fontSize="15px"
            fontWeight={600}
            color="#18181D"
            lineHeight={1.2}
            truncate
          >
            {schoolName}
          </Text>
          <Flex align="center" gap={1.5} mt="2px">
            <Box w="6px" h="6px" borderRadius="50%" bg="#3BBA6E" />
            <Text fontSize="12px" color="#737685">
              AI front desk · Usually replies instantly
            </Text>
          </Flex>
        </Box>
      </Flex>
      <RouterLink to="/" aria-label="Leave chat" style={{ textDecoration: 'none' }}>
        <Flex
          align="center"
          justify="center"
          w="32px"
          h="32px"
          borderRadius="2px"
          color="#5463D6"
          _hover={{ bg: '#EBEFF4' }}
          transition="background 0.15s ease"
        >
          <X size={20} strokeWidth={2} />
        </Flex>
      </RouterLink>
    </Flex>
  )
}
