import { useEffect } from 'react'
import { io, type Socket } from 'socket.io-client'
import type { StaffReplyEventDto } from '@brightwheel/shared'

const WS_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

interface UseParentSocketOptions {
  sessionToken: string | null
  onStaffReply: (event: StaffReplyEventDto) => void
}

export function useParentSocket({ sessionToken, onStaffReply }: UseParentSocketOptions): void {
  useEffect(() => {
    if (!sessionToken) return

    const socket: Socket = io(`${WS_URL}/ws/parent`, {
      transports: ['websocket'],
      auth: { sessionToken },
    })

    socket.on('staff_reply', (event: StaffReplyEventDto) => {
      onStaffReply(event)
    })

    return () => {
      socket.disconnect()
    }
  }, [sessionToken, onStaffReply])
}
