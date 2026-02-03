import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'

export const metadata = {
  title: 'Dashboard - Skill Bridge',
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-input">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <div className="container-app py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
