import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          dark: 'hsl(var(--primary-dark))',
        },
        accent: 'hsl(var(--accent))',
        muted: 'hsl(var(--muted))',
        destructive: 'hsl(var(--destructive))',
        success: 'hsl(var(--success))',
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
      borderRadius: {
        lg: 'calc(var(--radius) + 0.5rem)',
        md: 'calc(var(--radius))',
        sm: 'calc(var(--radius) - 0.25rem)',
      },
    },
  },
  plugins: [],
}

export default config
