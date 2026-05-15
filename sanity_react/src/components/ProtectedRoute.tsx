import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Loader } from '@/components/ui/Loader';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireOnboarding?: boolean;
  onboardingOnly?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireOnboarding = true,
  onboardingOnly = false,
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader variant="spinner" size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to sign in page but save the attempted location
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  // Onboarding-only pages should be hidden once profile is complete
  if (onboardingOnly && user?.isProfileComplete) {
    return <Navigate to="/dashboard" state={{ from: location }} replace />;
  }

  // Check if user has completed onboarding (profile complete)
  if (requireOnboarding && !user?.isProfileComplete) {
    // Redirect to onboarding if profile is not complete
    return <Navigate to="/onboarding/select-role" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
