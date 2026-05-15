import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
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

// Lazy load pages for better performance
const Home = lazy(() => import('@/pages/Home').then(m => ({ default: m.Home })))
const Tournaments = lazy(() => import('@/pages/Tournaments').then(m => ({ default: m.Tournaments })))
const TournamentDetails = lazy(() => import('@/pages/TournamentDetails').then(m => ({ default: m.TournamentDetails })))
const Games = lazy(() => import('@/pages/Games').then(m => ({ default: m.Games })))
const Teams = lazy(() => import('@/pages/Teams').then(m => ({ default: m.Teams })))
const TeamView = lazy(() => import('@/pages/TeamView').then(m => ({ default: m.TeamView })))
const UserProfile = lazy(() => import('@/pages/UserProfile').then(m => ({ default: m.UserProfile })))
const Bracket = lazy(() => import('@/pages/Bracket').then(m => ({ default: m.Bracket })))
const BracketDetail = lazy(() => import('@/pages/BracketDetail').then(m => ({ default: m.BracketDetail })))
const Blogs = lazy(() => import('@/pages/Blogs').then(m => ({ default: m.Blogs })))
const BlogDetail = lazy(() => import('@/pages/BlogDetail').then(m => ({ default: m.BlogDetail })))
const News = lazy(() => import('@/pages/News').then(m => ({ default: m.News })))
const AboutUs = lazy(() => import('@/pages/AboutUs').then(m => ({ default: m.AboutUs })))
const SignUp = lazy(() => import('@/pages/SignUp').then(m => ({ default: m.SignUp })))
const SignIn = lazy(() => import('@/pages/SignIn'))
const OAuthCallback = lazy(() => import('@/pages/OAuthCallback').then(m => ({ default: m.OAuthCallback })))
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const AdminPanel = lazy(() => import('@/pages/AdminPanel'))
const Studio = lazy(() => import('@/pages/Studio'))

function AppContent() {
  // Track page views on route changes
  usePageTracking();

  return (
    <>
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

// Coming Soon placeholder component
function ComingSoon({ title }: { title: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1b2838] via-[#171a21] to-[#0d1117] py-20 px-4">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-[#4c9aff] to-[#1e88e5] bg-clip-text text-transparent mb-6">
          {title}
        </h1>
        <p className="text-gray-400 text-lg">
          Coming soon...
        </p>
      </div>
    </div>
  );
}

export default App
