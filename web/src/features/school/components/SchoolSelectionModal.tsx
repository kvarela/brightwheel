import { useEffect, useState } from 'react'
import { Box, Flex, Input, Spinner, Text, VStack } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { useSchools } from '../api/useSchools'
import { useDebounce } from '../../../hooks/useDebounce'
import type { School } from '../types/School'

interface SchoolSelectionModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SchoolSelectionModal({ isOpen, onClose }: SchoolSelectionModalProps) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 300)
  const { data, isLoading, isError, refetch } = useSchools(debouncedQuery.trim() || undefined)
  const schools = data ?? []

  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleSelect = (school: School) => {
    onClose()
    navigate(`/school/${school.id}/chat`)
  }

  return (
    <Box
      position="fixed"
      inset={0}
      zIndex={1000}
      bg="rgba(30, 37, 73, 0.55)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      px="16px"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="school-modal-title"
    >
      <Box
        bg="white"
        borderRadius="8px"
        boxShadow="0 20px 60px rgba(30,37,73,0.25)"
        w="full"
        maxW="520px"
        maxH="80vh"
        display="flex"
        flexDirection="column"
        overflow="hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <Box px="24px" pt="24px" pb="16px" borderBottom="1px solid #EBEFF4">
          <Flex justify="space-between" align="flex-start" gap={4}>
            <Box>
              <Text
                id="school-modal-title"
                as="h2"
                fontSize="22px"
                fontWeight={600}
                color="#18181D"
                lineHeight={1.2}
              >
                Find your school
              </Text>
              <Text fontSize="14px" color="#5C5E6A" mt="4px">
                Choose your child&apos;s school to start chatting with their AI front desk.
              </Text>
            </Box>
            <Box
              as="button"
              onClick={onClose}
              aria-label="Close"
              bg="transparent"
              border="none"
              cursor="pointer"
              color="#737685"
              fontSize="20px"
              lineHeight={1}
              px="8px"
              py="4px"
              borderRadius="2px"
              _hover={{ color: '#18181D', bg: '#F7F9FB' }}
            >
              ×
            </Box>
          </Flex>
          <Box mt="16px">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by school name"
              autoFocus
              border="1px solid #EBEFF4"
              borderRadius="2px"
              px="16px"
              py="12px"
              fontSize="14px"
              color="#18181D"
              _placeholder={{ color: '#737685' }}
              _focus={{
                borderColor: '#5463D6',
                boxShadow: '0 0 0 3px rgba(84,99,214,0.15)',
                outline: 'none',
              }}
            />
          </Box>
        </Box>

        <Box flex={1} overflowY="auto" px="12px" py="12px">
          {isLoading && (
            <Flex justify="center" py="32px">
              <Spinner color="#5463D6" />
            </Flex>
          )}

          {isError && (
            <VStack gap={3} py="32px">
              <Text fontSize="14px" color="#CF193A">
                We couldn&apos;t load the list of schools.
              </Text>
              <Box
                as="button"
                onClick={() => refetch()}
                bg="transparent"
                border="1px solid #5463D6"
                color="#5463D6"
                borderRadius="2px"
                px="16px"
                py="8px"
                fontSize="14px"
                fontWeight={600}
                cursor="pointer"
              >
                Try again
              </Box>
            </VStack>
          )}

          {!isLoading && !isError && schools.length === 0 && (
            <Flex direction="column" align="center" py="32px" gap={2}>
              <Text fontSize="14px" color="#18181D" fontWeight={600}>
                No schools match your search
              </Text>
              <Text fontSize="13px" color="#737685" textAlign="center">
                Try a different name, or contact your school if they aren&apos;t listed yet.
              </Text>
            </Flex>
          )}

          {!isLoading && !isError && schools.length > 0 && (
            <VStack gap={0} align="stretch">
              {schools.map((school) => (
                <Box
                  key={school.id}
                  as="button"
                  onClick={() => handleSelect(school)}
                  textAlign="left"
                  bg="white"
                  border="1px solid transparent"
                  borderRadius="2px"
                  px="16px"
                  py="12px"
                  cursor="pointer"
                  transition="all 0.15s ease"
                  _hover={{ bg: '#F7F9FB', borderColor: '#EBEFF4' }}
                >
                  <Text fontSize="15px" fontWeight={600} color="#18181D">
                    {school.name}
                  </Text>
                  <Text fontSize="12px" color="#737685" mt="2px">
                    mybrightwheel.com/chat/{school.slug}
                  </Text>
                </Box>
              ))}
            </VStack>
          )}
        </Box>
      </Box>
    </Box>
  )
}
