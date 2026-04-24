import { Box, Flex, Text } from '@chakra-ui/react'
import type { ParentChatMessage } from '../types/ParentChatMessage'

interface ChatMessageBubbleProps {
  message: ParentChatMessage
}

const SENDER_LABELS: Record<ParentChatMessage['sender'], string> = {
  parent: 'You',
  ai: 'AI front desk',
  staff: 'School staff',
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  } catch {
    return ''
  }
}

export function ChatMessageBubble({ message }: ChatMessageBubbleProps) {
  const isParent = message.sender === 'parent'
  const alignment = isParent ? 'flex-end' : 'flex-start'
  const bg = isParent ? '#F7F9FB' : '#5463D6'
  const color = isParent ? '#18181D' : 'white'
  const labelColor = isParent ? '#737685' : '#737685'

  return (
    <Flex direction="column" align={alignment} w="full">
      <Text fontSize="11px" color={labelColor} mb="4px" px="2px">
        {SENDER_LABELS[message.sender]} · {formatTime(message.createdAt)}
      </Text>
      <Box
        bg={bg}
        color={color}
        borderRadius="2px"
        px="14px"
        py="10px"
        maxW={{ base: '85%', md: '70%' }}
        boxShadow="0 1px 2px rgba(30,37,73,0.05)"
      >
        <Text fontSize="14px" lineHeight={1.5} whiteSpace="pre-wrap">
          {message.content}
        </Text>
      </Box>
    </Flex>
  )
}
