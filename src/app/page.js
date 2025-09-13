'use client';

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import XVerification from './components/XVerification'
import TokensList from './components/TokensList'
import Link from 'next/link'

const words = ['creators.', 'causes.', 'people.', 'projects.', 'anything.']

function AnimatedWord() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prevIndex) => (prevIndex + 1) % words.length)
    }, 3000) // Change word every 2.5 seconds

    return () => clearInterval(interval)
  }, [])

  const exitVariants = {
    initial: { opacity: 1, y: 0 },
    exit: { 
      opacity: 0, 
      y: 20,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    }
  }

  const enterVariants = {
    initial: { opacity: 0, y: -10 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    }
  }

  return (
    <span className="inline-block w-32 text-center">
      <AnimatePresence mode="wait">
        <motion.span
          key={currentWordIndex}
          variants={enterVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="inline-block"
        >
          {words[currentWordIndex]}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

export default function Home() {
  return (
    <div className="min-h-screen bg-[#15161B] py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="absolute top-0 left-[9%]">
          <img src="/print.png" className='w-[75px] h-auto' />
        </div>

        <div className='absolute top-4 -translate-x-1/2 left-1/2 hidden'>
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
        

        {/* Main Content */}
        <div className='grid items-start mt-[7.5%] md:mt-[5%] gap-2'>
          {/* Hero Section */}
          <div className='w-full'>
            <div className='w-full flex justify-center mb-1'>
              <motion.div
                animate={{ 
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "easeInOut",
                  repeatType: "reverse"
                }}
                style={{
                  willChange: "transform, opacity",
                  backfaceVisibility: "hidden",
                  perspective: 1000
                }}
                className="transform-gpu"
              >
                <Link
                  href="/create"
                  className="inline-block px-4 py-2 text-gray-300 font-medium mb-2 text-xl hover:text-white transition-colors"
                >
                  [create]
                </Link>
              </motion.div>
            </div>
            <div className='text-center text-4xl md:text-6xl text-balance font-bold text-white mb-2 mx-[5%] md:mx-[20%] whitespace-nowrap'>
              Launch for your
            </div>
            <div className='text-center text-4xl md:text-6xl text-balance font-bold text-white mb-2 mx-[5%] md:mx-[10%] -translate-x-[5.75%]'>
              favorite <AnimatedWord />
            </div>
            <div className='text-center text-sm md:text-base text-balance text-gray-300 mb-4 mx-[20%]'>
              they get the fees, it&apos;s time they printed
            </div>
          </div>

          {/* Tokens List Section */}
          <div className='w-full'>
            <TokensList />
          </div>
        </div>
      </div>
    </div>
  )
}

///