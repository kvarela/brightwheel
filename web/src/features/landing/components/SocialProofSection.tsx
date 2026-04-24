import { Box, Flex, HStack, Text } from '@chakra-ui/react'

const BADGES = [
  { label: 'App Store', sub: '★ 4.9' },
  { label: 'Google Play', sub: '★ 4.9' },
  { label: 'Capterra Best', sub: '2026' },
  { label: 'G2 Leader', sub: 'Spring 2026' },
  { label: 'GetApp Best', sub: '2026' },
]

function StarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="#FECC38">
      <path d="M8 1l1.854 3.758L14 5.528l-3 2.923.708 4.131L8 10.5l-3.708 2.082L5 8.451 2 5.528l4.146-.77z" />
    </svg>
  )
}

export function SocialProofSection() {
  return (
    <Box as="section" bg="#F7F9FB" borderTop="1px solid #EBEFF4" borderBottom="1px solid #EBEFF4">
      <Box maxW="1200px" mx="auto" px={{ base: '16px', md: '32px' }} py={{ base: '24px', md: '32px' }}>
        <Flex
          direction={{ base: 'column', md: 'row' }}
          align="center"
          justify="center"
          gap={{ base: 6, md: 10 }}
        >
          <Flex align="center" gap={3}>
            <HStack gap={1}>
              {[1, 2, 3, 4, 5].map((i) => <StarIcon key={i} />)}
            </HStack>
            <Text fontSize="15px" color="#18181D" fontWeight={600}>
              4.9
            </Text>
            <Text fontSize="14px" color="#737685">
              · 10,000+ reviews
            </Text>
          </Flex>

          <Box
            display={{ base: 'none', md: 'block' }}
            w="1px"
            h="32px"
            bg="#EBEFF4"
          />

          <Flex align="center" gap={{ base: 3, md: 5 }} flexWrap="wrap" justify="center">
            {BADGES.map((badge) => (
              <Flex
                key={badge.label}
                align="center"
                gap={2}
                bg="white"
                border="1px solid #EBEFF4"
                borderRadius="4px"
                px={3}
                py={2}
                boxShadow="0 1px 3px rgba(0,0,0,0.04)"
              >
                <Text fontSize="13px" fontWeight={600} color="#18181D">
                  {badge.label}
                </Text>
                <Text fontSize="12px" color="#5463D6" fontWeight={600}>
                  {badge.sub}
                </Text>
              </Flex>
            ))}
          </Flex>
        </Flex>
      </Box>
    </Box>
  )
}
