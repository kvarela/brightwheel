import { Box, Flex, Text } from '@chakra-ui/react'

interface LoaderProps {
  text?: string
  size?: 'sm' | 'md'
  /** Render dots + text in a horizontal row (use inside buttons) */
  inline?: boolean
}

const COLORS = ['#5463D6', '#29B9BB', '#3BBA6E', '#FECC38']

export function Loader({ text, size = 'md', inline = false }: LoaderProps) {
  const isSmall = size === 'sm'
  const dotSize = isSmall ? '7px' : '12px'
  const animName = isSmall ? 'bw-bounce-sm' : 'bw-bounce-md'

  const dots = (
    <Flex align="flex-end" gap={isSmall ? '4px' : '6px'}>
      {COLORS.map((color, i) => (
        <Box
          key={i}
          w={dotSize}
          h={dotSize}
          borderRadius="full"
          bg={color}
          flexShrink={0}
          style={{
            animation: `${animName} 1.2s ease-in-out infinite`,
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
    </Flex>
  )

  return (
    <>
      <style>{`
        @keyframes bw-bounce-md {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-10px); }
        }
        @keyframes bw-bounce-sm {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }
      `}</style>
      {inline ? (
        <Flex align="center" gap="8px" display="inline-flex">
          {dots}
          {text && (
            <Text fontSize={isSmall ? '14px' : '16px'} fontWeight="600" color="currentColor">
              {text}
            </Text>
          )}
        </Flex>
      ) : (
        <Flex direction="column" align="center" justify="center" gap="3">
          {dots}
          {text && (
            <Text fontSize="14px" fontWeight="500" color="#5C5E6A"
              fontFamily='"AvenirNext", "Helvetica Neue", helvetica, arial, sans-serif'
            >
              {text}
            </Text>
          )}
        </Flex>
      )}
    </>
  )
}
