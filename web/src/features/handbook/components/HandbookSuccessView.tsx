import { Box, Flex, Text, VStack } from '@chakra-ui/react'
import { ExtractedInquiryDto } from '@brightwheel/shared'
import { HandbookInquiriesList } from './HandbookInquiriesList'

interface HandbookSuccessViewProps {
  inquiries: ExtractedInquiryDto[]
  fileName: string | null
  onReset: () => void
}

export function HandbookSuccessView({
  inquiries,
  fileName,
  onReset,
}: HandbookSuccessViewProps) {
  return (
    <VStack gap={6} align="stretch" w="full">
      <Flex
        direction={{ base: 'column', md: 'row' }}
        align={{ base: 'flex-start', md: 'center' }}
        justify="space-between"
        bg="#E9F8EF"
        borderRadius="8px"
        p="20px"
        gap={4}
      >
        <Box>
          <Text fontSize="18px" fontWeight={600} color="#1E2549">
            {inquiries.length} inquiries extracted from your handbook
          </Text>
          <Text fontSize="14px" color="#5C5E6A" mt={1}>
            {fileName
              ? `Saved to your knowledge base from ${fileName}.`
              : 'Saved to your knowledge base.'}
          </Text>
        </Box>
        <Box
          as="button"
          onClick={onReset}
          bg="white"
          color="#5463D6"
          border="1px solid #5463D6"
          borderRadius="2px"
          px="20px"
          py="10px"
          fontSize="14px"
          fontWeight={600}
          cursor="pointer"
          transition="all 0.3s ease-in-out"
          _hover={{ bg: '#F7F9FB' }}
        >
          Upload another file
        </Box>
      </Flex>

      <HandbookInquiriesList inquiries={inquiries} />
    </VStack>
  )
}
