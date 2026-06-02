import { api, handleApiError } from '@/lib/api-client';
import { API_CONFIG } from '@/lib/api-config';

export interface User {
  _id: string;
  username: string;
  email: string;
  emailVerified: string | null;
  discordId: string | null;
  googleId: string | null;
  linkedInId: string | null;
  twoFactorActivated: boolean;
  role: string;
  isProfileComplete: boolean;
  eventsRegistered: string[];
  tournaments: string[];
  brackets: string[];
  games: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SignUpData {
  fullName: string;
  email: string;
  password: string;
  role?: 'player' | 'organiser' | 'creator';
}

export interface SignInData {
  email: string;
  password: string;
}

export interface AuthResponse {
  statusCode: number;
  data: {
    loggedInUser: User;
    authToken: string;
    refreshToken?: string;
  };
  message: string;
  success: boolean;
}

const LICHESS_OAUTH_STATE_KEY = 'lichess.oauth.state';
const LICHESS_OAUTH_VERIFIER_KEY = 'lichess.oauth.verifier';
const LICHESS_OAUTH_REDIRECT_KEY = 'lichess.oauth.redirectUri';
const LICHESS_TOKEN_SCOPE_KEY = 'lichessTokenScope';

const toBase64Url = (bytes: Uint8Array): string => {
  let binary = '';
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });

  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
};

const randomBase64Url = (length: number): string => {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return toBase64Url(bytes);
};

const createCodeChallenge = async (verifier: string): Promise<string> => {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return toBase64Url(new Uint8Array(digest));
};

const getLichessRedirectUri = (): string => {
  const url = new URL(window.location.origin + '/auth/callback');
  url.searchParams.set('provider', 'lichess');
  return url.toString();
};

interface LichessTokenResponse {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
  scope?: string;
  error?: string;
  error_description?: string;
}

export const authService = {
  /**
   * Sign up new user
   */
  async signUp(data: SignUpData): Promise<AuthResponse> {
    try {
      // Backend expects `name` field, not `fullName`
      const payload = {
        name: data.fullName,
        email: data.email,
        password: data.password,
        role: data.role,
      };
      const response = await api.post<any>(
        API_CONFIG.AUTH.SIGN_UP,
        payload
      );
      
      console.log('Sign up raw response:', response);
      console.log('Sign up response.data:', response.data);
      console.log('Response structure check:', {
        hasData: !!response.data,
        hasDataProperty: !!(response.data as any)?.data,
        hasLoggedInUser: !!(response.data as any)?.data?.loggedInUser,
        directLoggedInUser: !!(response.data as any)?.loggedInUser,
        isArray: Array.isArray((response.data as any)?.data?.loggedInUser || (response.data as any)?.loggedInUser),
        keys: Object.keys(response.data || {}),
        fullResponse: JSON.stringify(response.data, null, 2)
      });
      
      // Validate response exists
      if (!response.data) {
        console.error('No data in response:', response);
        throw new Error('Invalid response from server');
      }
      
      let authResponse: AuthResponse;
      
      // Handle three possible response structures:
      // 1. { data: { loggedInUser: {...}, authToken: ... } } - nested structure
      // 2. { data: { loggedInUser: [{...}], authToken: ... } } - nested with array
      // 3. { loggedInUser: {...} or [{...}], authToken: ... } - flat structure
      
      if (response.data.data && response.data.data.loggedInUser) {
        // Nested structure (expected)
        console.log('Using nested response structure');
        const loggedInUser = Array.isArray(response.data.data.loggedInUser) 
          ? response.data.data.loggedInUser[0] 
          : response.data.data.loggedInUser;
        
        authResponse = {
          ...response.data,
          data: {
            ...response.data.data,
            loggedInUser
          }
        };
      } else if (response.data.loggedInUser) {
        // Flat structure - wrap it
        console.log('Using flat response structure, wrapping it');
        const loggedInUser = Array.isArray(response.data.loggedInUser) 
          ? response.data.loggedInUser[0] 
          : response.data.loggedInUser;
        
        authResponse = {
          statusCode: response.data.statusCode || 200,
          data: {
            loggedInUser,
            authToken: response.data.authToken || response.data.token,
            refreshToken: response.data.refreshToken
          },
          message: response.data.message || 'Success',
          success: response.data.success !== false
        };
      } else {
        console.error('Cannot find user data in response. Response keys:', Object.keys(response.data));
        console.error('Full response:', response.data);
        throw new Error('Invalid response structure from server. Please check backend API.');
      }
      
      console.log('Processed authResponse:', authResponse);
      console.log('Token from response:', authResponse.data.authToken);
      
      // Store tokens if provided
      if (authResponse.data.authToken) {
        console.log('Saving auth token to localStorage');
        localStorage.setItem('authToken', authResponse.data.authToken);
      } else {
        console.warn('No token in signup response!');
      }
      
      if (authResponse.data.refreshToken) {
        console.log('Saving refresh token to localStorage');
        localStorage.setItem('refreshToken', authResponse.data.refreshToken);
      }
      
      console.log('Tokens after signup save:', {
        authToken: localStorage.getItem('authToken'),
        refreshToken: localStorage.getItem('refreshToken')
      });
      
      return authResponse;
    } catch (error) {
      console.error('Sign up error:', error);
      // Don't wrap the error, just throw it as is for better debugging
      throw error;
    }
  },

  /**
   * Sign in user
   */
  async signIn(data: SignInData): Promise<AuthResponse> {
    try {
      const response = await api.post<any>(
        API_CONFIG.AUTH.SIGN_IN,
        data
      );
      
      console.log('Sign in raw response:', response);
      console.log('Sign in response.data:', response.data);
      console.log('Response structure check:', {
        hasData: !!response.data,
        hasDataProperty: !!(response.data as any)?.data,
        hasLoggedInUser: !!(response.data as any)?.data?.loggedInUser,
        directLoggedInUser: !!(response.data as any)?.loggedInUser,
        isArray: Array.isArray((response.data as any)?.data?.loggedInUser || (response.data as any)?.loggedInUser),
        keys: Object.keys(response.data || {}),
        fullResponse: JSON.stringify(response.data, null, 2)
      });
      
      // Validate response exists
      if (!response.data) {
        console.error('No data in response:', response);
        throw new Error('Invalid response from server');
      }
      
      let authResponse: AuthResponse;
      
      // Handle three possible response structures:
      // 1. { data: { loggedInUser: {...}, authToken: ... } } - nested structure
      // 2. { data: { loggedInUser: [{...}], authToken: ... } } - nested with array
      // 3. { loggedInUser: {...} or [{...}], authToken: ... } - flat structure
      
      if (response.data.data && response.data.data.loggedInUser) {
        // Nested structure (expected)
        console.log('Using nested response structure');
        const loggedInUser = Array.isArray(response.data.data.loggedInUser) 
          ? response.data.data.loggedInUser[0] 
          : response.data.data.loggedInUser;
        
        authResponse = {
          ...response.data,
          data: {
            ...response.data.data,
            loggedInUser
          }
        };
      } else if (response.data.loggedInUser) {
        // Flat structure - wrap it
        console.log('Using flat response structure, wrapping it');
        const loggedInUser = Array.isArray(response.data.loggedInUser) 
          ? response.data.loggedInUser[0] 
          : response.data.loggedInUser;
        
        authResponse = {
          statusCode: response.data.statusCode || 200,
          data: {
            loggedInUser,
            authToken: response.data.authToken || response.data.token,
            refreshToken: response.data.refreshToken
          },
          message: response.data.message || 'Success',
          success: response.data.success !== false
        };
      } else {
        console.error('Cannot find user data in response. Response keys:', Object.keys(response.data));
        console.error('Full response:', response.data);
        throw new Error('Invalid response structure from server. Please check backend API.');
      }
      
      console.log('Processed authResponse:', authResponse);
      console.log('Token from response:', authResponse.data.authToken);
      console.log('Refresh token from response:', authResponse.data.refreshToken);
      
      // Store tokens if provided
      if (authResponse.data.authToken) {
        console.log('Saving auth token to localStorage');
        localStorage.setItem('authToken', authResponse.data.authToken);
      } else {
        console.warn('No token in response!');
      }
      
      if (authResponse.data.refreshToken) {
        console.log('Saving refresh token to localStorage');
        localStorage.setItem('refreshToken', authResponse.data.refreshToken);
      } else {
        console.warn('No refresh token in response!');
      }
      
      console.log('Tokens after save:', {
        authToken: localStorage.getItem('authToken'),
        refreshToken: localStorage.getItem('refreshToken')
      });
      
      return authResponse;
    } catch (error) {
      console.error('Sign in error:', error);
      // Don't wrap the error, just throw it as is for better debugging
      throw error;
    }
  },

  /**
   * Sign out user
   */
  async signOut(): Promise<void> {
    try {
      await api.post(API_CONFIG.AUTH.SIGN_OUT);
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      // Clear tokens regardless of API call success
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
    }
  },

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<string> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await api.post<{ token: string }>(
        API_CONFIG.AUTH.REFRESH_TOKEN,
        { refreshToken }
      );

      const newToken = response.data.token;
      localStorage.setItem('authToken', newToken);
      return newToken;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Verify email
   */
  async verifyEmail(token: string): Promise<void> {
    try {
      await api.post(API_CONFIG.AUTH.VERIFY_EMAIL, { token });
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Request password reset
   */
  async forgotPassword(email: string): Promise<void> {
    try {
      await api.post(API_CONFIG.AUTH.FORGOT_PASSWORD, { email });
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      await api.post(API_CONFIG.AUTH.RESET_PASSWORD, {
        token,
        password: newPassword,
      });
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get current authentication status
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  },

  /**
   * Get stored token
   */
  getToken(): string | null {
    return localStorage.getItem('authToken');
  },

  /**
   * Initiate Google OAuth flow
   * Backend will handle redirect and callback, then send user to /auth/callback?token=...&user=...
   */
  async signInWithGoogle(): Promise<void> {
    try {
      console.log('Redirecting to Google OAuth...');
      console.log('Current hostname:', window.location.hostname);
      console.log('import.meta.env.MODE:', import.meta.env.MODE);
      console.log('import.meta.env.PROD:', import.meta.env.PROD);
      
      // Determine environment based on current hostname
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const isProduction = import.meta.env.PROD && !isLocalhost;
      
      console.log('import.meta.env.PROD:', import.meta.env.PROD);
      
      // Get redirect URI based on environment
      const redirectUri = isProduction
        ? (import.meta.env.VITE_OAUTH_REDIRECT_URI_PROD || import.meta.env.VITE_OAUTH_REDIRECT_URI)
        : import.meta.env.VITE_OAUTH_REDIRECT_URI;
      
      // Use production URL if in production, otherwise use configured API URL
      const baseUrl = API_CONFIG.BASE_URL;
      
      console.log('Base URL:', baseUrl);
      console.log('Redirect URI:', redirectUri);
      
      // Build auth URL with redirect URI parameter
      const authUrl = new URL(`${baseUrl}${API_CONFIG.AUTH.GOOGLE_AUTH}`);
      if (redirectUri) {
        authUrl.searchParams.set('redirect_uri', redirectUri);
        console.log('Environment:', isProduction ? 'Production' : 'Development');
        console.log('Using redirect URI:', redirectUri);
        console.log('Using API base URL:', baseUrl);
      } else {
        console.warn('No redirect URI configured!');
      }
      
      console.log('Final Auth URL:', authUrl.toString());
      
      // Direct redirect to backend Google auth endpoint
      // Backend will redirect to Google, then back to frontend /auth/callback with token and user
      window.location.href = authUrl.toString();
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Initiate Discord OAuth flow
   * Backend will handle redirect and callback, then send user to /auth/callback?token=...&user=...
   */
  async signInWithDiscord(): Promise<void> {
    try {
      console.log('Redirecting to Discord OAuth...');
      console.log('Current hostname:', window.location.hostname);
      console.log('import.meta.env.MODE:', import.meta.env.MODE);
      console.log('import.meta.env.PROD:', import.meta.env.PROD);
      
      // Determine environment based on current hostname
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const isProduction = import.meta.env.PROD && !isLocalhost;
      
      console.log('Is Production:', isProduction);
      
      // Get redirect URI based on environment
      const redirectUri = isProduction
        ? (import.meta.env.VITE_OAUTH_REDIRECT_URI_PROD || import.meta.env.VITE_OAUTH_REDIRECT_URI)
        : import.meta.env.VITE_OAUTH_REDIRECT_URI;
      
      // Use production URL if in production, otherwise use configured API URL
      const baseUrl = API_CONFIG.BASE_URL;
      
      console.log('Base URL:', baseUrl);
      console.log('Redirect URI:', redirectUri);
      
      // Build auth URL with redirect URI parameter
      const authUrl = new URL(`${baseUrl}${API_CONFIG.AUTH.DISCORD_AUTH}`);
      if (redirectUri) {
        authUrl.searchParams.set('redirect_uri', redirectUri);
        console.log('Environment:', isProduction ? 'Production' : 'Development');
        console.log('Using redirect URI:', redirectUri);
        console.log('Using API base URL:', baseUrl);
      } else {
        console.warn('No redirect URI configured!');
      }
      
      console.log('Final Auth URL:', authUrl.toString());
      
      // Direct redirect to backend Discord auth endpoint
      // Backend will redirect to Discord, then back to frontend /auth/callback with token and user
      window.location.href = authUrl.toString();
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Initiate Lichess OAuth2 Authorization Code Flow with PKCE
   */
  async signInWithLichess(): Promise<void> {
    try {
      const state = randomBase64Url(32);
      const codeVerifier = randomBase64Url(64);
      const codeChallenge = await createCodeChallenge(codeVerifier);
      const redirectUri = getLichessRedirectUri();

      sessionStorage.setItem(LICHESS_OAUTH_STATE_KEY, state);
      sessionStorage.setItem(LICHESS_OAUTH_VERIFIER_KEY, codeVerifier);
      sessionStorage.setItem(LICHESS_OAUTH_REDIRECT_KEY, redirectUri);

      const oauthUrl = new URL('/oauth', API_CONFIG.LICHESS_BASE_URL);
      oauthUrl.searchParams.set('response_type', 'code');
      oauthUrl.searchParams.set('client_id', API_CONFIG.LICHESS.CLIENT_ID);
      oauthUrl.searchParams.set('redirect_uri', redirectUri);
      oauthUrl.searchParams.set('scope', API_CONFIG.LICHESS.OAUTH_SCOPES);
      oauthUrl.searchParams.set('code_challenge_method', 'S256');
      oauthUrl.searchParams.set('code_challenge', codeChallenge);
      oauthUrl.searchParams.set('state', state);

      window.location.href = oauthUrl.toString();
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Complete Lichess OAuth callback and store token locally.
   */
  async completeLichessOAuth(params: URLSearchParams): Promise<{ username: string }> {
    const code = params.get('code');
    const state = params.get('state');
    const error = params.get('error');
    const errorDescription = params.get('error_description');

    if (error) {
      throw new Error(errorDescription ? `${error}: ${decodeURIComponent(errorDescription)}` : error);
    }

    if (!code || !state) {
      throw new Error('Missing Lichess authorization code or state.');
    }

    const storedState = sessionStorage.getItem(LICHESS_OAUTH_STATE_KEY);
    const codeVerifier = sessionStorage.getItem(LICHESS_OAUTH_VERIFIER_KEY);
    const redirectUri = sessionStorage.getItem(LICHESS_OAUTH_REDIRECT_KEY) || getLichessRedirectUri();

    if (!storedState || state !== storedState) {
      throw new Error('Invalid OAuth state. Please try connecting Lichess again.');
    }

    if (!codeVerifier) {
      throw new Error('Missing PKCE verifier. Please reconnect your Lichess account.');
    }

    const tokenResponse = await fetch(new URL('/api/token', API_CONFIG.LICHESS_BASE_URL).toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code,
        code_verifier: codeVerifier,
        redirect_uri: redirectUri,
        client_id: API_CONFIG.LICHESS.CLIENT_ID,
      }),
    });

    const tokenData = (await tokenResponse.json()) as LichessTokenResponse;
    if (!tokenResponse.ok || !tokenData.access_token) {
      throw new Error(tokenData.error_description || tokenData.error || 'Failed to exchange Lichess OAuth token.');
    }

    localStorage.setItem('lichessToken', tokenData.access_token);
    if (tokenData.scope) {
      localStorage.setItem(LICHESS_TOKEN_SCOPE_KEY, tokenData.scope);
    } else {
      localStorage.removeItem(LICHESS_TOKEN_SCOPE_KEY);
    }
    if (typeof tokenData.expires_in === 'number') {
      localStorage.setItem('lichessTokenExpiresAt', String(Date.now() + tokenData.expires_in * 1000));
    }

    const profileResponse = await fetch(
      new URL(API_CONFIG.LICHESS_ENDPOINTS.ACCOUNT_PROFILE, API_CONFIG.LICHESS_BASE_URL).toString(),
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      },
    );

    if (!profileResponse.ok) {
      throw new Error('Token created, but failed to fetch Lichess profile.');
    }

    const profile = await profileResponse.json();
    localStorage.setItem('lichessUsername', profile?.username || '');

    sessionStorage.removeItem(LICHESS_OAUTH_STATE_KEY);
    sessionStorage.removeItem(LICHESS_OAUTH_VERIFIER_KEY);
    sessionStorage.removeItem(LICHESS_OAUTH_REDIRECT_KEY);

    return { username: profile?.username || '' };
  },
};

export default authService;
