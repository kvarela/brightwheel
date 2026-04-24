import { Box, Text, VStack } from '@chakra-ui/react'

const CLIENT_LOGOS = [
  'Sunshine Learning Center',
  'Little Explorers Academy',
  'Rainbow Bridge Childcare',
  'Tiny Tots Academy',
  'Happy Hearts Preschool',
  'Willow Tree Learning',
  'Little Stars Academy',
  'Growing Minds Center',
  'Sunrise Childcare',
  'Pebble Creek Preschool',
  'Mountain View Academy',
  'Coastal Kids Center',
]

export function ClientLogosSection() {
  return (
    <Box as="section" bg="#F7F9FB" py={{ base: '48px', md: '64px' }} overflow="hidden">
      <style>{`
        @keyframes scrollLogos {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .logos-track {
          animation: scrollLogos 32s linear infinite;
          display: flex;
          align-items: center;
          gap: 48px;
          width: max-content;
        }
        .logos-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      <VStack gap={8}>
        <VStack gap={2} textAlign="center" px={{ base: '16px', md: '32px' }}>
          <Text fontSize="13px" fontWeight={700} color="#737685" letterSpacing="0.08em" textTransform="uppercase">
            Trusted by leading childcare programs
          </Text>
          <Text
            as="h2"
            fontSize={{ base: '24px', md: '30px' }}
            fontWeight={600}
            color="#1E2549"
            letterSpacing="-0.3px"
            fontFamily='"AvenirNext", "Helvetica Neue", helvetica, arial, sans-serif'
          >
            10,000+ schools already on brightwheel
          </Text>
        </VStack>

        <Box w="full" overflow="hidden" position="relative">
          <Box
            position="absolute"
            left={0}
            top={0}
            bottom={0}
            w="80px"
            zIndex={2}
            background="linear-gradient(to right, #F7F9FB, transparent)"
          />
          <Box
            position="absolute"
            right={0}
            top={0}
            bottom={0}
            w="80px"
            zIndex={2}
            background="linear-gradient(to left, #F7F9FB, transparent)"
          />

          <div className="logos-track">
            {[...CLIENT_LOGOS, ...CLIENT_LOGOS].map((logo, idx) => (
              <Box
                key={idx}
                bg="white"
                border="1px solid #EBEFF4"
                borderRadius="4px"
                px={5}
                py={3}
                whiteSpace="nowrap"
                boxShadow="0 1px 4px rgba(0,0,0,0.06)"
                flexShrink={0}
              >
                <Text
                  fontSize="14px"
                  fontWeight={600}
                  color="#5C5E6A"
                  letterSpacing="-0.2px"
                >
                  {logo}
                </Text>
              </Box>
            ))}
          </div>
        </Box>
      </VStack>
    </Box>
  )
}
