import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authService } from '@/lib/services';
import { handleApiError } from '@/lib/api-client';
import axios from 'axios';
import type { User as ServiceUser } from '@/lib/services/user.service';

// Use the ServiceUser type but allow id/userid flexibility if needed
// or just re-export it. For minimizing breakage, let's extend the ServiceUser
// or just use it directly if possible. 
// The current local User interface has 'id' but service has '_id'.
// To avoid refactoring the whole app for _id VS id right now, I will use a local interface
// that extends partial ServiceUser but ensures 'id' is present.

interface User {
  id: string;
  _id?: string; // Add this for compatibility
  email: string;
  username: string;
  emailVerified?: string | null;
  role: string; // Made required to match service usually, or string | undefined
  isProfileComplete?: boolean;
  discordId?: string | null;
  googleId?: string | null;
  linkedInId?: string | null;
  twoFactorActivated?: boolean;

  // Profile image fields
  image?: string;
  profilePic?: string;
  banner?: string;

  // Extended fields
  organization?: ServiceUser['organization'];
  creatorProfile?: ServiceUser['creatorProfile'];
  gameProfiles?: ServiceUser['gameProfiles'];
  education?: ServiceUser['education'];
  socialLinks?: ServiceUser['socialLinks'];
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: SignUpData) => Promise<any>;
  signOut: () => Promise<void>;
  updateUser: (user: User) => void;
  refreshUser: () => Promise<void>;
}

interface SignUpData {
  fullName: string;
  email: string;
  password: string;
  role?: 'player' | 'organiser' | 'creator';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is authenticated on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = authService.getToken();
        if (token) {
          // First, try to load user from localStorage (faster)
          const storedUser = localStorage.getItem('user');
          let hasStoredUser = false;
          
          if (storedUser) {
            try {
              const parsedUser = JSON.parse(storedUser);
              const userData = {
                id: parsedUser._id || parsedUser.id,
                _id: parsedUser._id || parsedUser.id,
                email: parsedUser.email,
                username: parsedUser.username,
                emailVerified: parsedUser.emailVerified,
                role: parsedUser.role,
                isProfileComplete: parsedUser.isProfileComplete,
                discordId: parsedUser.discordId,
                googleId: parsedUser.googleId,
                linkedInId: parsedUser.linkedInId,
                twoFactorActivated: parsedUser.twoFactorActivated,
                image: parsedUser.image,
                profilePic: parsedUser.profilePic,
                banner: parsedUser.banner,
                organization: parsedUser.organization,
                creatorProfile: parsedUser.creatorProfile,
                gameProfiles: parsedUser.gameProfiles,
                education: parsedUser.education,
                socialLinks: parsedUser.socialLinks
              };
              setUser(userData);
              hasStoredUser = true;
              console.log('InitAuth: Loaded user from localStorage');
            } catch (e) {
              console.error('Failed to parse stored user data:', e);
            }
          }
          
          // Then fetch fresh data from backend to update the cache
          try {
            const { userService } = await import('@/lib/services');
            const userData = await userService.getUserDetails();
            
            // Update with fresh data and store it
            const updatedUser = {
              id: userData._id,
              _id: userData._id,
              email: userData.email,
              username: userData.username,
              emailVerified: userData.emailVerified,
              role: userData.role,
              isProfileComplete: userData.isProfileComplete,
              discordId: userData.discordId,
              googleId: userData.googleId,
              linkedInId: userData.linkedInId,
              twoFactorActivated: userData.twoFactorActivated,
              image: userData.image,
              profilePic: userData.profilePic,
              banner: userData.banner,
              organization: userData.organization,
              creatorProfile: userData.creatorProfile,
              gameProfiles: userData.gameProfiles,
              education: userData.education,
              socialLinks: userData.socialLinks
            };
            
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            console.log('InitAuth: Updated user from backend');
          } catch (fetchError: any) {
            console.error('InitAuth: Failed to fetch fresh user data:', fetchError);
            // Only clear everything if it's a 401 error (token invalid/expired)
            if (axios.isAxiosError(fetchError) && fetchError.response?.status === 401) {
              console.warn('InitAuth: Token invalid, clearing session');
              localStorage.removeItem('authToken');
              localStorage.removeItem('refreshToken');
              localStorage.removeItem('user');
              setUser(null);
            } else if (!hasStoredUser) {
              // If we couldn't load from cache AND couldn't fetch, clear everything
              console.warn('InitAuth: No cached user and fetch failed, clearing session');
              localStorage.removeItem('authToken');
              localStorage.removeItem('refreshToken');
              localStorage.removeItem('user');
              setUser(null);
            }
            // Otherwise, keep using the cached user data
          }
        } else {
          // No token, clear stored user data
          console.log('InitAuth: No token found, clearing user data');
          localStorage.removeItem('user');
          setUser(null);
        }
      } catch (error: any) {
        console.error('InitAuth: Unexpected error:', error);
        // Only clear on 401 errors
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          setUser(null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // Listen for storage changes (e.g., logout in another tab)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'authToken' && !e.newValue) {
        // Token was removed, clear user
        setUser(null);
        localStorage.removeItem('user');
      } else if (e.key === 'user' && e.newValue) {
        // User data updated in another tab, sync it
        try {
          const parsedUser = JSON.parse(e.newValue);
          setUser({
            id: parsedUser._id || parsedUser.id,
            _id: parsedUser._id || parsedUser.id,
            email: parsedUser.email,
            username: parsedUser.username,
            emailVerified: parsedUser.emailVerified,
            role: parsedUser.role,
            isProfileComplete: parsedUser.isProfileComplete,
            discordId: parsedUser.discordId,
            googleId: parsedUser.googleId,
            linkedInId: parsedUser.linkedInId,
            twoFactorActivated: parsedUser.twoFactorActivated,
            organization: parsedUser.organization,
            creatorProfile: parsedUser.creatorProfile,
            gameProfiles: parsedUser.gameProfiles,
            education: parsedUser.education,
            socialLinks: parsedUser.socialLinks
          });
        } catch (e) {
          console.error('Failed to sync user data from storage:', e);
        }
      }
    };

    // Listen for token expiration events from api-client
    const handleTokenExpired = () => {
      console.log('Token expired event received, clearing user state');
      setUser(null);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth:token-expired', handleTokenExpired);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth:token-expired', handleTokenExpired);
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('SignIn: Starting signin process');
      const response = await authService.signIn({ email, password });
      console.log('SignIn: Received response:', response);
      
      // Validate response structure
      if (!response || !response.data) {
        console.error('SignIn: Invalid response structure:', response);
        throw new Error('Invalid response from server. Please try again.');
      }
      
      const loggedInUser = response.data.loggedInUser;
      
      if (!loggedInUser || !loggedInUser._id) {
        console.error('SignIn: Missing user data in response:', response);
        throw new Error('Invalid user data received from server. Please try again.');
      }

      console.log('SignIn: Setting user data:', {
        id: loggedInUser._id,
        email: loggedInUser.email,
        username: loggedInUser.username
      });

      const userData = {
        id: loggedInUser._id,
        _id: loggedInUser._id,
        email: loggedInUser.email,
        username: loggedInUser.username,
        emailVerified: loggedInUser.emailVerified,
        role: loggedInUser.role,
        isProfileComplete: loggedInUser.isProfileComplete,
        discordId: loggedInUser.discordId,
        googleId: loggedInUser.googleId,
        linkedInId: loggedInUser.linkedInId,
        twoFactorActivated: loggedInUser.twoFactorActivated,
        organization: (loggedInUser as any).organization,
        creatorProfile: (loggedInUser as any).creatorProfile,
        gameProfiles: (loggedInUser as any).gameProfiles,
        education: (loggedInUser as any).education,
        socialLinks: (loggedInUser as any).socialLinks
      };

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      
      console.log('SignIn: User state updated successfully');
    } catch (error) {
      console.error('SignIn: Error during signin:', error);
      throw error;
    }
  };

  const signUp = async (data: SignUpData) => {
    try {
      console.log('SignUp: Starting signup process');
      const response = await authService.signUp(data);
      console.log('SignUp: Received response:', response);
      
      // Check if this is a successful registration without auto-login (statusCode 200)
      if (response && response.statusCode === 200 && response.success) {
        // If the response indicates successful registration without login data,
        // just return the response without setting user
        if (!response.data || !response.data.loggedInUser) {
          console.log('SignUp: Registration successful, user needs to login');
          return response;
        }
      }
      
      // Validate response structure for auto-login scenario
      if (!response || !response.data) {
        console.error('SignUp: Invalid response structure:', response);
        throw new Error('Invalid response from server. Please try again.');
      }
      
      const loggedInUser = response.data.loggedInUser;
      
      if (!loggedInUser || !loggedInUser._id) {
        console.error('SignUp: Missing user data in response:', response);
        // Return response anyway if it's successful but without user data
        if (response.success) {
          return response;
        }
        throw new Error('Invalid user data received from server. Please try again.');
      }
      
      console.log('SignUp: Setting user data:', {
        id: loggedInUser._id,
        email: loggedInUser.email,
        username: loggedInUser.username
      });
      
      const userData = {
        id: loggedInUser._id,
        _id: loggedInUser._id,
        email: loggedInUser.email,
        username: loggedInUser.username,
        emailVerified: loggedInUser.emailVerified,
        role: loggedInUser.role,
        isProfileComplete: loggedInUser.isProfileComplete,
        discordId: loggedInUser.discordId,
        googleId: loggedInUser.googleId,
        linkedInId: loggedInUser.linkedInId,
        twoFactorActivated: loggedInUser.twoFactorActivated,
        organization: (loggedInUser as any).organization,
        creatorProfile: (loggedInUser as any).creatorProfile,
        gameProfiles: (loggedInUser as any).gameProfiles,
        education: (loggedInUser as any).education,
        socialLinks: (loggedInUser as any).socialLinks
      };

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      
      console.log('SignUp: User state updated successfully');
      return response;
    } catch (error) {
      console.error('SignUp: Error during signup:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await authService.signOut();
      setUser(null);
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Sign out error:', error);
      // Clear user state and storage even if API call fails
      setUser(null);
      localStorage.removeItem('user');
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    // Also persist to localStorage
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const refreshUser = async () => {
    try {
      const { userService } = await import('@/lib/services');
      const userData = await userService.getUserDetails();
      const updatedUser: User = {
        id: userData._id,
        _id: userData._id,
        email: userData.email,
        username: userData.username,
        emailVerified: userData.emailVerified,
        role: userData.role,
        isProfileComplete: userData.isProfileComplete,
        discordId: userData.discordId,
        googleId: userData.googleId,
        linkedInId: userData.linkedInId,
        twoFactorActivated: userData.twoFactorActivated,
        organization: userData.organization,
        creatorProfile: userData.creatorProfile,
        gameProfiles: userData.gameProfiles,
        education: userData.education,
        socialLinks: userData.socialLinks,
      };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('refreshUser: Failed to fetch user details:', error);
      throw new Error(handleApiError(error));
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    updateUser,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
