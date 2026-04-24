import { Box, Flex, Grid, GridItem, Text, VStack } from '@chakra-ui/react'

interface ProductFeature {
  eyebrow: string
  title: string
  description: string
  bullets: string[]
  imageContent: React.ReactNode
  imageFirst: boolean
  accentColor: string
}

function MockChatUI() {
  return (
    <Flex
      direction="column"
      gap={3}
      p={6}
      bg="white"
      borderRadius="8px"
      boxShadow="0 8px 32px rgba(0,0,0,0.1)"
    >
      <Flex align="center" gap={2} pb={3} borderBottom="1px solid #EBEFF4">
        <Box w="8px" h="8px" borderRadius="full" bg="#3BBA6E" />
        <Text fontSize="13px" fontWeight={600} color="#18181D">
          AI Front Desk · Sunshine Learning
        </Text>
      </Flex>
      {[
        { role: 'ai', text: 'Hello! How can I help you today?' },
        { role: 'parent', text: 'What are your hours?' },
        {
          role: 'ai',
          text: "We're open Monday–Friday, 7:30 AM to 6:00 PM. Drop-off is 7:30–9:00 AM and pick-up is 4:00–6:00 PM.",
        },
      ].map((msg, i) => (
        <Box
          key={i}
          bg={msg.role === 'ai' ? '#5463D6' : '#F7F9FB'}
          color={msg.role === 'ai' ? 'white' : '#18181D'}
          borderRadius="2px"
          p={3}
          maxW="85%"
          alignSelf={msg.role === 'ai' ? 'flex-start' : 'flex-end'}
        >
          <Text fontSize="13px" lineHeight={1.5}>
            {msg.text}
          </Text>
        </Box>
      ))}
      <Flex gap={2} mt={2}>
        <Box flex={1} border="1px solid #EBEFF4" borderRadius="2px" px={3} py={2}>
          <Text fontSize="12px" color="#737685">
            Type your question...
          </Text>
        </Box>
        <Box bg="#5463D6" borderRadius="2px" px={3} py={2} cursor="pointer">
          <Text fontSize="12px" color="white" fontWeight={600}>
            Send
          </Text>
        </Box>
      </Flex>
    </Flex>
  )
}

function MockKnowledgeUI() {
  return (
    <Flex
      direction="column"
      gap={3}
      p={6}
      bg="white"
      borderRadius="8px"
      boxShadow="0 8px 32px rgba(0,0,0,0.1)"
    >
      <Text
        fontSize="14px"
        fontWeight={700}
        color="#1E2549"
        pb={2}
        borderBottom="1px solid #EBEFF4"
      >
        Knowledge Base · 24 entries
      </Text>
      {[
        { q: 'What are drop-off hours?', source: 'Handbook' },
        { q: 'What is the illness policy?', source: 'Manual entry' },
        { q: 'How do I pay tuition?', source: 'Handbook' },
        { q: 'What should my child bring?', source: 'Manual entry' },
      ].map((item, i) => (
        <Flex key={i} align="center" justify="space-between" p={3} bg="#F7F9FB" borderRadius="4px">
          <Text fontSize="13px" color="#18181D" fontWeight={500}>
            {item.q}
          </Text>
          <Box
            bg={item.source === 'Handbook' ? '#EEF0FC' : '#E5F7F7'}
            borderRadius="100px"
            px={2}
            py={1}
          >
            <Text
              fontSize="11px"
              color={item.source === 'Handbook' ? '#5463D6' : '#29B9BB'}
              fontWeight={600}
            >
              {item.source}
            </Text>
          </Box>
        </Flex>
      ))}
      <Flex
        align="center"
        justify="center"
        gap={2}
        border="1px dashed #5463D6"
        borderRadius="4px"
        py={3}
        cursor="pointer"
      >
        <Text fontSize="13px" color="#5463D6" fontWeight={600}>
          + Upload handbook PDF
        </Text>
      </Flex>
    </Flex>
  )
}

function MockEscalationUI() {
  return (
    <Flex
      direction="column"
      gap={3}
      p={6}
      bg="white"
      borderRadius="8px"
      boxShadow="0 8px 32px rgba(0,0,0,0.1)"
    >
      <Text
        fontSize="14px"
        fontWeight={700}
        color="#1E2549"
        pb={2}
        borderBottom="1px solid #EBEFF4"
      >
        Operator Inbox
      </Text>
      {[
        {
          name: 'Emma Rodriguez',
          issue: 'Questions about IEP accommodation',
          state: 'Needs attention',
          stateColor: '#CF193A',
          stateBg: '#FFF6F5',
        },
        {
          name: 'James Kim',
          issue: 'Tuition payment dispute',
          state: 'In progress',
          stateColor: '#896507',
          stateBg: '#FFF9E5',
        },
        {
          name: 'Sofia Patel',
          issue: 'Enrollment for next fall',
          state: 'Resolved',
          stateColor: '#3BBA6E',
          stateBg: '#E9F8EF',
        },
      ].map((item, i) => (
        <Flex
          key={i}
          align="center"
          justify="space-between"
          p={3}
          border="1px solid #EBEFF4"
          borderRadius="4px"
        >
          <Box>
            <Text fontSize="13px" fontWeight={600} color="#18181D">
              {item.name}
            </Text>
            <Text fontSize="12px" color="#737685" mt={0.5}>
              {item.issue}
            </Text>
          </Box>
          <Box bg={item.stateBg} borderRadius="100px" px={2} py={1} whiteSpace="nowrap">
            <Text fontSize="11px" color={item.stateColor} fontWeight={600}>
              {item.state}
            </Text>
          </Box>
        </Flex>
      ))}
    </Flex>
  )
}

const FEATURES: ProductFeature[] = [
  {
    eyebrow: 'AI-Powered Chat',
    title: 'Answer every parent question, even at 2am',
    description:
      'Your AI front desk handles the questions your staff fields dozens of times each day — hours, tuition, enrollment, illness policies, and more. Parents get instant answers. Your team gets their time back.',
    bullets: [
      'Responds in under 2 seconds, 24 hours a day',
      'Understands nuanced questions, not just keywords',
      'Supports every parent from inquiry to enrollment',
    ],
    imageContent: <MockChatUI />,
    imageFirst: false,
    accentColor: '#5463D6',
  },
  {
    eyebrow: 'Knowledge Base',
    title: 'Build your knowledge base in minutes',
    description:
      'Upload your parent handbook, add FAQs manually, or let our AI extract key policies from any document. The more you add, the smarter and more accurate your AI front desk becomes.',
    bullets: [
      'AI extracts Q&A pairs from uploaded PDFs automatically',
      '12 base inquiries pre-configured for every school',
      'Instantly updates when your policies change',
    ],
    imageContent: <MockKnowledgeUI />,
    imageFirst: true,
    accentColor: '#29B9BB',
  },
  {
    eyebrow: 'Escalation Inbox',
    title: 'Never let an urgent inquiry slip through',
    description:
      "When the AI isn't confident enough to answer — or when a parent needs a real human — your staff get notified instantly. Manage every escalated conversation from one clean inbox.",
    bullets: [
      'Configurable confidence threshold per school',
      'Real-time push notifications to all active staff',
      'Resolved conversations feed back into the knowledge base',
    ],
    imageContent: <MockEscalationUI />,
    imageFirst: false,
    accentColor: '#3BBA6E',
  },
]

export function ProductDetailSection() {
  return (
    <Box as="section" bg="white" py={{ base: '64px', md: '96px' }}>
      <Box maxW="1200px" mx="auto" px={{ base: '16px', md: '32px' }}>
        <VStack gap={{ base: '80px', md: '120px' }}>
          {FEATURES.map((feature) => (
            <Grid
              key={feature.title}
              templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }}
              gap={{ base: 10, lg: 16 }}
              alignItems="center"
            >
              <GridItem order={{ base: 2, lg: feature.imageFirst ? 1 : 2 }}>
                <Box
                  bg="linear-gradient(135deg, #EEF0FC 0%, #E5F7F7 100%)"
                  borderRadius="12px"
                  p={{ base: 6, md: 8 }}
                >
                  {feature.imageContent}
                </Box>
              </GridItem>

              <GridItem order={{ base: 1, lg: feature.imageFirst ? 2 : 1 }}>
                <VStack align="start" gap={6}>
                  <Box
                    bg={
                      feature.accentColor === '#5463D6'
                        ? '#EEF0FC'
                        : feature.accentColor === '#29B9BB'
                          ? '#E5F7F7'
                          : '#E9F8EF'
                    }
                    color={feature.accentColor}
                    px="12px"
                    py="6px"
                    borderRadius="100px"
                    fontSize="13px"
                    fontWeight={600}
                  >
                    {feature.eyebrow}
                  </Box>
                  <Text
                    as="h2"
                    fontSize={{ base: '26px', md: '34px' }}
                    fontWeight={600}
                    color="#1E2549"
                    lineHeight={1.2}
                    letterSpacing="-0.5px"
                    fontFamily='"AvenirNext", "Helvetica Neue", helvetica, arial, sans-serif'
                  >
                    {feature.title}
                  </Text>
                  <Text fontSize={{ base: '15px', md: '17px' }} color="#5C5E6A" lineHeight={1.7}>
                    {feature.description}
                  </Text>
                  <VStack align="start" gap={3}>
                    {feature.bullets.map((bullet) => (
                      <Flex key={bullet} align="flex-start" gap={3}>
                        <Box
                          w="20px"
                          h="20px"
                          borderRadius="full"
                          bg={feature.accentColor}
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          flexShrink={0}
                          mt="1px"
                        >
                          <Text color="white" fontSize="11px" fontWeight={700}>
                            ✓
                          </Text>
                        </Box>
                        <Text fontSize="15px" color="#18181D" lineHeight={1.5}>
                          {bullet}
                        </Text>
                      </Flex>
                    ))}
                  </VStack>
                </VStack>
              </GridItem>
            </Grid>
          ))}
        </VStack>
      </Box>
    </Box>
  )
}
