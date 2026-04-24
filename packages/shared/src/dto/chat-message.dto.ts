import { MessageRole } from '../enums/message-role.enum'

export interface ChatMessageDto {
  id: string
  role: MessageRole
  content: string
  certaintyScore: number | null
  createdAt: string
  sentByStaffName: string | null
}
