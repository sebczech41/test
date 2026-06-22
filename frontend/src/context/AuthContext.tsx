import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { api } from '../api/client'

interface User {
  id: number
  name: string
  email: string
  role: string
}

interface AuthContextValue {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    if (localStorage.getItem('token') && !user) {
      api.get('/me').then(({ data }) => setUser(data)).catch(() => {})
    }
  }, [])

  async function login(email: string, password: string) {
    const { data } = await api.post('/login', { email, password })
    localStorage.setItem('token', data.token)
    setUser(data.user)
  }

  async function logout() {
    await api.post('/logout').catch(() => {})
    localStorage.removeItem('token')
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
