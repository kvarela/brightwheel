import { useRef, useState, type KeyboardEvent } from 'react'
import { Box, chakra, Flex, Text, Textarea } from '@chakra-ui/react'

interface ChatInputProps {
  onSend: (content: string) => void
  disabled?: boolean
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const trimmed = value.trim()
  const canSend = trimmed.length > 0 && !disabled

  const send = () => {
    if (!canSend) return
    onSend(trimmed)
    setValue('')
    textareaRef.current?.focus()
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <Box bg="white" borderTop="1px solid #EBEFF4" px={{ base: '16px', md: '24px' }} py="16px">
      <Box maxW="720px" mx="auto" w="full">
        <Flex
          align="flex-end"
          gap={2}
          border="1px solid #EBEFF4"
          borderRadius="2px"
          bg="white"
          px="12px"
          py="8px"
          transition="all 0.15s ease"
          _focusWithin={{
            borderColor: '#5463D6',
            boxShadow: '0 0 0 3px rgba(84,99,214,0.15)',
          }}
        >
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about the school…"
            rows={1}
            resize="none"
            border="none"
            boxShadow="none"
            p={0}
            fontSize="14px"
            color="#18181D"
            minH="24px"
            maxH="160px"
            _placeholder={{ color: '#737685' }}
            _focus={{ boxShadow: 'none', outline: 'none' }}
            disabled={disabled}
          />
          <chakra.button
            type="button"
            onClick={send}
            disabled={!canSend}
            aria-label="Send message"
            bg={canSend ? '#5463D6' : '#EBEFF4'}
            color={canSend ? 'white' : '#737685'}
            border="none"
            borderRadius="2px"
            px="16px"
            py="8px"
            fontSize="13px"
            fontWeight={600}
            cursor={canSend ? 'pointer' : 'not-allowed'}
            transition="all 0.2s ease-in-out"
            _hover={canSend ? { bg: '#4352c5' } : undefined}
            flexShrink={0}
          >
            Send
          </chakra.button>
        </Flex>
        <Text fontSize="11px" color="#737685" mt="8px" textAlign="center">
          Press <Box as="span" fontWeight={600}>Enter</Box> to send ·{' '}
          <Box as="span" fontWeight={600}>Shift + Enter</Box> for a new line
        </Text>
      </Box>
    </Box>
  )
}
