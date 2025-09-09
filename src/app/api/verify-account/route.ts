import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { 
          message: 'Unauthorized - No active session', 
          isTargetAccount: false,
          isAuthenticated: false
        },
        { status: 401 }
      )
    }

    // Return comprehensive verification status
    return NextResponse.json({
      message: 'Account verification status retrieved successfully',
      isAuthenticated: true,
      isTargetAccount: session.user.isTargetAccount || false,
      user: {
        username: session.user.xUsername,
        userId: session.user.xUserId,
        name: session.user.name,
        verified: session.user.xVerified || false,
        image: session.user.image
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Verification API error:', error)
    return NextResponse.json(
      { 
        message: 'Internal server error during verification',
        isTargetAccount: false,
        isAuthenticated: false,
        error: process.env.NODE_ENV === 'development' ? error : 'Server error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { message: 'Method not allowed' },
    { status: 405 }
  )
}