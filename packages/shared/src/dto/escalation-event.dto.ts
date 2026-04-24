export interface EscalationEventDto {
  chatSessionId: string
  schoolId: string
  parentName: string | null
  lastMessagePreview: string
  certaintyScore: number
  escalatedAt: string
}
