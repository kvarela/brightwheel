import { useCallback, useEffect, useState } from 'react'
import { Box, Flex, Spinner, Text } from '@chakra-ui/react'
import { Link as RouterLink, useParams } from 'react-router-dom'
import { useSchool } from '../../school/api/useSchool'
import type { ParentChatMessage } from '../types/ParentChatMessage'
import { ChatHeader } from '../components/ChatHeader'
import { ChatMessageList } from '../components/ChatMessageList'
import { ChatInput } from '../components/ChatInput'

function createMessageId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function buildWelcomeMessage(schoolName: string): ParentChatMessage {
  return {
    id: createMessageId(),
    sender: 'ai',
    content: `Hi! I'm the AI front desk for ${schoolName}. Ask me anything about hours, tuition, enrollment, or day-to-day life at the school — I'll do my best to help, and loop in a staff member if I'm not sure.`,
    createdAt: new Date().toISOString(),
  }
}

export function ParentChatPage() {
  const { schoolId } = useParams<{ schoolId: string }>()
  const { data: school, isLoading, isError } = useSchool(schoolId)

  const [messages, setMessages] = useState<ParentChatMessage[]>([])
  const [isTyping, setIsTyping] = useState(false)

  useEffect(() => {
    if (!school) return
    setMessages((prev) => (prev.length === 0 ? [buildWelcomeMessage(school.name)] : prev))
  }, [school])

  const handleSend = useCallback((content: string) => {
    const parentMessage: ParentChatMessage = {
      id: createMessageId(),
      sender: 'parent',
      content,
      createdAt: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, parentMessage])
    setIsTyping(true)

    window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: createMessageId(),
          sender: 'ai',
          content:
            "Thanks for your question! I'm not connected to the school's knowledge base yet, so a staff member will get back to you shortly.",
          createdAt: new Date().toISOString(),
        },
      ])
      setIsTyping(false)
    }, 900)
  }, [])

  if (isLoading) {
    return (
      <Flex h="100vh" align="center" justify="center" bg="#F7F9FB">
        <Spinner color="#5463D6" />
      </Flex>
    )
  }

  if (isError || !school) {
    return (
      <Flex h="100vh" align="center" justify="center" bg="#F7F9FB" px="24px">
        <Box
          bg="white"
          border="1px solid #EBEFF4"
          borderRadius="8px"
          px="32px"
          py="32px"
          textAlign="center"
          maxW="440px"
          w="full"
        >
          <Text fontSize="18px" fontWeight={600} color="#18181D">
            We couldn&apos;t find that school
          </Text>
          <Text fontSize="14px" color="#5C5E6A" mt="8px">
            The school link may be out of date. Head back home and pick a school from the list.
          </Text>
          <RouterLink to="/" style={{ textDecoration: 'none' }}>
            <Box
              as="span"
              display="inline-block"
              mt="20px"
              bg="#5463D6"
              color="white"
              borderRadius="2px"
              px="20px"
              py="10px"
              fontSize="14px"
              fontWeight={600}
            >
              Back to home
            </Box>
          </RouterLink>
        </Box>
      </Flex>
    )
  }

  return (
    <Flex direction="column" h="100vh" bg="#F7F9FB">
      <ChatHeader schoolName={school.name} />
      <ChatMessageList messages={messages} isTyping={isTyping} />
      <ChatInput onSend={handleSend} disabled={isTyping} />
    </Flex>
  )
}
