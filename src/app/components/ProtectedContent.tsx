'use client'

import { useSession } from 'next-auth/react'
import { ReactNode } from 'react'

interface ProtectedContentProps {
  children: ReactNode
  fallback?: ReactNode
}

export default function ProtectedContent({ 
  children, 
  fallback 
}: ProtectedContentProps) {
  const { data: session, status } = useSession()

  // Loading state
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="loading-spinner mr-3"></div>
        <span className="text-gray-600">Checking authentication...</span>
      </div>
    )
  }

  // Not authenticated
  if (!session) {
    return fallback || (
      <div className="text-center p-8 bg-white rounded-lg border border-gray-200">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Auth Required
          </h2>
        </div>
      </div>
    )
  }

  // Authenticated but not target account
  if (!session.user.isTargetAccount) {
    return fallback || (
      <div className="text-center p-8 bg-white rounded-lg border border-red-200">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-4">
            You are signed in as <strong>@{session.user.xUsername}</strong>, but this content requires authentication from the target account.
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-700">
              Please sign out and sign in with the correct X account to view this content.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Authenticated and is target account - show protected content
  return <>{children}</>
}