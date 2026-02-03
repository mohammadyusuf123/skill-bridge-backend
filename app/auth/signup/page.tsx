import { SignUpForm } from '@/components/auth/sign-up-form'
import Link from 'next/link'

export const metadata = {
  title: 'Sign Up - Skill Bridge',
  description: 'Create a new Skill Bridge account',
}

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-input px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">Skill Bridge</h1>
          <p className="mt-2 text-muted">Start your learning journey</p>
        </div>

        <SignUpForm />

        <p className="text-center text-sm text-muted">
          Already have an account?{' '}
          <Link
            href="/auth/signin"
            className="font-medium text-primary hover:text-primary-dark transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
