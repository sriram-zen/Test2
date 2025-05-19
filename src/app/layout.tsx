import './globals.css'
import { ReactNode } from 'react'
import { Inter } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import Link from 'next/link'
import HeaderAuth from '../components/header-auth'
import ThemeSwitcher from '../components/theme-switcher'
import { envVarsMissing } from '../components/env-var-warning'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Multi-Instance Platform',
  description: 'Dynamic theming and instance support.',
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  // Optionally, detect instance from cookies, headers, or path if needed
  // For MVP, use a static theme color, but the structure allows for future dynamic instance configs

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-[#F7F9F8] min-h-screen`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <header className="w-full shadow-sm bg-[#043933] text-white px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="font-extrabold text-xl tracking-tight flex items-center gap-2">
                <span className="inline-block w-6 h-6 rounded-full bg-white flex items-center justify-center text-[#043933] font-black">M</span>
                <span>Instance</span>
              </Link>
              <span className="ml-4 px-2 py-1 text-xs rounded bg-white/10 uppercase">MVP</span>
            </div>
            <nav className="flex gap-2 items-center text-sm">
              <Link href="/instruments" className="hover:underline">Instruments</Link>
              <Link href="/protected" className="hover:underline">Protected</Link>
              <Link href="/(instance)/home" className="hover:underline">Instance Home</Link>
              <Link href="/(admin)/dashboard" className="hover:underline">Admin</Link>
              <Link href="/(admin)/devotees/onboarding" className="hover:underline">Devotee Onboarding</Link>
              <ThemeSwitcher />
              <HeaderAuth />
            </nav>
          </header>
          {envVarsMissing && (
            <div className="max-w-2xl mx-auto mt-8">
              {envVarsMissing}
            </div>
          )}
          <main className="container mx-auto px-4 py-10 max-w-5xl">
            {children}
          </main>
          <footer className="w-full text-center py-4 text-gray-600 text-xs">
            &copy; {new Date().getFullYear()} Multi-Instance Platform. Powered by Next.js.
          </footer>
        </ThemeProvider>
      </body>
    </html>
  )
}
