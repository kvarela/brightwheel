import { useRef, useState } from 'react'
import { Box, Badge, Text, Spinner, Stack, Input } from '@chakra-ui/react'
import { Maximize2, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useKnowledgeBase } from '../hooks/useKnowledgeBase'
import { KnowledgeBaseEntry, KnowledgeBaseSource } from '../types/KnowledgeBaseEntry'
import { AddKnowledgeBaseEntryModal } from './AddKnowledgeBaseEntryModal'

const SOURCE_LABELS: Record<KnowledgeBaseSource, string> = {
  manual: 'Manual',
  handbook_extraction: 'Handbook',
  escalation_learning: 'Escalation',
}

const BASE_INQUIRY_LABELS: Record<string, string> = {
  operating_hours: 'Hours',
  tuition_rates: 'Tuition',
  enrollment_process: 'Enrollment',
  age_groups: 'Age Groups',
  dropoff_pickup: 'Drop-off / Pick-up',
  meals_snacks: 'Meals & Snacks',
  illness_policy: 'Illness Policy',
  communication_cadence: 'Communication',
  staff_child_ratios: 'Staff Ratios',
  outdoor_activity: 'Outdoor Activity',
  emergency_procedures: 'Emergencies',
  waitlist_process: 'Waitlist',
}

function EntryRow({ entry, first }: { entry: KnowledgeBaseEntry; first: boolean }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <Box
      py="14px"
      borderTop={first ? 'none' : '1px solid #EBEFF4'}
      cursor="pointer"
      onClick={() => setExpanded((v) => !v)}
    >
      <Box display="flex" alignItems="flex-start" justifyContent="space-between" gap="8px">
        <Box flex="1" minWidth="0">
          <Box display="flex" alignItems="center" gap="6px" flexWrap="wrap" mb="4px">
            {entry.isBaseInquiry && (
              <Badge
                px="6px"
                py="2px"
                borderRadius="2px"
                bg="rgba(84,99,214,0.1)"
                color="#5463D6"
                fontSize="12px"
                fontWeight={600}
                textTransform="uppercase"
              >
                {entry.baseInquiryKey
                  ? (BASE_INQUIRY_LABELS[entry.baseInquiryKey] ?? 'Base')
                  : 'Base'}
              </Badge>
            )}
            <Badge
              px="6px"
              py="2px"
              borderRadius="2px"
              bg="#F7F9FB"
              color="#5C5E6A"
              fontSize="12px"
              fontWeight={500}
              textTransform="uppercase"
            >
              {SOURCE_LABELS[entry.source]}
            </Badge>
          </Box>
          <Text fontSize="14px" fontWeight={600} color="#18181D">
            {entry.question}
          </Text>
          {expanded && (
            <Text fontSize="14px" color="#5C5E6A" mt="6px" lineHeight="1.5">
              {entry.answer}
            </Text>
          )}
        </Box>
        <Text
          fontSize="18px"
          color="#737685"
          lineHeight="1"
          flexShrink={0}
          mt="2px"
          userSelect="none"
        >
          {expanded ? '−' : '+'}
        </Text>
      </Box>
    </Box>
  )
}

export function KnowledgeBaseSection({ fullPage }: { fullPage?: boolean }) {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    setSearch(value)
    if (debounceTimer.current !== null) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(value)
    }, 300)
  }

  const { data: entries, isLoading, isError } = useKnowledgeBase(debouncedSearch)

  const baseInquiries = entries?.filter((e) => e.isBaseInquiry) ?? []
  const others = entries?.filter((e) => !e.isBaseInquiry) ?? []

  return (
    <Box bg="white" borderRadius="2px" border="1px solid #EBEFF4" p="24px">
      <Box
        display="flex"
        alignItems="center"
        mb="16px"
        flexWrap="wrap"
        gap="12px"
      >
        <Box display="flex" alignItems="center" gap="4px" flexShrink={0}>
          <Text
            fontSize="22px"
            fontWeight={600}
            color="#18181D"
            fontFamily='"AvenirNext", "Helvetica Neue", helvetica, arial, sans-serif'
          >
            Knowledge Base
          </Text>
          {!fullPage && (
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
              color="#737685"
              _hover={{ bg: '#F7F9FB', color: '#5463D6' }}
              transition="all 0.2s"
              onClick={() => navigate('/dashboard/knowledge-base')}
              title="Open full view"
            >
              <Maximize2 size={16} />
            </Box>
          )}
        </Box>
        <Box flex="1" display="flex" justifyContent="center" minWidth={{ base: '100%', md: '200px' }}>
          <Input
            placeholder="Search questions and answers…"
            value={search}
            onChange={handleSearchChange}
            border="1px solid #EBEFF4"
            borderRadius="2px"
            padding="12px 16px"
            fontSize="14px"
            color="#18181D"
            width={{ base: '100%', md: '320px' }}
            _focus={{
              borderColor: '#5463D6',
              boxShadow: '0 0 0 3px rgba(84,99,214,0.15)',
              outline: 'none',
            }}
            _placeholder={{ color: '#737685' }}
          />
        </Box>
        <Box
          as="button"
          display="flex"
          alignItems="center"
          justifyContent="center"
          width="40px"
          height="40px"
          borderRadius="2px"
          border="1px solid #EBEFF4"
          bg="white"
          cursor="pointer"
          color="#5463D6"
          flexShrink={0}
          _hover={{ bg: '#5463D6', color: 'white', borderColor: '#5463D6' }}
          transition="all 0.2s"
          onClick={() => setIsAddModalOpen(true)}
          title="Add knowledge base entry"
          aria-label="Add knowledge base entry"
        >
          <Plus size={18} />
        </Box>
      </Box>

      {isLoading && (
        <Box display="flex" alignItems="center" gap="8px" color="#737685">
          <Spinner size="sm" color="#5463D6" />
          <Text fontSize="14px">Loading…</Text>
        </Box>
      )}

      {isError && (
        <Text fontSize="14px" color="#CF193A">
          Failed to load knowledge base entries.
        </Text>
      )}

      {!isLoading && !isError && entries?.length === 0 && (
        <Text fontSize="14px" color="#737685">
          {debouncedSearch ? 'No entries match your search.' : 'No knowledge base entries yet.'}
        </Text>
      )}

      {!isLoading && !isError && entries && entries.length > 0 && (
        <Box>
          {baseInquiries.length > 0 && (
            <Box mb={others.length > 0 ? '24px' : '0'}>
              <Text
                fontSize="12px"
                fontWeight={600}
                color="#737685"
                textTransform="uppercase"
                letterSpacing="0.05em"
                mb="4px"
              >
                Base Inquiries ({baseInquiries.length} / 12)
              </Text>
              <Stack gap="0">
                {baseInquiries.map((entry, idx) => (
                  <EntryRow key={entry.id} entry={entry} first={idx === 0} />
                ))}
              </Stack>
            </Box>
          )}

          {others.length > 0 && (
            <Box>
              <Text
                fontSize="12px"
                fontWeight={600}
                color="#737685"
                textTransform="uppercase"
                letterSpacing="0.05em"
                mb="4px"
              >
                Additional Entries ({others.length})
              </Text>
              <Stack gap="0">
                {others.map((entry, idx) => (
                  <EntryRow key={entry.id} entry={entry} first={idx === 0} />
                ))}
              </Stack>
            </Box>
          )}
        </Box>
      )}

      <AddKnowledgeBaseEntryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </Box>
  )
}
