import Link from 'next/link'

export const metadata = {
  title: 'Skill Bridge - Connect with Expert Tutors',
  description: 'Find and book qualified tutors for personalized learning sessions',
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-input">
      <header className="border-b border-border">
        <nav className="container-app flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-lg">
              SB
            </div>
            <span className="font-bold text-foreground text-xl hidden sm:inline">Skill Bridge</span>
          </Link>
          <div className="flex gap-3">
            <Link href="/auth/signin" className="btn-secondary">
              Sign In
            </Link>
            <Link href="/auth/signup" className="btn-primary">
              Sign Up
            </Link>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <section className="container-app py-20 text-center space-y-6">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground text-balance">
            Connect with Expert Tutors
          </h1>
          <p className="text-lg text-muted max-w-2xl mx-auto text-balance">
            Get personalized learning sessions from qualified tutors. Book a session in minutes and start
            your journey to success.
          </p>
          <div className="flex gap-4 justify-center flex-wrap pt-6">
            <Link href="/auth/signup" className="btn-primary px-8 py-3 text-lg">
              Get Started
            </Link>
            <Link href="/auth/signin" className="btn-secondary px-8 py-3 text-lg">
              Browse Tutors
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="container-app py-20 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card text-center space-y-3">
            <div className="text-4xl">🎓</div>
            <h3 className="text-xl font-semibold text-foreground">Expert Tutors</h3>
            <p className="text-muted">Connect with highly qualified tutors in your field of interest</p>
          </div>

          <div className="card text-center space-y-3">
            <div className="text-4xl">⏰</div>
            <h3 className="text-xl font-semibold text-foreground">Flexible Scheduling</h3>
            <p className="text-muted">Book sessions that fit your schedule with ease</p>
          </div>

          <div className="card text-center space-y-3">
            <div className="text-4xl">💰</div>
            <h3 className="text-xl font-semibold text-foreground">Affordable Rates</h3>
            <p className="text-muted">Find tutors at prices that work for you</p>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container-app py-20 text-center bg-primary text-white rounded-lg space-y-6">
          <h2 className="text-3xl font-bold">Ready to Start Learning?</h2>
          <p className="text-lg opacity-90 max-w-xl mx-auto">
            Join thousands of students already learning with Skill Bridge tutors
          </p>
          <Link href="/auth/signup" className="inline-block bg-white text-primary px-8 py-3 font-semibold rounded-lg hover:bg-input transition-colors">
            Create Your Account
          </Link>
        </section>
      </main>

      <footer className="border-t border-border bg-background">
        <div className="container-app py-8 text-center text-muted text-sm">
          <p>&copy; 2024 Skill Bridge. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
