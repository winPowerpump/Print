import XVerification from './components/XVerification'
import ProtectedContent from './components/ProtectedContent'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-[#15161B] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="absolute top-0 left-[9%]">
          <img src="/print.png" className='w-[75px] h-auto' />
        </div>
        
        <div className="absolute top-4 right-[9%]">
          <XVerification />
        </div>

        <div className='grid items-center mt-[7.5%]'>
          <div className='w-full flex justify-center'>
            <Link
              href="/token"
              className="px-4 py-2 text-gray-300 font-bold mb-2 text-xl"
            >
              [create]
            </Link>
          </div>
          <div className='text-center text-6xl text-balance font-bold text-white'>
            Direct fees to your favorite creators.
          </div>
        </div>
        
        <div className='absolute bottom-4 right-4'>
          <ProtectedContent>
            <div className="bg-white rounded-xl p-8 border border-gray-200">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Welcome, Verified User!
                </h2>
              </div>
            </div>
          </ProtectedContent>
        </div>
      </div>
    </div>
  )
}