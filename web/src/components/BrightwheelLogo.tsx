import { Flex, Text } from '@chakra-ui/react'

interface BrightwheelLogoProps {
  variant?: 'light' | 'dark'
}

export function BrightwheelLogo({ variant = 'light' }: BrightwheelLogoProps) {
  const textColor = variant === 'light' ? '#FFFFFF' : '#1E2549'

  return (
    <Flex align="center" gap={2}>
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="16" fill="#5463D6" />
        <path
          d="M10.5 7 L10.5 25"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M10.5 13.5 A7 7 0 0 1 10.5 24.5"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
      <Text
        color={textColor}
        fontSize="18px"
        fontWeight={700}
        letterSpacing="-0.3px"
        fontFamily='"AvenirNext", "Helvetica Neue", helvetica, arial, sans-serif'
      >
        brightwheel
      </Text>
    </Flex>
  )
}
