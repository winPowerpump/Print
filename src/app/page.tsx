import XVerification from './components/XVerification'
import ProtectedContent from './components/ProtectedContent'
import TokensList from './components/TokensList'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-[#15161B] py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="absolute top-0 left-[9%]">
          <img src="/print.png" className='w-[75px] h-auto' />
        </div>

        <div className='absolute top-4 -translate-x-1/2 left-1/2'>
          <div className='flex justify-center space-x-2'>
            <div className='bg-[#FDF355] w-44 p-4'>

            </div>
            <div className='bg-[#9EC4F8] w-32 p-4'>
              
              </div>
          </div>
        </div>

        <div className='absolute top-4 right-[9%]'>
          <Link
            href="/claim"
            className="px-4 py-2 text-gray-900 mb-2 bg-[#67D682] rounded-lg text-sm"
          >
            claim
          </Link>
        </div>
        
        <div className="absolute bottom-4 left-4 hidden">
          <XVerification />
        </div>

        {/* Main Content */}
        <div className='grid items-start mt-[7.5%] md:mt-[5%] gap-2'>
          {/* Hero Section */}
          <div className='w-full'>
            <div className='w-full flex justify-center mb-2'>
              <Link
                href="/create"
                className="px-4 py-2 text-gray-300 font-bold mb-2 text-xl hover:text-white transition-colors"
              >
                [create]
              </Link>
            </div>
            <div className='text-center text-4xl md:text-6xl text-balance font-bold text-white mb-6 mx-[20%]'>
              Direct fees to your favorite creators.
            </div>
          </div>

          {/* Tokens List Section */}
          <div className='w-full'>
            <TokensList />
          </div>
        </div>
        
        {/* Protected Content - Repositioned */}
        <div className='fixed bottom-4 right-4 z-40 hidden'>
          <ProtectedContent>
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-lg max-w-sm">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">
                  Verified User
                </h2>
                <p className="text-sm text-gray-600">
                  Welcome back!
                </p>
              </div>
            </div>
          </ProtectedContent>
        </div>
      </div>
    </div>
  )
}