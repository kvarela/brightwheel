import { useEffect, useRef } from 'react'
import { Box, VStack } from '@chakra-ui/react'
import type { ParentChatMessage } from '../types/ParentChatMessage'
import { ChatMessageBubble } from './ChatMessageBubble'
import { TypingIndicator } from './TypingIndicator'

interface ChatMessageListProps {
  messages: ParentChatMessage[]
  isTyping: boolean
}

export function ChatMessageList({ messages, isTyping }: ChatMessageListProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, isTyping])

  return (
    <Box flex={1} overflowY="auto" bg="#F7F9FB" px={{ base: '16px', md: '24px' }} py="20px">
      <VStack gap={4} align="stretch" maxW="720px" mx="auto" w="full">
        {messages.map((message) => (
          <ChatMessageBubble key={message.id} message={message} />
        ))}
        {isTyping && <TypingIndicator />}
        <Box ref={bottomRef} />
      </VStack>
    </Box>
  )
}
