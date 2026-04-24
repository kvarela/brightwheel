import { useCallback, useState } from 'react'
import { Box, Flex, Text, VStack } from '@chakra-ui/react'
import { SUPPORTED_EXTENSIONS } from '../utils/classifyHandbookFile'

interface HandbookDropzoneProps {
  onFileSelected: (file: File) => void
}

const ACCEPT = SUPPORTED_EXTENSIONS.map((ext) => `.${ext}`).join(',')

export function HandbookDropzone({ onFileSelected }: HandbookDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleFile = useCallback(
    (file: File | null | undefined) => {
      if (file) onFileSelected(file)
    },
    [onFileSelected],
  )

  return (
    <label
      htmlFor="handbook-file-input"
      style={{ display: 'block', cursor: 'pointer', width: '100%' }}
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setIsDragging(false)
        handleFile(e.dataTransfer.files?.[0])
      }}
    >
      <Box
        w="full"
        border="2px dashed"
        borderColor={isDragging ? '#5463D6' : '#EBEFF4'}
        bg={isDragging ? 'rgba(84,99,214,0.05)' : 'white'}
        borderRadius="12px"
        p={{ base: '32px', md: '48px' }}
        transition="all 0.2s ease"
        _hover={{ borderColor: '#5463D6', bg: 'rgba(84,99,214,0.03)' }}
      >
        <input
          id="handbook-file-input"
          type="file"
          accept={ACCEPT}
          style={{ display: 'none' }}
          onChange={(e) => {
            handleFile(e.target.files?.[0])
            e.target.value = ''
          }}
        />

        <VStack gap={3} textAlign="center">
          <Flex
            w="56px"
            h="56px"
            align="center"
            justify="center"
            bg="#EEF0FC"
            color="#5463D6"
            borderRadius="50%"
            fontSize="28px"
            fontWeight={700}
          >
            +
          </Flex>
          <Text fontSize="18px" fontWeight={600} color="#18181D">
            Drop your handbook here, or click to browse
          </Text>
          <Text fontSize="14px" color="#5C5E6A">
            PDF, DOCX, or TXT · up to 25 MB
          </Text>
        </VStack>
      </Box>
    </label>
  )
}
