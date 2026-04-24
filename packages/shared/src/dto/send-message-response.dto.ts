import { ChatMessageDto } from './chat-message.dto'

export interface SendMessageResponseDto {
  parentMessage: ChatMessageDto
  aiMessage: ChatMessageDto
  escalated: boolean
}
