import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import LandingNavbar from './landing/LandingNavbar'
import LandingFooter from './landing/LandingFooter'

interface LayoutProps {
  children: ReactNode
}

// Routes that manage their own chrome (no public navbar/footer)
const BARE_ROUTES = [
  '/',                 // HomeNew has its own composition
  '/studio',
  '/dashboard',
  '/admin',
  '/sign-in',
  '/sign-up',
  '/auth',
  '/onboarding',
  '/select-role',
]

export function Layout({ children }: LayoutProps) {
  const { pathname } = useLocation()
  const isBare = BARE_ROUTES.some((p) => pathname === p || pathname.startsWith(p + '/'))

  if (isBare) return <>{children}</>

  return (
    // bg removed: GlobalBackground (mounted in App.tsx) paints the video
    // + scrim behind the entire app. We keep `relative z-10` so this
    // layout stacks ABOVE the global background's fixed layers.
    <div className="min-h-screen text-white overflow-x-hidden relative z-10">
      <LandingNavbar />
      <main>{children}</main>
      <LandingFooter />
    </div>
  )
}
