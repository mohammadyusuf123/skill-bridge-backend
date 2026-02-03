'use client'

import { ReactNode } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReduxProvider } from '@/lib/redux/provider'
import { queryClient } from '@/lib/api/query-client'
import { AuthProvider } from '@/lib/auth/auth-provider'
import { Toaster } from '@/components/ui/toaster'

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ReduxProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </QueryClientProvider>
    </ReduxProvider>
  )
}
