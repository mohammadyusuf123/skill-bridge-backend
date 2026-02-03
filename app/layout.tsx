import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import Providers from '@/providers'

const geistSans = Geist({ subsets: ['latin'] })
const geistMono = Geist_Mono({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Skill Bridge - Connect with Expert Tutors',
  description: 'Find and book qualified tutors for personalized learning sessions',
  keywords: ['tutoring', 'online learning', 'skill development', 'educational platform'],
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#ffffff',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} font-sans antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
