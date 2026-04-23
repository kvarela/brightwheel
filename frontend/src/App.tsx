import { Box, Heading, Text } from '@chakra-ui/react'

export function App() {
  return (
    <Box
      minH="100vh"
      bg="#F7F9FB"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Box textAlign="center" p={8}>
        <Heading
          as="h1"
          fontSize="36px"
          fontWeight={600}
          color="#1E2549"
          fontFamily='"AvenirNext", "Helvetica Neue", helvetica, arial, sans-serif'
        >
          Brightwheel AI Front Desk
        </Heading>
        <Text
          mt={4}
          fontSize="18px"
          color="#5C5E6A"
          fontFamily='"AvenirNext", "Helvetica Neue", helvetica, arial, sans-serif'
        >
          AI-powered 24/7 parent inquiry system
        </Text>
      </Box>
    </Box>
  )
}
