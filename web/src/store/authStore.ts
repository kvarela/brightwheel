import { create } from 'zustand'

interface AuthState {
  token: string | null
  isAuthenticated: boolean
  isLoginOpen: boolean
  isRegisterOpen: boolean
  setToken: (token: string) => void
  clearToken: () => void
  openLogin: () => void
  closeLogin: () => void
  openRegister: () => void
  closeRegister: () => void
  switchToRegister: () => void
  switchToLogin: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  isLoginOpen: false,
  isRegisterOpen: false,
  setToken: (token) => {
    localStorage.setItem('token', token)
    set({ token, isAuthenticated: true, isLoginOpen: false, isRegisterOpen: false })
  },
  clearToken: () => {
    localStorage.removeItem('token')
    set({ token: null, isAuthenticated: false })
  },
  openLogin: () => set({ isLoginOpen: true, isRegisterOpen: false }),
  closeLogin: () => set({ isLoginOpen: false }),
  openRegister: () => set({ isRegisterOpen: true, isLoginOpen: false }),
  closeRegister: () => set({ isRegisterOpen: false }),
  switchToRegister: () => set({ isLoginOpen: false, isRegisterOpen: true }),
  switchToLogin: () => set({ isRegisterOpen: false, isLoginOpen: true }),
}))
