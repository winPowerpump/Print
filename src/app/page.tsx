import XVerification from './components/XVerification'
import ProtectedContent from './components/ProtectedContent'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Print
          </h1>
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
          </div>
        </ProtectedContent>
      </div>
    </div>
  )
}