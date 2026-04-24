import { Box, Flex, Text, VStack } from '@chakra-ui/react'
import { ExtractedInquiryDto, ExtractionConfidence } from '@brightwheel/shared'

interface HandbookSuccessViewProps {
  inquiries: ExtractedInquiryDto[]
  fileName: string | null
  onReset: () => void
}

const CONFIDENCE_STYLE: Record<
  ExtractionConfidence,
  { bg: string; color: string; label: string }
> = {
  [ExtractionConfidence.High]: { bg: '#E9F8EF', color: '#3BBA6E', label: 'High confidence' },
  [ExtractionConfidence.Medium]: { bg: '#FFF9E5', color: '#896507', label: 'Medium confidence' },
  [ExtractionConfidence.Low]: { bg: '#FFF6F5', color: '#CF193A', label: 'Low confidence' },
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

      {inquiries.length === 0 ? (
        <Box
          bg="white"
          border="1px solid #EBEFF4"
          borderRadius="8px"
          p="24px"
          textAlign="center"
        >
          <Text color="#5C5E6A">
            We could not find any clear Q&amp;A in this document. Try a different handbook or add
            entries manually.
          </Text>
        </Box>
      ) : (
        <VStack gap={3} align="stretch">
          {inquiries.map((inquiry, idx) => {
            const style = CONFIDENCE_STYLE[inquiry.confidence]
            return (
              <Box
                key={idx}
                bg="white"
                border="1px solid #EBEFF4"
                borderRadius="8px"
                p="20px"
              >
                <Flex justify="space-between" align="flex-start" gap={4} mb={2}>
                  <Text fontSize="16px" fontWeight={600} color="#18181D">
                    {inquiry.question}
                  </Text>
                  <Box
                    bg={style.bg}
                    color={style.color}
                    fontSize="12px"
                    fontWeight={600}
                    px="10px"
                    py="4px"
                    borderRadius="100px"
                    whiteSpace="nowrap"
                  >
                    {style.label}
                  </Box>
                </Flex>
                <Text fontSize="14px" color="#18181D" lineHeight={1.5}>
                  {inquiry.answer}
                </Text>
                {inquiry.sourceExcerpt && (
                  <Box
                    mt={3}
                    pt={3}
                    borderTop="1px solid #EBEFF4"
                    fontSize="13px"
                    color="#737685"
                    fontStyle="italic"
                  >
                    “{inquiry.sourceExcerpt}”
                  </Box>
                )}
              </Box>
            )
          })}
        </VStack>
      )}
    </VStack>
  )
}
