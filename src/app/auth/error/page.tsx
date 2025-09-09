'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense } from 'react'

function ErrorContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const error = searchParams.get('error')

  const getErrorDetails = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return {
          title: 'Server Configuration Error',
          description: 'There is a problem with the server configuration. Please contact support.',
          suggestion: 'Check if the OAuth app is properly configured in the X Developer Portal.'
        }
      case 'AccessDenied':
        return {
          title: 'Access Denied',
          description: 'You denied access to the application or the request was cancelled.',
          suggestion: 'Try signing in again and grant the necessary permissions.'
        }
      case 'Verification':
        return {
          title: 'Verification Error',
          description: 'The verification token has expired or is invalid.',
          suggestion: 'Return to the sign-in page and try again.'
        }
      case 'Default':
      default:
        return {
          title: 'Authentication Error',
          description: 'An unexpected error occurred during authentication.',
          suggestion: 'Please try again. If the problem persists, contact support.'
        }
    }
  }

  const errorDetails = getErrorDetails(error)

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Error Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-red-200">
          {/* Error Icon */}
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-red-600 mb-2">
              {errorDetails.title}
            </h1>
            <p className="text-gray-600">
              {errorDetails.description}
            </p>
          </div>

          {/* Error Details */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-red-800 mb-1">
                    Error Code: {error}
                  </h3>
                  <p className="text-sm text-red-700">
                    {errorDetails.suggestion}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => router.push('/auth/signin')}
              className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition duration-200 font-medium"
            >
              Try Sign In Again
            </button>
            <button
              onClick={() => router.push('/')}
              className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition duration-200 font-medium"
            >
              Return to Home
            </button>
          </div>

          {/* Help Section */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              Need Help?
            </h3>
            <div className="text-sm text-gray-600 space-y-2">
              <p>• Make sure you have a valid X (Twitter) account</p>
              <p>• Check that your browser allows cookies and JavaScript</p>
              <p>• Try clearing your browser cache and cookies</p>
              <p>• Disable browser extensions that might block authentication</p>
            </div>
          </div>

          {/* Debug Info (Development Only) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                Debug Information
              </h3>
              <div className="bg-gray-100 rounded p-3 text-xs font-mono text-gray-600">
                <p>Error: {error || 'None'}</p>
                <p>URL: {window.location.href}</p>
                <p>Timestamp: {new Date().toISOString()}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AuthError() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  )
}