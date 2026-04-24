import { useEffect, useState } from 'react'
import { Box, Flex, Text, VStack } from '@chakra-ui/react'
import { HandbookUploadPhase } from '../types/handbookUploadPhase'

interface HandbookProcessingAnimationProps {
  phase: HandbookUploadPhase
  uploadProgress: number
  fileName: string | null
}

const PROCESSING_MESSAGES = [
  'Reading your handbook cover to cover…',
  'Highlighting the questions parents ask most…',
  'Writing friendly answers for each one…',
  'Double-checking the details with Claude…',
  'Filing everything into your knowledge base…',
]

const keyframes = `
@keyframes brightwheelFloat {
  0%   { transform: translateY(0px) rotate(-4deg); }
  50%  { transform: translateY(-14px) rotate(4deg); }
  100% { transform: translateY(0px) rotate(-4deg); }
}
@keyframes brightwheelFlip {
  0%   { transform: rotateY(0deg); }
  50%  { transform: rotateY(180deg); }
  100% { transform: rotateY(360deg); }
}
@keyframes brightwheelSparkle {
  0%, 100% { opacity: 0.25; transform: scale(0.8); }
  50%      { opacity: 1;    transform: scale(1.1); }
}
@keyframes brightwheelProgress {
  0%   { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
}
`

const SPARKLE_POSITIONS = [
  { top: '8%', left: '12%', delay: '0s' },
  { top: '18%', left: '82%', delay: '0.4s' },
  { top: '72%', left: '10%', delay: '0.8s' },
  { top: '84%', left: '84%', delay: '1.2s' },
  { top: '46%', left: '92%', delay: '1.6s' },
  { top: '50%', left: '4%', delay: '2.0s' },
]

export function HandbookProcessingAnimation({
  phase,
  uploadProgress,
  fileName,
}: HandbookProcessingAnimationProps) {
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    if (phase !== 'processing') return
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % PROCESSING_MESSAGES.length)
    }, 2800)
    return () => clearInterval(interval)
  }, [phase])

  const headline =
    phase === 'requesting-url'
      ? 'Getting things ready…'
      : phase === 'uploading'
        ? 'Sending your handbook safely to our servers…'
        : phase === 'processing'
          ? PROCESSING_MESSAGES[messageIndex]
          : 'Working…'

  const progressLabel =
    phase === 'uploading' ? `Uploading · ${uploadProgress}%` : 'Extracting inquiries · this can take up to a minute'

  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      minH="560px"
      w="full"
      position="relative"
      bg="linear-gradient(135deg, #EEF0FC 0%, #E8F5F5 100%)"
      borderRadius="16px"
      overflow="hidden"
      px={{ base: '24px', md: '48px' }}
      py={{ base: '48px', md: '72px' }}
    >
      <style>{keyframes}</style>

      {SPARKLE_POSITIONS.map((pos, idx) => (
        <Box
          key={idx}
          position="absolute"
          top={pos.top}
          left={pos.left}
          w="10px"
          h="10px"
          borderRadius="50%"
          bg="#29B9BB"
          boxShadow="0 0 12px rgba(41,185,187,0.6)"
          css={{
            animation: `brightwheelSparkle 2.4s ease-in-out ${pos.delay} infinite`,
          }}
          aria-hidden
        />
      ))}

      <Box
        position="relative"
        w="160px"
        h="200px"
        mb="32px"
        css={{ animation: 'brightwheelFloat 3.6s ease-in-out infinite' }}
        aria-hidden
      >
        <Box
          position="absolute"
          inset={0}
          bg="white"
          borderRadius="6px"
          boxShadow="0 20px 40px rgba(30,37,73,0.18)"
          css={{
            transformStyle: 'preserve-3d',
            animation: 'brightwheelFlip 2.6s ease-in-out infinite',
          }}
        >
          <Flex
            direction="column"
            h="full"
            p="16px"
            gap="8px"
            bg="linear-gradient(160deg, #FFFFFF 0%, #F7F9FB 100%)"
            borderRadius="6px"
            borderLeft="6px solid #5463D6"
          >
            <Box h="10px" w="60%" bg="#5463D6" borderRadius="2px" opacity={0.9} />
            <Box h="6px" w="88%" bg="#EBEFF4" borderRadius="2px" />
            <Box h="6px" w="76%" bg="#EBEFF4" borderRadius="2px" />
            <Box h="6px" w="82%" bg="#EBEFF4" borderRadius="2px" />
            <Box h="6px" w="66%" bg="#EBEFF4" borderRadius="2px" />
            <Box h="6px" w="90%" bg="#EBEFF4" borderRadius="2px" />
            <Box mt="auto" h="8px" w="40%" bg="#29B9BB" borderRadius="2px" />
          </Flex>
        </Box>
      </Box>

      <VStack gap={2} textAlign="center" maxW="520px" zIndex={1}>
        <Text
          as="h2"
          fontSize={{ base: '22px', md: '26px' }}
          fontWeight={600}
          color="#1E2549"
        >
          {headline}
        </Text>
        {fileName && (
          <Text fontSize="14px" color="#5C5E6A">
            {fileName}
          </Text>
        )}
      </VStack>

      <Box
        mt="36px"
        w="full"
        maxW="420px"
        h="8px"
        borderRadius="100px"
        bg="rgba(84,99,214,0.15)"
        overflow="hidden"
        zIndex={1}
      >
        {phase === 'uploading' ? (
          <Box
            h="full"
            w={`${uploadProgress}%`}
            bg="#5463D6"
            borderRadius="100px"
            transition="width 0.3s ease"
          />
        ) : (
          <Box
            h="full"
            w="full"
            borderRadius="100px"
            bg="linear-gradient(90deg, #5463D6 0%, #29B9BB 50%, #5463D6 100%)"
            backgroundSize="200% 100%"
            css={{ animation: 'brightwheelProgress 2.2s linear infinite' }}
          />
        )}
      </Box>

      <Text mt="12px" fontSize="12px" color="#737685" zIndex={1}>
        {progressLabel}
      </Text>
    </Flex>
  )
}
