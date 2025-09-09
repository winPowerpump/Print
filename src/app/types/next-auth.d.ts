import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    accessToken?: string
    user: {
      id?: string
      name?: string
      email?: string
      image?: string
      xUserId?: string
      xUsername?: string
      xVerified?: boolean
      isTargetAccount?: boolean
    }
  }

  interface JWT {
    accessToken?: string
    xUserId?: string
    xUsername?: string
    xName?: string
    xVerified?: boolean
    xProfileImage?: string
    isTargetAccount?: boolean
  }
}