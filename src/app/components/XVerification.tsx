'use client'

import { signIn, signOut, useSession } from 'next-auth/react'
import { useState } from 'react'
import Image from 'next/image'

export default function XVerification() {
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)

  const handleSignIn = async () => {
    setIsLoading(true)
    try {
      await signIn('twitter', { 
        callbackUrl: '/',
        redirect: true 
      })
    } catch (error) {
      console.error('Sign in error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      await signOut({ 
        callbackUrl: '/',
        redirect: true 
      })
    } catch (error) {
      console.error('Sign out error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Loading state
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="loading-spinner mr-3"></div>
        <span className="text-gray-600">Loading authentication status...</span>
      </div>
    )
  }

  // Authenticated state
  if (session) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-xl p-6 border border-gray-200">
        <div className="text-center">
          {/* Profile Image */}
          <div className="relative w-20 h-20 mx-auto mb-4">
            <Image 
              src={session.user.image || '/default-avatar.png'} 
              alt="Profile" 
              fill
              className="rounded-full object-cover"
              sizes="80px"
            />
          </div>
          
          {/* User Info */}
          <h3 className="text-xl font-bold text-gray-900 mb-1">
            {session.user.name}
          </h3>
          <p className="text-gray-600 mb-3">
            @{session.user.xUsername}
          </p>
          
          {/* Verification Badge */}
          {session.user.xVerified && (
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mb-4">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Verified Account
            </div>
          )}
          
          {/* Target Account Status */}
          {session.user.isTargetAccount ? (
            <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h4 className="text-lg font-semibold text-green-800">
                    ✅ Account Verified!
                  </h4>
                  <p className="text-sm text-green-700">
                    You are authenticated as the target account.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg">
              <div className="flex items-center justify-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h4 className="text-lg font-semibold text-red-800">
                    ❌ Access Denied
                  </h4>
                  <p className="text-sm text-red-700">
                    This is not the target account. Please sign in with the correct X account.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* User Details */}
          <div className="text-left bg-gray-50 rounded-lg p-3 mb-4 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="font-medium text-gray-700">User ID:</span>
                <p className="text-gray-600 break-all">{session.user.xUserId}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Username:</span>
                <p className="text-gray-600">@{session.user.xUsername}</p>
              </div>
            </div>
          </div>
          
          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            disabled={isLoading}
            className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 font-medium"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="loading-spinner mr-2"></div>
                Signing out...
              </div>
            ) : (
              'Sign out'
            )}
          </button>
        </div>
      </div>
    )
  }

  // Unauthenticated state
  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 border border-gray-200">
      <div className="text-center">
        {/* Header */}
        <div className="mb-6">
          <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            X Account Verification
          </h2>
          <p className="text-gray-600">
            Sign in with your X account to verify your identity as the target user
          </p>
        </div>
        
        {/* Sign In Button */}
        <button
          onClick={handleSignIn}
          disabled={isLoading}
          className="w-full bg-black text-white py-4 px-6 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 flex items-center justify-center font-medium text-lg"
        >
          {isLoading ? (
            <>
              <div className="loading-spinner mr-3"></div>
              Connecting to X...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              Sign in with X
            </>
          )}
        </button>
        
        {/* Info Note */}
        <p className="mt-4 text-xs text-gray-500">
          You will be redirected to X to authorize this application
        </p>
      </div>
    </div>
  )
}