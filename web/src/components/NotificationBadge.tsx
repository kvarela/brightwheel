import { Bell } from 'lucide-react'
import { Box, Flex } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { useUnreadCount } from '../features/inbox/api/useUnreadCount'
import { useInboxStore } from '../store/inboxStore'

export function NotificationBadge() {
  const { data } = useUnreadCount(true)
  const liveCount = useInboxStore((s) => s.unreadCount)

  const total = (data?.unreadCount ?? 0) + liveCount
  const display = total > 99 ? '99+' : String(total)

  return (
    <RouterLink
      to="/dashboard"
      aria-label={`Notifications${total > 0 ? ` (${display} unread)` : ''}`}
      style={{ textDecoration: 'none' }}
    >
      <Flex
        position="relative"
        align="center"
        justify="center"
        w="36px"
        h="36px"
        borderRadius="50%"
        bg="rgba(255,255,255,0.08)"
        color="rgba(255,255,255,0.9)"
        transition="background 0.2s ease"
        _hover={{ bg: 'rgba(255,255,255,0.16)' }}
      >
        <Bell size={18} />
        {total > 0 && (
          <Box
            position="absolute"
            top="-2px"
            right="-2px"
            minW="18px"
            h="18px"
            px="5px"
            bg="#CF193A"
            color="white"
            borderRadius="9999px"
            fontSize="10px"
            fontWeight={700}
            display="flex"
            alignItems="center"
            justifyContent="center"
            border="2px solid #1E2549"
            lineHeight={1}
          >
            {display}
          </Box>
        )}
      </Flex>
    </RouterLink>
  )
}
