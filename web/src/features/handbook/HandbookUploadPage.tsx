import { Box, Text, VStack } from '@chakra-ui/react'
import { HandbookDropzone } from './components/HandbookDropzone'
import { HandbookProcessingAnimation } from './components/HandbookProcessingAnimation'
import { HandbookSuccessView } from './components/HandbookSuccessView'
import { HandbookErrorView } from './components/HandbookErrorView'
import { useHandbookUpload } from './hooks/useHandbookUpload'

export function HandbookUploadPage() {
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
    <Box bg="#F7F9FB" minH="calc(100vh - 140px)" py={{ base: '32px', md: '56px' }}>
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
  )
}
