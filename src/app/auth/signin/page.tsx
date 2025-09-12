'use client'

import { getProviders, signIn } from 'next-auth/react'
import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { IoMdArrowRoundBack } from "react-icons/io";

interface Provider {
  id: string
  name: string
  type: string
  signinUrl: string
  callbackUrl: string
}

function SignInContent() {
  const [providers, setProviders] = useState<Record<string, Provider> | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'
  const error = searchParams.get('error')

  useEffect(() => {
    const setupProviders = async () => {
      const providers = await getProviders()
      setProviders(providers)
    }
    setupProviders()
  }, [])

  const handleSignIn = async (providerId: string) => {
    setIsLoading(true)
    try {
      await signIn(providerId, { callbackUrl })
    } catch (error) {
      console.error('Sign in error:', error)
      setIsLoading(false)
    }
  }

  const getErrorMessage = (error: string) => {
    switch (error) {
      case 'OAuthSignin':
        return 'Error in constructing an authorization URL'
      case 'OAuthCallback':
        return 'Error in handling the response from the OAuth provider'
      case 'OAuthCreateAccount':
        return 'Could not create OAuth account in the database'
      case 'EmailCreateAccount':
        return 'Could not create email account in the database'
      case 'Callback':
        return 'Error in the OAuth callback handler route'
      case 'OAuthAccountNotLinked':
        return 'Email on the account is already linked, but not with this OAuth account'
      case 'EmailSignin':
        return 'Sending the e-mail with the verification token failed'
      case 'CredentialsSignin':
        return 'The authorize callback returned null in the Credentials provider'
      case 'SessionRequired':
        return 'The content of this page requires you to be signed in at all times'
      default:
        return 'An error occurred during authentication'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-2">
            Sign in to continue
          </h2>
          <p className="text-gray-600">
            Authenticate with your X account to verify your identity
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-red-800">
                  Authentication Error
                </h3>
                <p className="text-sm text-red-700 mt-1">
                  {getErrorMessage(error)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Sign In Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
          {providers ? (
            <div className="space-y-4">
              {Object.values(providers).map((provider) => (
                <div key={provider.name}>
                  {provider.id === 'twitter' ? (
                    <button
                      onClick={() => handleSignIn(provider.id)}
                      disabled={isLoading}
                      className="w-full bg-black text-white py-4 px-6 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 flex items-center justify-center font-medium text-lg"
                    >
                      {isLoading ? (
                        <>
                          <div className="loading-spinner mr-3"></div>
                          Connecting...
                        </>
                      ) : (
                        <>
                          <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                          </svg>
                          Continue with X
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSignIn(provider.id)}
                      disabled={isLoading}
                      className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 flex items-center justify-center font-medium"
                    >
                      Continue with X
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <div className="loading-spinner mr-3"></div>
              <span className="text-gray-600">Loading sign in options...</span>
            </div>
          )}
        </div>

        {/* Back to Home */}
        <div className="text-center">
          <button
            onClick={() => router.push('/')}
            className="text-gray-600 hover:text-gray-900 transition duration-200 flex justify-center items-center space-x-1"
          >
            <IoMdArrowRoundBack size={25} /> Back to home
          </button>
        </div>
      </div>
    </div>
  )
}

export default function SignIn() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#15161B] flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    }>
      <SignInContent />
    </Suspense>
  )
}