import { useEffect, useMemo, useState } from 'react'
import { Box, Flex, Spinner, Text } from '@chakra-ui/react'
import { InboxState } from '@brightwheel/shared'
import type { ChatSessionDto } from '@brightwheel/shared'
import { useAuthStore } from '../../../store/authStore'
import { useInboxStore } from '../../../store/inboxStore'
import { useConversations } from '../api/useConversations'
import { ConversationListItem } from '../components/ConversationListItem'
import { ConversationDetail } from '../components/ConversationDetail'

type FilterState = 'needs_attention' | 'in_progress' | 'resolved'

const FILTERS: { value: FilterState; label: string; inboxState: InboxState }[] = [
  { value: 'needs_attention', label: 'Needs attention', inboxState: InboxState.NeedsAttention },
  { value: 'in_progress', label: 'In progress', inboxState: InboxState.InProgress },
  { value: 'resolved', label: 'Resolved', inboxState: InboxState.Resolved },
]

export function DashboardPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const openLogin = useAuthStore((s) => s.openLogin)
  const clearInbox = useInboxStore((s) => s.clearAll)
  const [filter, setFilter] = useState<FilterState>('needs_attention')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const activeFilter = FILTERS.find((f) => f.value === filter)!
  const { data, isLoading } = useConversations(activeFilter.inboxState)

  useEffect(() => {
    if (!isAuthenticated) openLogin()
  }, [isAuthenticated, openLogin])

  useEffect(() => {
    clearInbox()
  }, [clearInbox])

  const conversations = useMemo<ChatSessionDto[]>(() => data ?? [], [data])

  useEffect(() => {
    if (!selectedId && conversations.length > 0) {
      setSelectedId(conversations[0].id)
    }
    if (
      selectedId &&
      !conversations.some((c) => c.id === selectedId) &&
      conversations.length > 0
    ) {
      setSelectedId(conversations[0].id)
    }
  }, [conversations, selectedId])

  if (!isAuthenticated) {
    return (
      <Flex align="center" justify="center" h="calc(100vh - 240px)" px="24px">
        <Text fontSize="14px" color="#5C5E6A">
          Please log in to view the operator dashboard.
        </Text>
      </Flex>
    )
  }

  return (
    <Flex
      h="calc(100vh - 73px)"
      bg="#F7F9FB"
      borderTop="1px solid #EBEFF4"
    >
      <Flex
        direction="column"
        w={{ base: '280px', md: '360px' }}
        bg="white"
        borderRight="1px solid #EBEFF4"
        minW={0}
      >
        <Box px="20px" py="18px" borderBottom="1px solid #EBEFF4">
          <Text fontSize="18px" fontWeight={600} color="#18181D">
            Parent conversations
          </Text>
          <Flex gap={1} mt="12px" bg="#F7F9FB" borderRadius="4px" p="3px">
            {FILTERS.map((f) => (
              <Box
                key={f.value}
                as="button"
                onClick={() => {
                  setFilter(f.value)
                  setSelectedId(null)
                }}
                flex={1}
                bg={filter === f.value ? 'white' : 'transparent'}
                color={filter === f.value ? '#18181D' : '#5C5E6A'}
                fontSize="12px"
                fontWeight={600}
                borderRadius="3px"
                py="6px"
                cursor="pointer"
                boxShadow={
                  filter === f.value
                    ? '0 1px 2px rgba(30,37,73,0.08)'
                    : undefined
                }
              >
                {f.label}
              </Box>
            ))}
          </Flex>
        </Box>

        <Box flex={1} overflowY="auto">
          {isLoading ? (
            <Flex h="full" align="center" justify="center" py="40px">
              <Spinner color="#5463D6" />
            </Flex>
          ) : conversations.length === 0 ? (
            <Flex align="center" justify="center" py="40px" px="20px">
              <Text fontSize="13px" color="#737685" textAlign="center">
                No conversations in this inbox yet.
              </Text>
            </Flex>
          ) : (
            conversations.map((conversation) => (
              <ConversationListItem
                key={conversation.id}
                conversation={conversation}
                isSelected={conversation.id === selectedId}
                onSelect={setSelectedId}
              />
            ))
          )}
        </Box>
      </Flex>

      <ConversationDetail conversationId={selectedId} />
    </Flex>
  )
}
