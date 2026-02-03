'use client'

import { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import { useSession } from './auth-client'
import { useAppDispatch } from '@/lib/redux/hooks'
import { setUser, clearUser } from '@/lib/redux/slices/auth-slice'

interface AuthContextType {
  isLoading: boolean
  isAuthenticated: boolean
  user: any | null
}

const AuthContext = createContext<AuthContextType>({
  isLoading: true,
  isAuthenticated: false,
  user: null,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch()
  const { data: session, isPending } = useSession()
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (!isPending) {
      if (session?.user) {
        dispatch(setUser(session.user))
      } else {
        dispatch(clearUser())
      }
      setIsReady(true)
    }
  }, [session, isPending, dispatch])

  return (
    <AuthContext.Provider
      value={{
        isLoading: isPending || !isReady,
        isAuthenticated: !!session?.user,
        user: session?.user || null,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
