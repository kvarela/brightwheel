import { Box, Flex, Grid, GridItem, Text, VStack } from '@chakra-ui/react'

interface Benefit {
  icon: string
  title: string
  description: string
  color: string
  bg: string
}

const BENEFITS: Benefit[] = [
  {
    icon: '🌙',
    title: 'Always Available',
    description:
      'Parents get answers at 2am or 2pm. Your AI front desk never sleeps, never takes lunch, and never puts anyone on hold.',
    color: '#5463D6',
    bg: '#EEF0FC',
  },
  {
    icon: '⚡',
    title: 'Instant Responses',
    description:
      'No more playing phone tag. Parents get clear, helpful answers in under two seconds — improving satisfaction from day one.',
    color: '#29B9BB',
    bg: '#E5F7F7',
  },
  {
    icon: '🔔',
    title: 'Smart Escalation',
    description:
      "When AI confidence falls below your threshold, your staff are notified in real time. No inquiry falls through the cracks.",
    color: '#3BBA6E',
    bg: '#E9F8EF',
  },
  {
    icon: '📚',
    title: 'Built-in Knowledge Base',
    description:
      'Upload your handbook, add FAQs, and watch the AI master your school policies automatically. It learns your program inside and out.',
    color: '#896507',
    bg: '#FFF9E5',
  },
]

export function BenefitsSection() {
  return (
    <Box as="section" bg="white" py={{ base: '64px', md: '96px' }}>
      <Box maxW="1200px" mx="auto" px={{ base: '16px', md: '32px' }}>
        <VStack gap={4} mb={12} textAlign="center">
          <Text
            as="h2"
            fontSize={{ base: '28px', md: '36px' }}
            fontWeight={600}
            color="#1E2549"
            letterSpacing="-0.5px"
            fontFamily='"AvenirNext", "Helvetica Neue", helvetica, arial, sans-serif'
          >
            One AI. All the answers your parents need.
          </Text>
          <Text fontSize={{ base: '16px', md: '18px' }} color="#5C5E6A" maxW="560px" lineHeight={1.6}>
            Give every family the instant, accurate response they deserve — without adding a single
            person to your team.
          </Text>
        </VStack>

        <Grid
          templateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }}
          gap={6}
        >
          {BENEFITS.map((benefit) => (
            <GridItem key={benefit.title}>
              <Flex
                direction="column"
                gap={4}
                p={6}
                bg="white"
                border="1px solid #EBEFF4"
                borderRadius="4px"
                h="full"
                transition="all 0.3s ease"
                _hover={{
                  boxShadow: '0 8px 32px rgba(84,99,214,0.12)',
                  borderColor: '#5463D6',
                  transform: 'translateY(-2px)',
                }}
              >
                <Flex
                  w="48px"
                  h="48px"
                  bg={benefit.bg}
                  borderRadius="8px"
                  align="center"
                  justify="center"
                  fontSize="22px"
                >
                  {benefit.icon}
                </Flex>
                <Text
                  fontSize="18px"
                  fontWeight={600}
                  color="#1E2549"
                  fontFamily='"AvenirNext", "Helvetica Neue", helvetica, arial, sans-serif'
                >
                  {benefit.title}
                </Text>
                <Text fontSize="15px" color="#5C5E6A" lineHeight={1.6}>
                  {benefit.description}
                </Text>
              </Flex>
            </GridItem>
          ))}
        </Grid>
      </Box>
    </Box>
  )
}
