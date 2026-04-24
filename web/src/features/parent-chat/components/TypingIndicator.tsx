import { Box, Flex, Text } from '@chakra-ui/react'

const DOT_DELAYS = ['0s', '0.15s', '0.3s']

export function TypingIndicator() {
  return (
    <Flex direction="column" align="flex-start">
      <Text fontSize="11px" color="#737685" mb="4px" px="2px">
        AI front desk is typing…
      </Text>
      <Flex bg="#5463D6" borderRadius="2px" px="14px" py="12px" gap="4px" align="center">
        {DOT_DELAYS.map((delay) => (
          <Box
            key={delay}
            w="6px"
            h="6px"
            borderRadius="50%"
            bg="white"
            opacity={0.7}
            style={{ animationDelay: delay }}
            css={{
              animation: 'typingDot 1s infinite',
              '@keyframes typingDot': {
                '0%, 80%, 100%': { opacity: 0.3, transform: 'translateY(0)' },
                '40%': { opacity: 1, transform: 'translateY(-2px)' },
              },
            }}
          />
        ))}
      </Flex>
    </Flex>
  )
}
