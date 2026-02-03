'use client'

import { useAuth } from '@/lib/auth/auth-provider'
import { useAppSelector, useAppDispatch } from '@/lib/redux/hooks'
import { useRouter } from 'next/navigation'
import { signOut } from '@/lib/auth/auth-client'
import { clearUser } from '@/lib/redux/slices/auth-slice'
import { useState } from 'react'

export function Header() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { user } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await signOut()
      dispatch(clearUser())
      router.push('/auth/signin')
    } catch (error) {
      console.error('[v0] Logout error:', error)
    }
  }

  return (
    <header className="bg-background border-b border-border px-6 py-4 flex items-center justify-between">
      <div className="flex-1">
        <input
          type="search"
          placeholder="Search..."
          className="max-w-xs input-field"
          aria-label="Search"
        />
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-input transition-colors"
            aria-expanded={menuOpen}
            aria-label="User menu"
          >
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-semibold">
              {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium text-foreground">{user?.name || user?.email}</span>
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-background border border-border rounded-lg shadow-lg py-2 z-50">
              <a
                href="/dashboard/profile"
                className="block px-4 py-2 text-sm text-foreground hover:bg-input transition-colors"
              >
                Edit Profile
              </a>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-input transition-colors"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
