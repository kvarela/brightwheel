import { ChatSessionStatus } from '../enums/chat-session-status.enum'
import { InboxState } from '../enums/inbox-state.enum'

export interface ChatSessionDto {
  id: string
  sessionToken: string
  schoolId: string
  parentName: string | null
  status: ChatSessionStatus
  inboxState: InboxState | null
  escalatedAt: string | null
  resolvedAt: string | null
  createdAt: string
  updatedAt: string
  lastMessagePreview: string | null
  lastCertaintyScore: number | null
  unreadForStaff: boolean
}
