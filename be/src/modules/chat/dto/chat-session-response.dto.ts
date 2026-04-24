import { ChatSessionStatus, InboxState } from '@brightwheel/shared'

export class ChatSessionResponseDto {
  id: string
  parentName: string | null
  parentEmail: string | null
  status: ChatSessionStatus
  inboxState: InboxState | null
  escalatedAt: Date | null
  createdAt: Date
  assignedStaff: { id: string; fullName: string; email: string } | null
}
