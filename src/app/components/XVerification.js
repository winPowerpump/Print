'use client'

import { signIn, signOut, useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import Image from 'next/image'

export default function XVerification({ onSuccess }) {
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)

  // Call onSuccess when user is authenticated and is target account
  useEffect(() => {
    console.log('Session changed:', session);
    if (session && session.user && session.user.isTargetAccount && onSuccess) {
      console.log('Calling onSuccess with user data:', {
        username: session.user.xUsername,
        name: session.user.name,
        verified: session.user.xVerified,
        isTargetAccount: session.user.isTargetAccount
      });
      // Pass the user data to the parent component
      onSuccess({
        username: session.user.xUsername,
        name: session.user.name,
        verified: session.user.xVerified,
        isTargetAccount: session.user.isTargetAccount
      })
    }
  }, [session, onSuccess])

  const handleSignIn = async () => {
    setIsLoading(true)
    try {
      await signIn('twitter', { 
        callbackUrl: '/claim',
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
        callbackUrl: '/claim',
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
      <div className="w-full flex justify-center">
        <div className="text-center">
          <button
            disabled
            className="w-min whitespace-nowrap bg-black text-white py-2 px-3 rounded-lg cursor-not-allowed opacity-75 transition duration-200 flex items-center justify-center font-medium text-lg"
          >
            <div className="loading-spinner mr-3"></div>
            Loading
            <svg className="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.80l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </button>
        </div>
      </div>
    )
  }

  // If authenticated and target account, don't render anything (let parent show token list)
  if (session && session.user && session.user.isTargetAccount) {
    console.log('User is target account, returning null to show token list');
    return null;
  }

  // Authenticated but not target account - show access denied
  if (session && session.user && !session.user.isTargetAccount) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-xl p-6 border border-gray-200">
        <div className="text-center">
          
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
          
          {/* Access Denied */}
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
          
          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            disabled={isLoading}
            className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 font-medium"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="loading-spinner mr-2"></div>
                Signing out
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
    <div className="w-full flex justify-center">
      <div className="text-center">
        <button
          onClick={handleSignIn}
          disabled={isLoading}
          className="w-min whitespace-nowrap bg-black text-white py-2 px-3 rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 flex items-center justify-center font-medium text-lg"
        >
          {isLoading ? (
            <>
              <div className="loading-spinner mr-3"></div>
              Signing In
            </>
          ) : (
            <>
              Sign In
              <svg className="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.80l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  )
}