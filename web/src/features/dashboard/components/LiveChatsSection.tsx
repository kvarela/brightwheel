import { Box, Badge, Text, Spinner, Stack } from '@chakra-ui/react'
import { Maximize2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useLiveChats } from '../hooks/useLiveChats'
import { ChatSession } from '../types/ChatSession'

function statusBadge(session: ChatSession) {
  if (session.status === 'escalated') {
    return (
      <Badge
        px="8px"
        py="2px"
        borderRadius="2px"
        bg="#FFF6F5"
        color="#CF193A"
        fontSize="12px"
        fontWeight={600}
        textTransform="uppercase"
      >
        Escalated
      </Badge>
    )
  }
  return (
    <Badge
      px="8px"
      py="2px"
      borderRadius="2px"
      bg="#E9F8EF"
      color="#3BBA6E"
      fontSize="12px"
      fontWeight={600}
      textTransform="uppercase"
    >
      Active
    </Badge>
  )
}

function inboxStateBadge(state: ChatSession['inboxState']) {
  if (!state) return null
  const labels: Record<string, string> = {
    needs_attention: 'Needs Attention',
    in_progress: 'In Progress',
    resolved: 'Resolved',
  }
  return (
    <Badge
      px="8px"
      py="2px"
      borderRadius="2px"
      bg="#FFF9E5"
      color="#896507"
      fontSize="12px"
      fontWeight={600}
      textTransform="uppercase"
      ml="6px"
    >
      {labels[state] ?? state}
    </Badge>
  )
}

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  return `${Math.floor(diff / 3600)}h ago`
}

export function LiveChatsSection({ fullPage }: { fullPage?: boolean }) {
  const navigate = useNavigate()
  const { data: sessions, isLoading, isError } = useLiveChats()

  return (
    <Box bg="white" borderRadius="2px" border="1px solid #EBEFF4" p="24px">
      <Box display="flex" alignItems="center" justifyContent="space-between" mb="16px">
        <Text
          fontSize="22px"
          fontWeight={600}
          color="#18181D"
          fontFamily='"AvenirNext", "Helvetica Neue", helvetica, arial, sans-serif'
        >
          Live Chats
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
            onClick={() => navigate('/dashboard/chats')}
            title="Open full view"
          >
            <Maximize2 size={16} />
          </Box>
        )}
      </Box>

      {isLoading && (
        <Box display="flex" alignItems="center" gap="8px" color="#737685">
          <Spinner size="sm" color="#5463D6" />
          <Text fontSize="14px">Loading…</Text>
        </Box>
      )}

      {isError && (
        <Text fontSize="14px" color="#CF193A">
          Failed to load live chats.
        </Text>
      )}

      {!isLoading && !isError && sessions?.length === 0 && (
        <Text fontSize="14px" color="#737685">
          No active chats right now.
        </Text>
      )}

      {!isLoading && !isError && sessions && sessions.length > 0 && (
        <Stack gap="0">
          {sessions.map((session, idx) => (
            <Box
              key={session.id}
              as="button"
              type="button"
              onClick={() => navigate(`/dashboard/chats/${session.id}`)}
              textAlign="left"
              width="100%"
              bg="transparent"
              border="none"
              cursor="pointer"
              py="14px"
              px="8px"
              mx="-8px"
              borderTop={idx === 0 ? 'none' : '1px solid #EBEFF4'}
              display="flex"
              flexDirection="column"
              gap="8px"
              borderRadius="2px"
              transition="background 0.15s"
              _hover={{ bg: '#F7F9FB' }}
              _focusVisible={{
                outline: 'none',
                boxShadow: '0 0 0 3px rgba(84,99,214,0.15)',
              }}
            >
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                flexWrap="wrap"
                gap="8px"
              >
                <Box>
                  <Box display="flex" alignItems="center" gap="6px" flexWrap="wrap">
                    <Text fontSize="14px" fontWeight={600} color="#18181D">
                      {session.parentName ?? 'Anonymous'}
                    </Text>
                    {session.parentEmail && (
                      <Text fontSize="12px" color="#737685">
                        {session.parentEmail}
                      </Text>
                    )}
                  </Box>
                  <Box display="flex" alignItems="center" mt="4px" flexWrap="wrap">
                    {statusBadge(session)}
                    {inboxStateBadge(session.inboxState)}
                    {session.assignedStaff && (
                      <Text fontSize="12px" color="#5C5E6A" ml="8px">
                        Assigned to {session.assignedStaff.fullName}
                      </Text>
                    )}
                  </Box>
                </Box>
                <Text fontSize="12px" color="#737685" whiteSpace="nowrap">
                  {session.escalatedAt
                    ? `Escalated ${timeAgo(session.escalatedAt)}`
                    : `Started ${timeAgo(session.createdAt)}`}
                </Text>
              </Box>
              {session.status === 'escalated' && session.latestInquiry && (
                <Box
                  bg="#F7F9FB"
                  borderLeft="2px solid #5463D6"
                  borderRadius="2px"
                  px="10px"
                  py="8px"
                >
                  <Text
                    fontSize="11px"
                    fontWeight={600}
                    color="#737685"
                    textTransform="uppercase"
                    letterSpacing="0.04em"
                    mb="2px"
                  >
                    Inquiry
                  </Text>
                  <Text
                    fontSize="14px"
                    color="#18181D"
                    lineHeight="1.4"
                    overflow="hidden"
                    textOverflow="ellipsis"
                    display="-webkit-box"
                    css={{ WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}
                  >
                    {session.latestInquiry.content}
                  </Text>
                </Box>
              )}
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  )
}
