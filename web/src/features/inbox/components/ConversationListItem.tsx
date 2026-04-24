import { Box, Flex, Text } from '@chakra-ui/react'
import type { ChatSessionDto } from '@brightwheel/shared'
import { InboxState } from '@brightwheel/shared'
import { CertaintyBadge } from './CertaintyBadge'

interface ConversationListItemProps {
  conversation: ChatSessionDto
  isSelected: boolean
  onSelect: (id: string) => void
}

function relativeTime(iso: string | null): string {
  if (!iso) return ''
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function ConversationListItem({
  conversation,
  isSelected,
  onSelect,
}: ConversationListItemProps) {
  const needsAttention =
    conversation.inboxState === InboxState.NeedsAttention
  return (
    <Box
      as="button"
      onClick={() => onSelect(conversation.id)}
      textAlign="left"
      w="full"
      bg={isSelected ? '#EEF1FB' : 'white'}
      borderBottom="1px solid #EBEFF4"
      borderLeft={
        isSelected ? '3px solid #5463D6' : '3px solid transparent'
      }
      px="16px"
      py="14px"
      cursor="pointer"
      transition="background 0.15s ease"
      _hover={{ bg: isSelected ? '#EEF1FB' : '#F7F9FB' }}
    >
      <Flex align="center" justify="space-between" gap={2}>
        <Flex align="center" gap={2} minW={0}>
          {needsAttention && (
            <Box
              w="8px"
              h="8px"
              borderRadius="50%"
              bg="#CF193A"
              flexShrink={0}
            />
          )}
          <Text
            fontSize="14px"
            fontWeight={600}
            color="#18181D"
            truncate
          >
            {conversation.parentName || 'Parent'}
          </Text>
        </Flex>
        <Text fontSize="11px" color="#737685" flexShrink={0}>
          {relativeTime(conversation.escalatedAt ?? conversation.updatedAt)}
        </Text>
      </Flex>
      <Text
        fontSize="13px"
        color="#5C5E6A"
        mt="4px"
        lineClamp={2}
      >
        {conversation.lastMessagePreview ?? 'No messages yet'}
      </Text>
      <Flex align="center" gap={2} mt="8px">
        <CertaintyBadge score={conversation.lastCertaintyScore} />
      </Flex>
    </Box>
  )
}
