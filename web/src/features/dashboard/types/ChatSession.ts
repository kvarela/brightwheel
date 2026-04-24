export type ChatSessionStatus = 'active' | 'escalated' | 'resolved' | 'closed'
export type InboxState = 'needs_attention' | 'in_progress' | 'resolved'

export interface AssignedStaff {
  id: string
  fullName: string
  email: string
}

export interface ChatSession {
  id: string
  parentName: string | null
  parentEmail: string | null
  status: ChatSessionStatus
  inboxState: InboxState | null
  escalatedAt: string | null
  createdAt: string
  assignedStaff: AssignedStaff | null
}
