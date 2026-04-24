import { ChatMessageDto } from './chat-message.dto'

export interface NewParentMessageEventDto {
  chatSessionId: string
  schoolId: string
  parentMessage: ChatMessageDto
  aiMessage: ChatMessageDto
  escalated: boolean
}
