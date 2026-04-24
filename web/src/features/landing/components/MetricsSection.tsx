import { Box, Flex, Grid, GridItem, Text, VStack } from '@chakra-ui/react'

interface Metric {
  value: string
  label: string
  description: string
}

const METRICS: Metric[] = [
  {
    value: '24/7',
    label: 'Always available',
    description: 'Your AI front desk never closes',
  },
  {
    value: '90%',
    label: 'Queries answered automatically',
    description: 'Without human intervention',
  },
  {
    value: '<2s',
    label: 'Average response time',
    description: 'Parents get answers instantly',
  },
  {
    value: '4.9★',
    label: 'Parent satisfaction',
    description: 'Across 10,000+ programs',
  },
]

export function MetricsSection() {
  return (
    <Box as="section" bg="#1E2549" py={{ base: '64px', md: '96px' }}>
      <Box maxW="1200px" mx="auto" px={{ base: '16px', md: '32px' }}>
        <VStack gap={3} mb={14} textAlign="center">
          <Text
            as="h2"
            fontSize={{ base: '28px', md: '36px' }}
            fontWeight={600}
            color="white"
            letterSpacing="-0.5px"
            fontFamily='"AvenirNext", "Helvetica Neue", helvetica, arial, sans-serif'
          >
            Built for programs that never stop
          </Text>
          <Text fontSize={{ base: '15px', md: '17px' }} color="rgba(255,255,255,0.6)" maxW="440px" lineHeight={1.6}>
            Real results from childcare centers using brightwheel AI every day.
          </Text>
        </VStack>

        <Grid
          templateColumns={{ base: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }}
          gap={{ base: 6, md: 0 }}
        >
          {METRICS.map((metric, idx) => (
            <GridItem key={metric.value}>
              <Flex
                direction="column"
                align="center"
                textAlign="center"
                gap={2}
                px={{ base: 4, md: 8 }}
                py={{ base: 6, md: 0 }}
                borderRight={{
                  base: 'none',
                  lg: idx < METRICS.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none',
                }}
              >
                <Text
                  fontSize={{ base: '48px', md: '64px' }}
                  fontWeight={700}
                  color="#5463D6"
                  lineHeight={1}
                  letterSpacing="-2px"
                  fontFamily='"AvenirNext", "Helvetica Neue", helvetica, arial, sans-serif'
                >
                  {metric.value}
                </Text>
                <Text
                  fontSize={{ base: '15px', md: '17px' }}
                  fontWeight={600}
                  color="white"
                  lineHeight={1.3}
                >
                  {metric.label}
                </Text>
                <Text fontSize="13px" color="rgba(255,255,255,0.5)">
                  {metric.description}
                </Text>
              </Flex>
            </GridItem>
          ))}
        </Grid>
      </Box>
    </Box>
  )
}
