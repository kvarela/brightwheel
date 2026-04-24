import { useCallback, useEffect, useRef, useState } from 'react'
import { Box, Flex, Spinner, Text } from '@chakra-ui/react'
import { Link as RouterLink, useParams } from 'react-router-dom'
import { MessageRole } from '@brightwheel/shared'
import type { ChatMessageDto, StaffReplyEventDto } from '@brightwheel/shared'
import { useSchool } from '../../school/api/useSchool'
import type { ParentChatMessage } from '../types/ParentChatMessage'
import { ChatHeader } from '../components/ChatHeader'
import { ChatMessageList } from '../components/ChatMessageList'
import { ChatInput } from '../components/ChatInput'
import { useCreateSession } from '../api/useCreateSession'
import { useSendMessage } from '../api/useSendMessage'
import { useParentSocket } from '../../../hooks/useParentSocket'

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

function messageFromDto(dto: ChatMessageDto): ParentChatMessage {
  const sender: ParentChatMessage['sender'] =
    dto.role === MessageRole.Parent
      ? 'parent'
      : dto.role === MessageRole.Staff
        ? 'staff'
        : 'ai'
  return {
    id: dto.id,
    content: dto.content,
    sender,
    createdAt: dto.createdAt,
  }
}

export function ParentChatPage() {
  const { schoolId } = useParams<{ schoolId: string }>()
  const { data: school, isLoading, isError } = useSchool(schoolId)

  const [messages, setMessages] = useState<ParentChatMessage[]>([])
  const [sessionToken, setSessionToken] = useState<string | null>(null)
  const [errorText, setErrorText] = useState<string | null>(null)

  const handleStaffReply = useCallback((event: StaffReplyEventDto) => {
    const msg = messageFromDto(event.message)
    setMessages((prev) => {
      if (prev.some((m) => m.id === msg.id)) return prev
      return [...prev, msg]
    })
  }, [])

  useParentSocket({ sessionToken, onStaffReply: handleStaffReply })

  const createSession = useCreateSession()
  const sendMessage = useSendMessage()
  const sessionPromiseRef = useRef<Promise<string> | null>(null)

  useEffect(() => {
    if (!school) return
    setMessages((prev) => (prev.length === 0 ? [buildWelcomeMessage(school.name)] : prev))
  }, [school])

  const ensureSession = useCallback(async (): Promise<string> => {
    if (sessionToken) return sessionToken
    if (sessionPromiseRef.current) return sessionPromiseRef.current
    if (!schoolId) throw new Error('Missing schoolId')

    const promise = createSession
      .mutateAsync({ schoolId })
      .then((res) => {
        setSessionToken(res.sessionToken)
        return res.sessionToken
      })
      .finally(() => {
        sessionPromiseRef.current = null
      })

    sessionPromiseRef.current = promise
    return promise
  }, [createSession, schoolId, sessionToken])

  const handleSend = useCallback(
    async (content: string) => {
      setErrorText(null)
      const optimisticId = createMessageId()
      const parentMessage: ParentChatMessage = {
        id: optimisticId,
        sender: 'parent',
        content,
        createdAt: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, parentMessage])

      try {
        const token = await ensureSession()
        const result = await sendMessage.mutateAsync({
          sessionToken: token,
          content,
        })
        setMessages((prev) => [
          ...prev.filter((m) => m.id !== optimisticId),
          messageFromDto(result.parentMessage),
          messageFromDto(result.aiMessage),
        ])
      } catch (err) {
        setErrorText(
          err instanceof Error
            ? err.message
            : 'Something went wrong sending your message.',
        )
      }
    },
    [ensureSession, sendMessage],
  )

  if (isLoading) {
    return (
      <Flex minH="60vh" align="center" justify="center" bg="#F7F9FB">
        <Spinner color="#5463D6" />
      </Flex>
    )
  }

  if (isError || !school) {
    return (
      <Flex minH="60vh" align="center" justify="center" bg="#F7F9FB" px="24px">
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

  const isTyping = sendMessage.isPending || createSession.isPending

  return (
    <Flex direction="column" h="calc(100vh - 72px)" minH="520px" bg="#F7F9FB">
      <ChatHeader schoolName={school.name} />
      <ChatMessageList messages={messages} isTyping={isTyping} />
      {errorText && (
        <Box bg="#FFF6F5" borderTop="1px solid #EBEFF4" px="24px" py="8px">
          <Text fontSize="12px" color="#CF193A" textAlign="center">
            {errorText}
          </Text>
        </Box>
      )}
      <ChatInput onSend={handleSend} disabled={isTyping} />
    </Flex>
  )
}
