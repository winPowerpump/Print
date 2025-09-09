import XVerification from './components/XVerification'
import ProtectedContent from './components/ProtectedContent'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            X Account Verification
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Secure authentication system that verifies if you are the owner of a specific X (Twitter) account. 
            Only the target account holder can access protected content.
          </p>
        </div>
        
        {/* Verification Component */}
        <div className="mb-12">
          <XVerification />
        </div>
        
        {/* Protected Content Section */}
        <ProtectedContent>
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
            {/* Success Header */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                🎉 Welcome, Verified User!
              </h2>
              <p className="text-gray-600">
                You have successfully authenticated as the target X account.
              </p>
            </div>

            {/* Protected Content */}
            <div className="space-y-6">
              {/* Feature Cards */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-blue-900">
                      Exclusive Access
                    </h3>
                  </div>
                  <p className="text-blue-800">
                    This content is only visible to users who have been verified as the target X account holder.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-green-900">
                      Secure Verification
                    </h3>
                  </div>
                  <p className="text-green-800">
                    OAuth 2.0 authentication ensures secure and reliable identity verification through X's official API.
                  </p>
                </div>
              </div>

              {/* Sample Protected Features */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Protected Features
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-700">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Access to premium dashboard features
                  </div>
                  <div className="flex items-center text-gray-700">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Exclusive content and announcements
                  </div>
                  <div className="flex items-center text-gray-700">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Administrative controls and settings
                  </div>
                  <div className="flex items-center text-gray-700">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Priority support and assistance
                  </div>
                </div>
              </div>

              {/* Technical Information */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  How It Works
                </h3>
                <div className="prose text-gray-600 max-w-none">
                  <p className="mb-4">
                    This verification system uses X's OAuth 2.0 API to securely authenticate users. When you sign in, 
                    the system checks your X account details against a predefined target account (username and user ID).
                  </p>
                  <p className="mb-4">
                    The verification process includes:
                  </p>
                  <ul className="list-disc list-inside space-y-2 mb-4">
                    <li>Secure OAuth 2.0 authentication with X</li>
                    <li>Username and User ID verification</li>
                    <li>Session management with NextAuth.js</li>
                    <li>Rate limiting compliance (25 requests per 24 hours)</li>
                  </ul>
                  <p>
                    This approach ensures that only the legitimate account holder can access protected resources, 
                    making it perfect for exclusive content, administrative panels, or verified user features.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ProtectedContent>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500">
          <p>
            Built with Next.js, NextAuth.js, and X API v2 | 
            <span className="ml-2">Uses OAuth 2.0 for secure authentication</span>
          </p>
        </div>
      </div>
    </div>
  )
}