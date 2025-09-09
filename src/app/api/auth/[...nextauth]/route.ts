import NextAuth, { NextAuthOptions } from 'next-auth'
import TwitterProvider from 'next-auth/providers/twitter'

// Define the Twitter API response structure
interface TwitterUserData {
  id: string
  name: string
  username: string
  verified?: boolean
  profile_image_url?: string
  public_metrics?: {
    followers_count: number
    following_count: number
    tweet_count: number
    listed_count: number
  }
}

// Twitter profile can come in two formats
interface TwitterProfile {
  data?: TwitterUserData
  id?: string
  name?: string
  username?: string
  verified?: boolean
  profile_image_url?: string
  public_metrics?: TwitterUserData['public_metrics']
}

// Extend the default session and token types
declare module "next-auth" {
  interface Session {
    accessToken?: string
    user: {
      id?: string
      name?: string | null
      email?: string | null
      image?: string | null
      xUserId?: string
      xUsername?: string
      xVerified?: boolean
      isTargetAccount?: boolean
    }
  }
}

declare module "next-auth/jwt" {
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

export const authOptions: NextAuthOptions = {
  providers: [
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
      version: "2.0",
      userinfo: {
        url: "https://api.twitter.com/2/users/me",
        params: {
          "user.fields": "id,name,username,verified,profile_image_url,public_metrics"
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        console.log('X Profile received:', profile)
        
        // Handle both possible response formats with proper typing
        const twitterProfile = profile as TwitterProfile
        const userData = twitterProfile.data || twitterProfile
        
        // Store user info in token
        token.accessToken = account.access_token
        token.xUserId = userData.id
        token.xUsername = userData.username
        token.xName = userData.name
        token.xVerified = userData.verified || false
        token.xProfileImage = userData.profile_image_url
        
        // Check if this is the target account
        const targetUsername = process.env.TARGET_X_USERNAME?.toLowerCase()
        const targetUserId = process.env.TARGET_X_USER_ID
        
        const isTargetByUsername = token.xUsername?.toLowerCase() === targetUsername
        const isTargetByUserId = token.xUserId === targetUserId
        
        token.isTargetAccount = isTargetByUsername || isTargetByUserId
        
        console.log('Verification result:', {
          username: token.xUsername,
          userId: token.xUserId,
          targetUsername,
          targetUserId,
          isTargetAccount: token.isTargetAccount
        })
      }
      return token
    },
    
    async session({ session, token }) {
      // Pass relevant info to session
      if (token) {
        session.accessToken = token.accessToken
        session.user.xUserId = token.xUserId
        session.user.xUsername = token.xUsername
        session.user.xVerified = token.xVerified
        session.user.isTargetAccount = token.isTargetAccount
        
        // Override NextAuth defaults with X data
        session.user.name = token.xName
        session.user.image = token.xProfileImage
      }
      return session
    },
    
    async signIn({ user, account, profile }) {
      // Optional: Block sign-in if not target account
      // Uncomment the lines below to only allow the target account to sign in
      
      // const twitterProfile = profile as TwitterProfile
      // const userData = twitterProfile?.data || twitterProfile
      // const targetUsername = process.env.TARGET_X_USERNAME?.toLowerCase()
      // const targetUserId = process.env.TARGET_X_USER_ID
      // const isTarget = userData?.username?.toLowerCase() === targetUsername || userData?.id === targetUserId
      // return isTarget
      
      return true // Allow all sign-ins for now
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error'
  },
  session: {
    strategy: 'jwt'
  },
  debug: process.env.NODE_ENV === 'development'
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }