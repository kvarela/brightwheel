import type { ChatMessageDto } from './chat-message.dto'

export interface StaffReplyEventDto {
  chatSessionId: string
  message: ChatMessageDto
}
