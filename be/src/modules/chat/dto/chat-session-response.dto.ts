import { ChatSessionStatus, InboxState } from '@brightwheel/shared'

export class ChatSessionResponseDto {
  id: string
  parentName: string | null
  parentEmail: string | null
  status: ChatSessionStatus
  inboxState: InboxState | null
  escalatedAt: string | null
  createdAt: string
  assignedStaff: { id: string; fullName: string; email: string } | null
  latestInquiry: { content: string; createdAt: string } | null
}
