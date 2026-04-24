import { Box, Flex, Text, VStack } from '@chakra-ui/react'

interface HandbookErrorViewProps {
  errorMessage: string
  onReset: () => void
}

export function HandbookErrorView({ errorMessage, onReset }: HandbookErrorViewProps) {
  return (
    <Flex
      direction="column"
      align="center"
      bg="#FFF6F5"
      border="1px solid #F5BEC8"
      borderRadius="8px"
      p="32px"
      textAlign="center"
    >
      <VStack gap={2} maxW="500px">
        <Text fontSize="18px" fontWeight={600} color="#CF193A">
          We couldn’t finish processing your handbook
        </Text>
        <Text fontSize="14px" color="#5C5E6A">
          {errorMessage}
        </Text>
      </VStack>
      <Box
        as="button"
        onClick={onReset}
        mt={5}
        bg="#5463D6"
        color="white"
        border="none"
        borderRadius="2px"
        px="20px"
        py="12px"
        fontSize="14px"
        fontWeight={600}
        cursor="pointer"
        transition="all 0.3s ease-in-out"
        _hover={{ bg: '#4352c5' }}
      >
        Try again
      </Box>
    </Flex>
  )
}
