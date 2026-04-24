import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { Box, Flex, Spinner, Text, Textarea } from '@chakra-ui/react'
import { InboxState } from '@brightwheel/shared'
import { useConversation } from '../api/useConversation'
import { useStaffReply } from '../api/useStaffReply'
import { useUpdateInboxState } from '../api/useUpdateInboxState'
import { ConversationMessageBubble } from './ConversationMessageBubble'

interface ConversationDetailProps {
  conversationId: string | null
}

export function ConversationDetail({ conversationId }: ConversationDetailProps) {
  const { data, isLoading, isError } = useConversation(conversationId ?? undefined)
  const staffReply = useStaffReply()
  const updateState = useUpdateInboxState()
  const [draft, setDraft] = useState('')
  const bottomRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [data?.messages.length])

  useEffect(() => {
    setDraft('')
  }, [conversationId])

  if (!conversationId) {
    return (
      <Flex flex={1} align="center" justify="center" bg="#F7F9FB" p="24px">
        <Text fontSize="14px" color="#5C5E6A">
          Select a conversation to view the chat.
        </Text>
      </Flex>
    )
  }

  if (isLoading) {
    return (
      <Flex flex={1} align="center" justify="center" bg="#F7F9FB">
        <Spinner color="#5463D6" />
      </Flex>
    )
  }

  if (isError || !data) {
    return (
      <Flex flex={1} align="center" justify="center" bg="#F7F9FB" p="24px">
        <Text fontSize="14px" color="#CF193A">
          We couldn&apos;t load this conversation.
        </Text>
      </Flex>
    )
  }

  const canSend = draft.trim().length > 0 && !staffReply.isPending

  const handleSend = async () => {
    const content = draft.trim()
    if (!content) return
    setDraft('')
    await staffReply.mutateAsync({ conversationId, content })
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const isResolved = data.session.inboxState === InboxState.Resolved

  return (
    <Flex direction="column" flex={1} bg="#F7F9FB" minW={0}>
      <Flex
        align="center"
        justify="space-between"
        bg="white"
        borderBottom="1px solid #EBEFF4"
        px="24px"
        py="14px"
        gap={3}
      >
        <Box minW={0}>
          <Text fontSize="15px" fontWeight={600} color="#18181D" truncate>
            {data.session.parentName || 'Parent chat'}
          </Text>
          <Text fontSize="12px" color="#737685" mt="2px">
            {data.session.inboxState === InboxState.NeedsAttention
              ? 'Needs attention'
              : data.session.inboxState === InboxState.InProgress
                ? 'In progress'
                : 'Resolved'}
          </Text>
        </Box>
        {!isResolved && (
          <Box
            as="button"
            onClick={() =>
              updateState.mutate({
                conversationId,
                inboxState: InboxState.Resolved,
              })
            }
            disabled={updateState.isPending}
            bg="transparent"
            border="1px solid #5463D6"
            color="#5463D6"
            borderRadius="2px"
            px="14px"
            py="6px"
            fontSize="13px"
            fontWeight={600}
            cursor={updateState.isPending ? 'not-allowed' : 'pointer'}
            _hover={{ bg: '#EEF1FB' }}
          >
            Mark resolved
          </Box>
        )}
      </Flex>

      <Box flex={1} overflowY="auto" px="24px" py="20px">
        <Flex direction="column" gap={4} maxW="820px" mx="auto">
          {data.messages.map((message) => (
            <ConversationMessageBubble key={message.id} message={message} />
          ))}
          <Box ref={bottomRef} />
        </Flex>
      </Box>

      <Box bg="white" borderTop="1px solid #EBEFF4" px="24px" py="16px">
        <Box maxW="820px" mx="auto">
          <Flex
            align="flex-end"
            gap={2}
            border="1px solid #EBEFF4"
            borderRadius="2px"
            px="12px"
            py="8px"
            _focusWithin={{
              borderColor: '#5463D6',
              boxShadow: '0 0 0 3px rgba(84,99,214,0.15)',
            }}
          >
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isResolved
                  ? 'Reply to reopen this conversation…'
                  : 'Type a reply to the parent…'
              }
              rows={1}
              resize="none"
              border="none"
              boxShadow="none"
              p={0}
              fontSize="14px"
              color="#18181D"
              minH="24px"
              maxH="180px"
              _placeholder={{ color: '#737685' }}
              _focus={{ boxShadow: 'none', outline: 'none' }}
            />
            <Box
              as="button"
              onClick={handleSend}
              disabled={!canSend}
              bg={canSend ? '#5463D6' : '#EBEFF4'}
              color={canSend ? 'white' : '#737685'}
              border="none"
              borderRadius="2px"
              px="16px"
              py="8px"
              fontSize="13px"
              fontWeight={600}
              cursor={canSend ? 'pointer' : 'not-allowed'}
              _hover={canSend ? { bg: '#4352c5' } : undefined}
            >
              Send
            </Box>
          </Flex>
        </Box>
      </Box>
    </Flex>
  )
}
