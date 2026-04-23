import { create } from 'zustand'

interface ChatMessage {
  id: string
  content: string
  sender: 'parent' | 'ai' | 'staff'
  createdAt: string
}

interface ParentChatStore {
  messages: ChatMessage[]
  isStreaming: boolean
  sessionToken: string | null
  conversationId: string | null
  addMessage: (message: ChatMessage) => void
  appendToken: (messageId: string, token: string) => void
  setStreaming: (isStreaming: boolean) => void
  setSession: (token: string, conversationId: string) => void
  clearSession: () => void
}

export const useParentChatStore = create<ParentChatStore>((set) => ({
  messages: [],
  isStreaming: false,
  sessionToken: null,
  conversationId: null,
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  appendToken: (messageId, token) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === messageId ? { ...m, content: m.content + token } : m,
      ),
    })),
  setStreaming: (isStreaming) => set({ isStreaming }),
  setSession: (sessionToken, conversationId) =>
    set({ sessionToken, conversationId }),
  clearSession: () =>
    set({ sessionToken: null, conversationId: null, messages: [] }),
}))
