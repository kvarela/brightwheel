import { Box, Flex, Grid, GridItem, Text, VStack } from '@chakra-ui/react'
import { useAuthStore } from '../../../store/authStore'

const SUPPORT_FEATURES = [
  {
    icon: '💬',
    title: 'Live chat support',
    description: 'Reach our team anytime you need help — no waiting on hold.',
  },
  {
    icon: '🚀',
    title: 'Customized onboarding',
    description: "We set up your knowledge base and configure your AI in your first session.",
  },
  {
    icon: '👤',
    title: 'Dedicated account specialists',
    description: 'Enterprise programs get a named specialist who knows your program.',
  },
  {
    icon: '📖',
    title: '24/7 self-service resources',
    description: 'Help articles, walkthrough videos, and a community of directors — all on demand.',
  },
]

export function SupportSection() {
  const openRegister = useAuthStore((state) => state.openRegister)

  return (
    <Box as="section" bg="white" py={{ base: '64px', md: '96px' }}>
      <Box maxW="1200px" mx="auto" px={{ base: '16px', md: '32px' }}>
        <Grid
          templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }}
          gap={{ base: 10, lg: 16 }}
          alignItems="center"
        >
          <GridItem>
            <VStack align="start" gap={6}>
              <Box
                bg="#EEF0FC"
                color="#5463D6"
                px="12px"
                py="6px"
                borderRadius="100px"
                fontSize="13px"
                fontWeight={600}
              >
                Brightwheel support
              </Box>
              <Text
                as="h2"
                fontSize={{ base: '28px', md: '36px' }}
                fontWeight={600}
                color="#1E2549"
                lineHeight={1.2}
                letterSpacing="-0.5px"
                fontFamily='"AvenirNext", "Helvetica Neue", helvetica, arial, sans-serif'
              >
                Partnering for your success — every step of the way
              </Text>
              <Text fontSize={{ base: '15px', md: '17px' }} color="#5C5E6A" lineHeight={1.7}>
                Getting started with AI doesn't have to be complicated. Our team handles the setup,
                so you can focus on what matters most — the children in your care.
              </Text>

              <VStack align="start" gap={4} w="full">
                {SUPPORT_FEATURES.map((feature) => (
                  <Flex key={feature.title} align="flex-start" gap={4}>
                    <Box
                      w="44px"
                      h="44px"
                      bg="#EEF0FC"
                      borderRadius="8px"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      fontSize="20px"
                      flexShrink={0}
                    >
                      {feature.icon}
                    </Box>
                    <Box>
                      <Text fontSize="16px" fontWeight={600} color="#18181D" mb={1}>
                        {feature.title}
                      </Text>
                      <Text fontSize="14px" color="#5C5E6A" lineHeight={1.6}>
                        {feature.description}
                      </Text>
                    </Box>
                  </Flex>
                ))}
              </VStack>
            </VStack>
          </GridItem>

          <GridItem>
            <Box
              bg="linear-gradient(135deg, #1E2549 0%, #2D3A7A 100%)"
              borderRadius="12px"
              p={8}
              position="relative"
              overflow="hidden"
            >
              <Box
                position="absolute"
                top="-40px"
                right="-40px"
                w="200px"
                h="200px"
                bg="rgba(84,99,214,0.15)"
                borderRadius="full"
              />
              <Box
                position="absolute"
                bottom="-60px"
                left="-30px"
                w="240px"
                h="240px"
                bg="rgba(41,185,187,0.1)"
                borderRadius="full"
              />

              <VStack align="start" gap={6} position="relative" zIndex={1}>
                <Text fontSize="22px" fontWeight={700} color="white" lineHeight={1.3}>
                  Ready to transform your parent communication?
                </Text>
                <Text fontSize="15px" color="rgba(255,255,255,0.7)" lineHeight={1.6}>
                  Our onboarding team will have your AI front desk live within one business day.
                </Text>

                <VStack align="start" gap={3}>
                  {[
                    'Free 30-day trial — no credit card required',
                    'White-glove setup included',
                    'Cancel anytime',
                  ].map((item) => (
                    <Flex key={item} align="center" gap={3}>
                      <Box
                        w="20px"
                        h="20px"
                        borderRadius="full"
                        bg="#3BBA6E"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        flexShrink={0}
                      >
                        <Text color="white" fontSize="11px" fontWeight={700}>✓</Text>
                      </Box>
                      <Text fontSize="14px" color="rgba(255,255,255,0.85)">{item}</Text>
                    </Flex>
                  ))}
                </VStack>

                <Box
                  as="button"
                  type="button"
                  onClick={openRegister}
                  display="inline-flex"
                  alignItems="center"
                  gap={2}
                  bg="#5463D6"
                  color="white"
                  borderRadius="2px"
                  px="24px"
                  py="14px"
                  fontSize="15px"
                  fontWeight={600}
                  cursor="pointer"
                  transition="all 0.3s ease-in-out"
                  _hover={{ bg: '#4352c5' }}
                  border="none"
                >
                  Get started free →
                </Box>
              </VStack>
            </Box>
          </GridItem>
        </Grid>
      </Box>
    </Box>
  )
}
