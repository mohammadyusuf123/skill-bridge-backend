'use client'

import Link from 'next/link'
import { useAppSelector, useAppDispatch } from '@/lib/redux/hooks'
import { toggleSidebar } from '@/lib/redux/slices/ui-slice'

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/dashboard/profile', label: 'Profile', icon: '👤' },
  { href: '/dashboard/tutors', label: 'Find Tutors', icon: '🎓' },
  { href: '/dashboard/bookings', label: 'My Bookings', icon: '📅' },
  { href: '/dashboard/messages', label: 'Messages', icon: '💬' },
]

const tutorMenuItems = [
  { href: '/dashboard/tutor/profile', label: 'Tutor Profile', icon: '👨‍🏫' },
  { href: '/dashboard/availability', label: 'Availability', icon: '⏰' },
  { href: '/dashboard/tutor/bookings', label: 'Student Bookings', icon: '📝' },
  { href: '/dashboard/earnings', label: 'Earnings', icon: '💰' },
]

export function Sidebar() {
  const dispatch = useAppDispatch()
  const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen)
  const userRole = useAppSelector((state) => state.auth.user?.role)

  return (
    <aside
      className={`bg-background border-r border-border transition-all duration-300 ${
        sidebarOpen ? 'w-64' : 'w-20'
      }`}
    >
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-lg">
              SB
            </div>
            {sidebarOpen && <span className="font-bold text-foreground">Skill Bridge</span>}
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-foreground hover:bg-input transition-colors"
              title={!sidebarOpen ? item.label : undefined}
            >
              <span className="text-xl">{item.icon}</span>
              {sidebarOpen && <span className="text-sm">{item.label}</span>}
            </Link>
          ))}

          {userRole === 'TUTOR' && (
            <>
              <div className="border-t border-border my-3 pt-3">
                {sidebarOpen && (
                  <p className="px-3 text-xs font-semibold text-muted uppercase tracking-wide mb-2">
                    Tutor Tools
                  </p>
                )}
              </div>
              {tutorMenuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-foreground hover:bg-input transition-colors"
                  title={!sidebarOpen ? item.label : undefined}
                >
                  <span className="text-xl">{item.icon}</span>
                  {sidebarOpen && <span className="text-sm">{item.label}</span>}
                </Link>
              ))}
            </>
          )}
        </nav>

        <div className="p-3 border-t border-border">
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="w-full px-3 py-2 rounded-lg text-foreground hover:bg-input transition-colors text-sm"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>
    </aside>
  )
}
