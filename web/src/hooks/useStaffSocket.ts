import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { io, type Socket } from 'socket.io-client'
import type {
  EscalationEventDto,
  NewParentMessageEventDto,
} from '@brightwheel/shared'
import { useAuthStore } from '../store/authStore'
import { useInboxStore } from '../store/inboxStore'
import { unreadCountQueryKey } from '../features/inbox/api/useUnreadCount'
import { conversationQueryKey } from '../features/inbox/api/useConversation'

const WS_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export function useStaffSocket(): void {
  const token = useAuthStore((s) => s.token)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const addEscalation = useInboxStore((s) => s.addEscalation)
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!isAuthenticated || !token) return

    const socket: Socket = io(`${WS_URL}/ws/staff`, {
      transports: ['websocket'],
      auth: { token },
    })

    socket.on('escalation', (event: EscalationEventDto) => {
      addEscalation({
        conversationId: event.chatSessionId,
        schoolId: event.schoolId,
        parentName: event.parentName,
        timestamp: Date.now(),
      })
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      queryClient.invalidateQueries({ queryKey: unreadCountQueryKey })
    })

    socket.on('parent_message', (event: NewParentMessageEventDto) => {
      queryClient.invalidateQueries({
        queryKey: conversationQueryKey(event.chatSessionId),
      })
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      if (event.escalated) {
        queryClient.invalidateQueries({ queryKey: unreadCountQueryKey })
      }
    })

    return () => {
      socket.disconnect()
    }
  }, [isAuthenticated, token, addEscalation, queryClient])
}
