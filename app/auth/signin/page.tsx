import { SignInForm } from '@/components/auth/sign-in-form'
import Link from 'next/link'

export const metadata = {
  title: 'Sign In - Skill Bridge',
  description: 'Sign in to your Skill Bridge account',
}

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-input px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">Skill Bridge</h1>
          <p className="mt-2 text-muted">Welcome back</p>
        </div>

        <SignInForm />

        <p className="text-center text-sm text-muted">
          Don't have an account?{' '}
          <Link
            href="/auth/signup"
            className="font-medium text-primary hover:text-primary-dark transition-colors"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
