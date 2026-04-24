import { Box, Badge, Text, Spinner, Stack } from '@chakra-ui/react'
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

export function LiveChatsSection() {
  const { data: sessions, isLoading, isError } = useLiveChats()

  return (
    <Box bg="white" borderRadius="2px" border="1px solid #EBEFF4" p="24px">
      <Text
        fontSize="22px"
        fontWeight={600}
        color="#18181D"
        mb="16px"
        fontFamily='"AvenirNext", "Helvetica Neue", helvetica, arial, sans-serif'
      >
        Live Chats
      </Text>

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
              py="14px"
              borderTop={idx === 0 ? 'none' : '1px solid #EBEFF4'}
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
          ))}
        </Stack>
      )}
    </Box>
  )
}
