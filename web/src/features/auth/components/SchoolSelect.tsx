import { useEffect, useRef, useState } from 'react'
import { Box, Input, Text } from '@chakra-ui/react'
import { apiClient } from '../../../lib/apiClient'
import { Loader } from '../../../components/Loader'

interface SchoolOption {
  id: string
  name: string
}

export interface SchoolSelection {
  id: string | null
  name: string
}

interface SchoolSelectProps {
  value: SchoolSelection | null
  onChange: (selection: SchoolSelection | null) => void
  hasError?: boolean
}

export function SchoolSelect({ value, onChange, hasError }: SchoolSelectProps) {
  const [query, setQuery] = useState(value?.name ?? '')
  const [results, setResults] = useState<SchoolOption[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true)
      try {
        const res = await apiClient.get<SchoolOption[]>('/api/schools/search', {
          params: { q: query },
        })
        setResults(res.data)
      } catch {
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }, 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setQuery(val)
    setIsOpen(true)
    if (!val.trim()) onChange(null)
  }

  const handleSelect = (school: SchoolOption) => {
    setQuery(school.name)
    setIsOpen(false)
    onChange({ id: school.id, name: school.name })
  }

  const handleAddNew = () => {
    setIsOpen(false)
    onChange({ id: null, name: query.trim() })
  }

  const exactMatch = results.some((r) => r.name.toLowerCase() === query.trim().toLowerCase())
  const showAddOption = query.trim().length > 0 && !exactMatch

  return (
    <Box position="relative" ref={containerRef}>
      <Input
        value={query}
        onChange={handleInputChange}
        onFocus={() => query.trim() && setIsOpen(true)}
        placeholder="Search for your school…"
        border="1px solid"
        borderColor={hasError ? '#CF193A' : '#EBEFF4'}
        borderRadius="2px"
        px="4"
        py="3"
        fontSize="16px"
        color="#18181D"
        bg="white"
        _placeholder={{ color: '#737685' }}
        _focus={{
          borderColor: '#5463D6',
          boxShadow: '0 0 0 3px rgba(84,99,214,0.15)',
          outline: 'none',
        }}
        autoComplete="off"
      />

      {isOpen && (query.trim().length > 0) && (
        <Box
          position="absolute"
          top="calc(100% + 4px)"
          left="0"
          right="0"
          bg="white"
          border="1px solid #EBEFF4"
          borderRadius="2px"
          boxShadow="0 4px 16px rgba(0,0,0,0.10)"
          zIndex={200}
          maxH="200px"
          overflowY="auto"
        >
          {isLoading && (
            <Box px="4" py="4">
              <Loader text="Searching…" size="sm" />
            </Box>
          )}

          {!isLoading && results.length === 0 && !showAddOption && (
            <Box px="4" py="3">
              <Text fontSize="14px" color="#737685">No schools found</Text>
            </Box>
          )}

          {!isLoading && results.map((school) => (
            <Box
              key={school.id}
              px="4"
              py="3"
              cursor="pointer"
              _hover={{ bg: '#F7F9FB' }}
              onClick={() => handleSelect(school)}
            >
              <Text fontSize="14px" color="#18181D">{school.name}</Text>
            </Box>
          ))}

          {!isLoading && showAddOption && (
            <Box
              px="4"
              py="3"
              cursor="pointer"
              borderTop={results.length > 0 ? '1px solid #EBEFF4' : undefined}
              _hover={{ bg: '#F7F9FB' }}
              onClick={handleAddNew}
            >
              <Text fontSize="14px" color="#5463D6" fontWeight="600">
                + Add &ldquo;{query.trim()}&rdquo;
              </Text>
            </Box>
          )}
        </Box>
      )}
    </Box>
  )
}
