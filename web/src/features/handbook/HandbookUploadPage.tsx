import { Box, Text, VStack } from '@chakra-ui/react'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { HandbookDropzone } from './components/HandbookDropzone'
import { HandbookProcessingAnimation } from './components/HandbookProcessingAnimation'
import { HandbookSuccessView } from './components/HandbookSuccessView'
import { HandbookErrorView } from './components/HandbookErrorView'
import { useHandbookUpload } from './hooks/useHandbookUpload'

export function HandbookUploadPage() {
  const navigate = useNavigate()
  const {
    phase,
    uploadProgress,
    errorMessage,
    inquiries,
    fileName,
    uploadHandbook,
    reset,
  } = useHandbookUpload()

  const isWorking =
    phase === 'requesting-url' || phase === 'uploading' || phase === 'processing'

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
          Handbook Uploads
        </Text>
      </Box>

      <Box py={{ base: '32px', md: '56px' }}>
        <Box maxW="880px" mx="auto" px={{ base: '16px', md: '32px' }}>
        <VStack gap={2} align="flex-start" mb="32px">
          <Text
            as="h1"
            fontSize={{ base: '32px', md: '40px' }}
            fontWeight={600}
            color="#1E2549"
            letterSpacing="-0.5px"
          >
            Upload your handbook
          </Text>
          <Text fontSize="16px" color="#5C5E6A" maxW="640px">
            We’ll read the whole thing, pull out the questions parents actually ask, and draft
            answers sourced straight from your document. Review everything before it goes live.
          </Text>
        </VStack>

        {phase === 'idle' && <HandbookDropzone onFileSelected={uploadHandbook} />}

        {isWorking && (
          <HandbookProcessingAnimation
            phase={phase}
            uploadProgress={uploadProgress}
            fileName={fileName}
          />
        )}

        {phase === 'complete' && (
          <HandbookSuccessView
            inquiries={inquiries}
            fileName={fileName}
            onReset={reset}
          />
        )}

        {phase === 'error' && (
          <HandbookErrorView
            errorMessage={errorMessage ?? 'Something went wrong.'}
            onReset={reset}
          />
        )}
        </Box>
      </Box>
    </Box>
  )
}
