import { Box, Flex, Grid, GridItem, Text, VStack } from '@chakra-ui/react'

interface Testimonial {
  quote: string
  name: string
  title: string
  school: string
  location: string
  initials: string
  avatarBg: string
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Brightwheel AI has completely transformed how we handle parent inquiries. We used to miss calls all the time — now every question gets answered instantly, even on weekends. Our families love it.",
    name: 'Audra Thompson',
    title: 'Executive Director',
    school: 'Sunshine Learning Center',
    location: 'Austin, TX',
    initials: 'AT',
    avatarBg: '#5463D6',
  },
  {
    quote:
      "Our families love getting immediate answers. The AI knows our policies better than some new staff members! The escalation feature means we never miss something truly important.",
    name: 'Marcus Johnson',
    title: 'Program Administrator',
    school: 'Little Explorers Academy',
    location: 'Portland, OR',
    initials: 'MJ',
    avatarBg: '#29B9BB',
  },
  {
    quote:
      "The escalation feature is brilliant. When a parent has a real concern, we get notified immediately and can jump in. It's the perfect balance of automation and human touch.",
    name: 'Jennifer Liu',
    title: 'Executive Director',
    school: 'Bright Futures Preschool',
    location: 'Chicago, IL',
    initials: 'JL',
    avatarBg: '#3BBA6E',
  },
]

function QuoteIcon() {
  return (
    <svg width="32" height="24" viewBox="0 0 32 24" fill="none">
      <path
        d="M0 24V14.4C0 6.4 4.8 1.6 14.4 0l1.6 2.4C10.4 3.6 7.6 6.4 7.2 10.4H12V24H0zm18 0V14.4C18 6.4 22.8 1.6 32.4 0L34 2.4C28.4 3.6 25.6 6.4 25.2 10.4H30V24H18z"
        fill="#5463D6"
        opacity="0.15"
      />
    </svg>
  )
}

export function TestimonialsSection() {
  return (
    <Box as="section" bg="#F7F9FB" py={{ base: '64px', md: '96px' }}>
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
            What childcare leaders are saying
          </Text>
          <Text fontSize={{ base: '16px', md: '18px' }} color="#5C5E6A" maxW="480px" lineHeight={1.6}>
            Join thousands of directors and administrators who've transformed their parent communication.
          </Text>
        </VStack>

        <Grid
          templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }}
          gap={6}
        >
          {TESTIMONIALS.map((testimonial) => (
            <GridItem key={testimonial.name}>
              <Flex
                direction="column"
                gap={6}
                p={8}
                bg="white"
                border="1px solid #EBEFF4"
                borderRadius="4px"
                h="full"
                boxShadow="0 2px 12px rgba(30,37,73,0.06)"
                position="relative"
                transition="all 0.3s ease"
                _hover={{ boxShadow: '0 8px 32px rgba(84,99,214,0.12)', borderColor: '#5463D6' }}
              >
                <Box position="absolute" top={6} right={6}>
                  <QuoteIcon />
                </Box>

                <Text
                  fontSize="16px"
                  color="#18181D"
                  lineHeight={1.7}
                  fontStyle="italic"
                  flex={1}
                >
                  "{testimonial.quote}"
                </Text>

                <Flex align="center" gap={3}>
                  <Flex
                    w="44px"
                    h="44px"
                    borderRadius="full"
                    bg={testimonial.avatarBg}
                    align="center"
                    justify="center"
                    flexShrink={0}
                  >
                    <Text fontSize="15px" fontWeight={700} color="white">
                      {testimonial.initials}
                    </Text>
                  </Flex>
                  <VStack align="start" gap={0}>
                    <Text fontSize="15px" fontWeight={700} color="#18181D">
                      {testimonial.name}
                    </Text>
                    <Text fontSize="13px" color="#737685">
                      {testimonial.title} · {testimonial.school}
                    </Text>
                    <Text fontSize="12px" color="#ADADB8">
                      {testimonial.location}
                    </Text>
                  </VStack>
                </Flex>
              </Flex>
            </GridItem>
          ))}
        </Grid>
      </Box>
    </Box>
  )
}
