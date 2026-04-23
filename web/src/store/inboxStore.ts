import { create } from 'zustand'

interface EscalationNotification {
  conversationId: string
  schoolId: string
  parentName: string | null
  timestamp: number
}

interface InboxStore {
  pendingEscalations: EscalationNotification[]
  unreadCount: number
  addEscalation: (notification: EscalationNotification) => void
  dismissEscalation: (conversationId: string) => void
  clearAll: () => void
}

export const useInboxStore = create<InboxStore>((set) => ({
  pendingEscalations: [],
  unreadCount: 0,
  addEscalation: (notification) =>
    set((state) => ({
      pendingEscalations: [notification, ...state.pendingEscalations],
      unreadCount: state.unreadCount + 1,
    })),
  dismissEscalation: (conversationId) =>
    set((state) => ({
      pendingEscalations: state.pendingEscalations.filter(
        (n) => n.conversationId !== conversationId,
      ),
    })),
  clearAll: () => set({ pendingEscalations: [], unreadCount: 0 }),
}))
