import { Box, Flex, Spinner, Text, VStack } from '@chakra-ui/react'
import { ArrowLeft } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { useHandbookUploadDetail } from '../hooks/useHandbookUploadDetail'
import { HandbookInquiriesList } from '../components/HandbookInquiriesList'

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function HandbookUploadDetailPage() {
  const navigate = useNavigate()
  const { handbookUploadId } = useParams<{ handbookUploadId: string }>()
  const { data: detail, isLoading, isError, error } = useHandbookUploadDetail(handbookUploadId)

  return (
    <Box
      bg="#F7F9FB"
      minHeight="100vh"
      fontFamily='"AvenirNext", "Helvetica Neue", helvetica, arial, sans-serif'
    >
      <Box
        as="header"
        bg="white"
        borderBottom="1px solid #EBEFF4"
        px={{ base: '16px', md: '40px' }}
        height="60px"
        display="flex"
        alignItems="center"
        gap="12px"
      >
        <Box
          as="button"
          display="flex"
          alignItems="center"
          justifyContent="center"
          width="32px"
          height="32px"
          borderRadius="2px"
          border="none"
          bg="transparent"
          cursor="pointer"
          color="#5C5E6A"
          _hover={{ bg: '#F7F9FB', color: '#5463D6' }}
          transition="all 0.2s"
          onClick={() => navigate('/dashboard')}
          title="Back to dashboard"
        >
          <ArrowLeft size={18} />
        </Box>
        <Box width="1px" height="18px" bg="#EBEFF4" flexShrink={0} />
        <Text
          fontSize="18px"
          fontWeight={600}
          color="#1E2549"
          fontFamily='"AvenirNext", "Helvetica Neue", helvetica, arial, sans-serif'
        >
          Handbook Upload
        </Text>
      </Box>

      <Box py={{ base: '32px', md: '56px' }}>
        <Box maxW="880px" mx="auto" px={{ base: '16px', md: '32px' }}>
          {isLoading && (
            <Flex align="center" gap={2} color="#737685">
              <Spinner size="sm" color="#5463D6" />
              <Text fontSize="14px">Loading handbook…</Text>
            </Flex>
          )}

          {isError && (
            <Box
              bg="#FFF6F5"
              border="1px solid #F7C4CC"
              borderRadius="8px"
              p="20px"
            >
              <Text color="#CF193A" fontWeight={600}>
                Failed to load handbook upload.
              </Text>
              <Text color="#5C5E6A" fontSize="14px" mt={1}>
                {(error as Error | null)?.message ?? 'Please try again.'}
              </Text>
            </Box>
          )}

          {!isLoading && !isError && detail && (
            <VStack gap={6} align="stretch" w="full">
              <VStack gap={2} align="flex-start">
                <Text
                  as="h1"
                  fontSize={{ base: '28px', md: '36px' }}
                  fontWeight={600}
                  color="#1E2549"
                  letterSpacing="-0.5px"
                >
                  {detail.fileName}
                </Text>
                <Text fontSize="14px" color="#5C5E6A">
                  Uploaded by {detail.uploadedBy.fullName} on {formatDate(detail.createdAt)} ·{' '}
                  {detail.inquiries.length} inquiries extracted
                </Text>
              </VStack>

              <HandbookInquiriesList inquiries={detail.inquiries} />
            </VStack>
          )}
        </Box>
      </Box>
    </Box>
  )
}
