import { Box, Flex, Text } from '@chakra-ui/react'
import type { ChatMessageDto } from '@brightwheel/shared'
import { MessageRole } from '@brightwheel/shared'
import { CertaintyBadge } from './CertaintyBadge'

interface ConversationMessageBubbleProps {
  message: ChatMessageDto
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    })
  } catch {
    return ''
  }
}

function label(message: ChatMessageDto): string {
  if (message.role === MessageRole.Parent) return 'Parent'
  if (message.role === MessageRole.Ai) return 'AI front desk'
  return message.sentByStaffName ?? 'School staff'
}

export function ConversationMessageBubble({
  message,
}: ConversationMessageBubbleProps) {
  const isParent = message.role === MessageRole.Parent
  const align = isParent ? 'flex-start' : 'flex-end'
  const bg =
    message.role === MessageRole.Ai
      ? '#5463D6'
      : message.role === MessageRole.Staff
        ? '#29B9BB'
        : '#F7F9FB'
  const color =
    message.role === MessageRole.Ai || message.role === MessageRole.Staff
      ? 'white'
      : '#18181D'

  return (
    <Flex direction="column" align={align} w="full">
      <Flex align="center" gap="8px" mb="4px" px="2px">
        <Text fontSize="11px" color="#737685">
          {label(message)} · {formatTime(message.createdAt)}
        </Text>
        {message.role === MessageRole.Ai && (
          <CertaintyBadge score={message.certaintyScore} />
        )}
      </Flex>
      <Box
        bg={bg}
        color={color}
        borderRadius="2px"
        px="14px"
        py="10px"
        maxW={{ base: '90%', md: '75%' }}
        boxShadow="0 1px 2px rgba(30,37,73,0.05)"
      >
        <Text fontSize="14px" lineHeight={1.5} whiteSpace="pre-wrap">
          {message.content}
        </Text>
      </Box>
    </Flex>
  )
}
