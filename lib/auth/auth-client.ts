import { createAuthClient } from 'better-auth/react'
import { usernameClient } from 'better-auth/client/plugins'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
const APP_NAME = 'Skill Bridge'

export const authClient = createAuthClient({
  baseURL: API_URL,
  baseURLType: 'server',
  plugins: [usernameClient()],
  // Enable smooth cookie handling
  fetchOptions: {
    credentials: 'include',
  },
  // Session fetching configuration
  sessionFetchOptions: {
    cache: 'no-store',
  },
})

// Export client methods for external use
export const { signUp, signIn, signOut, useSession, useActiveSessionClient } = authClient

// Helper to set cookies for server-side rendering
export const getServerSession = async () => {
  try {
    const response = await fetch(`${API_URL}/api/auth/get-session`, {
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })

    if (!response.ok) return null
    return await response.json()
  } catch (error) {
    console.error('Failed to get server session:', error)
    return null
  }
}
