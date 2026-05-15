import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import { Footer } from './Footer'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const isStudioRoute = location.pathname.startsWith('/studio')

  if (isStudioRoute) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}
