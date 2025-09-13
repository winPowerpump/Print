'use client'

import { signIn, signOut, useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import Image from 'next/image'

export default function XVerification({ onSuccess }) {
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)

  // Call onSuccess when user is authenticated
  useEffect(() => {
    console.log('Session changed:', session);
    if (session && session.user && onSuccess) {
      console.log('Calling onSuccess with user data:', {
        username: session.user.xUsername,
        name: session.user.name,
        verified: session.user.xVerified
      });
      // Pass the user data to the parent component
      onSuccess({
        username: session.user.xUsername,
        name: session.user.name,
        verified: session.user.xVerified
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

  // If authenticated, don't render anything (let parent show token list)
  if (session && session.user) {
    console.log('User is authenticated, returning null to show token list');
    return null;
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