export type ParentChatMessageSender = 'parent' | 'ai' | 'staff'

export interface ParentChatMessage {
  id: string
  content: string
  sender: ParentChatMessageSender
  createdAt: string
}
