import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader } from '@/components/ui/Loader';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/lib/services';

export function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent multiple executions
    if (hasProcessed.current) {
      console.log('OAuth Callback already processed, skipping...');
      return;
    }

    const handleCallback = async () => {
      try {
        console.log('OAuth Callback initiated');
        console.log('Current URL:', window.location.href);
        console.log('Search params:', Object.fromEntries(searchParams.entries()));

        const provider = searchParams.get('provider');

        // Lichess PKCE callback flow (separate from app auth tokens)
        if (provider === 'lichess' || (searchParams.get('code') && searchParams.get('state'))) {
          hasProcessed.current = true;

          const result = await authService.completeLichessOAuth(searchParams);

          setStatus('success');
          navigate('/dashboard', {
            replace: true,
            state: { message: result.username ? `Lichess connected: @${result.username}` : 'Lichess connected.' },
          });
          return;
        }
        
        // New flow: Backend redirects with token and user in query params
        const token = searchParams.get('accessToken') || searchParams.get('token');
        const userParam = searchParams.get('user');
        const refreshToken = searchParams.get('refreshToken') || searchParams.get('refresh_token');
        const errorParam = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        // Check for OAuth provider errors
        if (errorParam) {
          const errorMessage = errorDescription 
            ? `${errorParam}: ${decodeURIComponent(errorDescription)}` 
            : errorParam;
          console.error('OAuth provider error:', errorMessage);
          throw new Error(errorMessage);
        }

        // Validate required parameters
        if (!token || !userParam) {
          console.error('Missing token or user data in callback');
          throw new Error('Authentication data is missing. Please try again.');
        }

        // Mark as processed immediately to prevent re-runs
        hasProcessed.current = true;

        console.log('Received token:', token.substring(0, 20) + '...');
        console.log('Received user param:', userParam.substring(0, 50) + '...');

        // SECURITY: Remove sensitive data from URL
        window.history.replaceState({}, document.title, window.location.pathname);

        // Parse user data
        let user;
        try {
          user = JSON.parse(decodeURIComponent(userParam));
          console.log('Parsed user data:', user);
        } catch (parseError) {
          console.error('Failed to parse user data:', parseError);
          throw new Error('Invalid user data received. Please try again.');
        }

        // Store tokens in localStorage
        localStorage.setItem('authToken', token);
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }
        
        // Store user data in localStorage for persistence across refreshes
        // Do this AFTER tokens to ensure proper order
        const userToStore = {
          _id: user._id,
          id: user._id,
          email: user.email,
          username: user.username,
          emailVerified: user.emailVerified,
          role: user.role,
          isProfileComplete: user.isProfileComplete,
          discordId: user.discordId,
          googleId: user.googleId,
          linkedInId: user.linkedInId,
          twoFactorActivated: user.twoFactorActivated
        };
        localStorage.setItem('user', JSON.stringify(userToStore));
        
        // Verify token was stored
        const storedToken = localStorage.getItem('authToken');
        if (!storedToken) {
          throw new Error('Failed to save authentication. Please try again.');
        }
        
        // Update auth context with user data
        updateUser({
          id: user._id,
          _id: user._id,
          email: user.email,
          username: user.username,
          emailVerified: user.emailVerified,
          role: user.role,
          isProfileComplete: user.isProfileComplete,
          discordId: user.discordId,
          googleId: user.googleId,
          linkedInId: user.linkedInId,
          twoFactorActivated: user.twoFactorActivated,
        });

        console.log('OAuth callback successful:', {
          userId: user._id,
          email: user.email,
          username: user.username,
          tokenStored: !!storedToken
        });

        setStatus('success');
        
        console.log('Redirecting to home page...');
        // Redirect immediately without setTimeout to prevent re-runs
        navigate('/', { replace: true });
      } catch (err: any) {
        hasProcessed.current = true; // Mark as processed even on error
        console.error('OAuth callback error:', err);
        console.error('Error details:', {
          message: err.message,
          fullError: err
        });
        
        const errorMessage = err.message || 'Authentication failed. Please try again.';
        
        setError(errorMessage);
        setStatus('error');
        
        // Redirect to sign-in page after error
        setTimeout(() => {
          navigate('/sign-in', { replace: true });
        }, 3000);
      }
    };

    handleCallback();
  }, []); // Empty dependency array - only run once on mount

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a1625] via-[#13111c] to-[#0f0b15] px-4">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.05)_1px,transparent_1px)] bg-[size:50px_50px]" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center relative z-10"
      >
        {status === 'loading' && (
          <>
            <Loader size="lg" />
            <h2 className="text-2xl font-bold text-white mt-6 mb-2">Authenticating...</h2>
            <p className="text-gray-400">Please wait while we complete your sign in</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Success!</h2>
            <p className="text-gray-400">Redirecting you to the home page...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Authentication Failed</h2>
            <p className="text-red-400 mb-2">{error}</p>
            <p className="text-gray-400">Redirecting you back to sign in...</p>
          </>
        )}
      </motion.div>
    </div>
  );
}
