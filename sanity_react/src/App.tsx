import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { AuthProvider } from '@/context/AuthContext'
import { SocketProvider } from '@/context/SocketContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Layout } from '@/components/Layout'
import { Loader } from '@/components/ui/Loader'
import { usePageTracking } from '@/hooks/usePageTracking'
import OnboardingLayout from './components/OnboardingLayout'
import PlayerOnboarding from './pages/onborading/Player'
import OrganiserOnboarding from './pages/onborading/Organiser'
import CreatorOnboarding from './pages/onborading/Creator'
import SelectRole from './pages/SelectRole'
import { GlobalChat } from '@/components/GlobalChat'
import GlobalBackground from '@/components/effects/GlobalBackground'

// Lazy load pages for better performance
const Home = lazy(() => import('@/pages/HomeNew'))
const Pricing = lazy(() => import('@/pages/Pricing'))
const Tournaments = lazy(() => import('@/pages/Tournaments').then(m => ({ default: m.Tournaments })))
const TournamentDetails = lazy(() => import('@/pages/TournamentDetails').then(m => ({ default: m.TournamentDetails })))
const Games = lazy(() => import('@/pages/Games'))
const HowItWorks = lazy(() => import('@/pages/HowItWorks'))
const FAQ = lazy(() => import('@/pages/FAQ'))
const Contact = lazy(() => import('@/pages/Contact'))
const Teams = lazy(() => import('@/pages/Teams').then(m => ({ default: m.Teams })))
const TeamView = lazy(() => import('@/pages/TeamView').then(m => ({ default: m.TeamView })))
const UserProfile = lazy(() => import('@/pages/UserProfile').then(m => ({ default: m.UserProfile })))
const Bracket = lazy(() => import('@/pages/Bracket').then(m => ({ default: m.Bracket })))
const BracketDetail = lazy(() => import('@/pages/BracketDetail').then(m => ({ default: m.BracketDetail })))
const Blogs = lazy(() => import('@/pages/Blogs').then(m => ({ default: m.Blogs })))
const BlogDetail = lazy(() => import('@/pages/BlogDetail').then(m => ({ default: m.BlogDetail })))
const News = lazy(() => import('@/pages/News').then(m => ({ default: m.News })))
const AboutUs = lazy(() => import('@/pages/AboutUs'))
const SignUp = lazy(() => import('@/pages/SignUp').then(m => ({ default: m.SignUp })))
const SignIn = lazy(() => import('@/pages/SignIn'))
const OAuthCallback = lazy(() => import('@/pages/OAuthCallback').then(m => ({ default: m.OAuthCallback })))
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const AdminPanel = lazy(() => import('@/pages/AdminPanel'))
const Studio = lazy(() => import('@/pages/Studio'))
const Terms = lazy(() => import('@/pages/Terms'))
const Privacy = lazy(() => import('@/pages/Privacy'))

function AppContent() {
  // Track page views on route changes
  usePageTracking();

  return (
    <>
      {/* Global atmospheric backdrop — video + laser-rain on every route. */}
      <GlobalBackground />
      <Layout>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#1b2838] via-[#171a21] to-[#0d1117]">
            <Loader size="lg" />
          </div>
        }
      >
        <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/tournaments" element={<Tournaments />} />
              <Route path="/tournaments/:id" element={<TournamentDetails />} />
              <Route path="/games" element={<Games />} />
              <Route path="/teams" element={<Teams />} />
              <Route path="/teams/:id" element={<TeamView />} />
              <Route path="/users/:id" element={<UserProfile />} />
              <Route path="/bracket" element={<Bracket />} />
              <Route path="/bracket/:id" element={<BracketDetail />} />
              <Route path="/blogs" element={<Blogs />} />
              <Route path="/blogs/:slug" element={<BlogDetail />} />
              <Route path="/news" element={<News />} />
              <Route path="/about-us" element={<AboutUs />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/roadmap" element={<ComingSoon title="Roadmap" />} />
              <Route path="/docs" element={<ComingSoon title="Documentation" />} />
              <Route path="/rankings" element={<ComingSoon title="Rankings" />} />
              <Route path="/help" element={<ComingSoon title="Help Center" />} />
              <Route path="/guides" element={<ComingSoon title="Guides" />} />
              <Route path="/careers" element={<ComingSoon title="Careers" />} />
              <Route path="/partners" element={<ComingSoon title="Partner Program" />} />
              <Route path="/refund" element={<ComingSoon title="Refund Policy" />} />
              <Route path="/live" element={<ComingSoon title="Live Matches" />} />
              <Route path="/sign-in" element={<SignIn />} />
              <Route path="/sign-up" element={<SignUp />} />
              <Route path="/auth/callback" element={<OAuthCallback />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminPanel />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/studio/*"
                element={
                  <ProtectedRoute>
                    <Studio />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/onboarding/select-role"
                element={
                  <ProtectedRoute requireOnboarding={false} onboardingOnly>
                    <SelectRole />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/onboarding"
                element={
                  <ProtectedRoute requireOnboarding={false} onboardingOnly>
                    <OnboardingLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="player" element={<PlayerOnboarding />} />
                <Route path="organiser" element={<OrganiserOnboarding />} />
                <Route path="creator" element={<CreatorOnboarding />} />
              </Route>


              <Route path="*" element={<ComingSoon title="Page Not Found" />} />
            </Routes>
          </Suspense>
        </Layout>
      <GlobalChat />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <AppContent />
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

function ComingSoon({ title }: { title: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md mx-auto text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-purple-500/10 ring-1 ring-purple-400/30 flex items-center justify-center">
          <span className="text-2xl">🚧</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-3">
          {title}
        </h1>
        <p className="text-gray-400 text-sm mb-6">
          We're working on this. Check back soon.
        </p>
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}

export default App
