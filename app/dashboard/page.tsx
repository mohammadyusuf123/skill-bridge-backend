'use client'

import { useAuth } from '@/lib/auth/auth-provider'
import { useGetProfile } from '@/lib/hooks/use-users'
import { useAppSelector } from '@/lib/redux/hooks'
import { redirect } from 'next/navigation'

export default function DashboardPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const user = useAppSelector((state) => state.auth.user)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    redirect('/auth/signin')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Welcome, {user?.name || user?.email}</h1>
        <p className="text-muted mt-2">Manage your profile and bookings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted">Your Role</p>
              <p className="text-lg font-semibold text-foreground capitalize">{user?.role?.toLowerCase()}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted">Account Status</p>
              <p className="text-lg font-semibold text-success">{user?.status || 'Active'}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted">Member Since</p>
              <p className="text-lg font-semibold text-foreground">2024</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <a href="/dashboard/profile" className="btn-secondary text-left">
            Edit Profile
          </a>
          {user?.role === 'TUTOR' && (
            <>
              <a href="/dashboard/tutor/profile" className="btn-secondary text-left">
                Manage Tutor Profile
              </a>
              <a href="/dashboard/availability" className="btn-secondary text-left">
                Set Availability
              </a>
            </>
          )}
          <a href="/dashboard/bookings" className="btn-secondary text-left">
            My Bookings
          </a>
        </div>
      </div>
    </div>
  )
}
