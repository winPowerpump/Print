'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

export interface AccountVerificationState {
  isLoading: boolean
  isAuthenticated: boolean
  isTargetAccount: boolean
  user: {
    name?: string
    username?: string
    userId?: string
    verified?: boolean
    image?: string
  } | null
  error?: string
}

export function useAccountVerification(): AccountVerificationState {
  const { data: session, status } = useSession()
  const [verification, setVerification] = useState<AccountVerificationState>({
    isLoading: true,
    isAuthenticated: false,
    isTargetAccount: false,
    user: null
  })

  useEffect(() => {
    // Loading state
    if (status === 'loading') {
      setVerification(prev => ({ 
        ...prev, 
        isLoading: true,
        error: undefined 
      }))
      return
    }

    // Unauthenticated state
    if (status === 'unauthenticated' || !session) {
      setVerification({
        isLoading: false,
        isAuthenticated: false,
        isTargetAccount: false,
        user: null
      })
      return
    }

    // Authenticated state
    if (status === 'authenticated' && session) {
      setVerification({
        isLoading: false,
        isAuthenticated: true,
        isTargetAccount: session.user.isTargetAccount || false,
        user: {
          name: session.user.name || undefined,
          username: session.user.xUsername || undefined,
          userId: session.user.xUserId || undefined,
          verified: session.user.xVerified || false,
          image: session.user.image || undefined
        }
      })
      return
    }

    // Error state
    setVerification(prev => ({
      ...prev,
      isLoading: false,
      error: 'Unknown authentication state'
    }))
  }, [session, status])

  return verification
}

// Helper hooks for specific checks
export function useIsTargetAccount(): boolean {
  const verification = useAccountVerification()
  return verification.isTargetAccount
}

export function useIsAuthenticated(): boolean {
  const verification = useAccountVerification()
  return verification.isAuthenticated
}

export function useCurrentUser() {
  const verification = useAccountVerification()
  return verification.user
}