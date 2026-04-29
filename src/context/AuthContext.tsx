'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { Session } from '@/types/auth'
import { getSession, clearSession } from '@/lib/storage'

type AuthContextType = {
  session: Session | null
  setSession: (session: Session | null) => void
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = getSession()
    setSession(stored)
    setLoading(false)
  }, [])

  function logout() {
    clearSession()
    setSession(null)
  }

  return (
    <AuthContext.Provider value={{ session, setSession, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}