/**
 * API Configuration
 * Environment-aware configuration with proper fallbacks
 */

// Environment detection
const isDevelopment = import.meta.env.MODE === 'development';
const isProduction = import.meta.env.MODE === 'production';

const isLocalAddress = (url?: string): boolean => {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return ['localhost', '127.0.0.1', '0.0.0.0'].includes(parsed.hostname);
  } catch {
    return /localhost|127\.0\.0\.1|0\.0\.0\.0/.test(url);
  }
};

// Environment variables with validation
const env = {
  // API URLs
  apiUrl: import.meta.env.VITE_API_URL,
  apiUrlProd: import.meta.env.VITE_API_URL_PROD,
  lichessApiUrl: import.meta.env.VITE_LICHESS_API_URL,
  lichessToken: import.meta.env.VITE_LICHESS_TOKEN,
  lichessClientId: import.meta.env.VITE_LICHESS_CLIENT_ID,
  lichessOauthScopes: import.meta.env.VITE_LICHESS_OAUTH_SCOPES,
  socketUrl: import.meta.env.VITE_SOCKET_URL,
  socketUrlProd: import.meta.env.VITE_SOCKET_URL_PROD,
  
  // OAuth Configuration
  oauthRedirectUri: import.meta.env.VITE_OAUTH_REDIRECT_URI,
  oauthRedirectUriProd: import.meta.env.VITE_OAUTH_REDIRECT_URI_PROD,
  
  // OAuth Provider IDs
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  discordClientId: import.meta.env.VITE_DISCORD_CLIENT_ID,
  
  // Sanity Configuration
  sanityProjectId: import.meta.env.VITE_SANITY_PROJECT_ID,
  sanityDataset: import.meta.env.VITE_SANITY_DATASET,
  sanityApiVersion: import.meta.env.VITE_SANITY_API_VERSION,
};

// Get appropriate URL based on environment
const getBaseUrl = (): string => {
  if (isProduction) {
    const candidate = env.apiUrlProd || env.apiUrl;
    if (candidate && !isLocalAddress(candidate)) {
      return candidate;
    }
    return 'https://toornify.azurewebsites.net';
  }
  return env.apiUrl || 'http://localhost:8002';
};

// Get OAuth redirect URI based on environment
const getOAuthRedirectUri = (): string => {
  if (isProduction) {
    const candidate = env.oauthRedirectUriProd || env.oauthRedirectUri;
    if (candidate && !isLocalAddress(candidate)) {
      return candidate;
    }
    return 'https://toornify.com/auth/callback';
  }
  return env.oauthRedirectUri || 'http://localhost:5173/auth/callback';
};

const getSocketUrl = (): string => {
  if (isProduction) {
    const candidate = env.socketUrlProd || env.socketUrl;
    if (candidate && !isLocalAddress(candidate)) return candidate;
    return 'https://toornify.azurewebsites.net';
  }
  return env.socketUrl || 'http://localhost:8002';
};

const getLichessApiUrl = (): string => {
  const candidate = env.lichessApiUrl;
  if (candidate) return candidate;

  return 'https://lichess.org';
};

export const API_CONFIG = {
  // Environment info
  ENV: {
    isDevelopment,
    isProduction,
    mode: import.meta.env.MODE,
  },

  // Base URLs
  BASE_URL: getBaseUrl(),
  LICHESS_BASE_URL: getLichessApiUrl(),
  SOCKET_URL: getSocketUrl(),
  OAUTH_REDIRECT_URI: getOAuthRedirectUri(),
  // Lichess
  LICHESS: {
    TOKEN: env.lichessToken,
    CLIENT_ID: env.lichessClientId || 'toornify-web',
    OAUTH_SCOPES: env.lichessOauthScopes || 'email:read tournament:write',
  },


  // OAuth Provider IDs
  OAUTH: {
    GOOGLE_CLIENT_ID: env.googleClientId,
    DISCORD_CLIENT_ID: env.discordClientId,
  },

  // Sanity Configuration
  SANITY: {
    PROJECT_ID: env.sanityProjectId,
    DATASET: env.sanityDataset,
    API_VERSION: env.sanityApiVersion,
  },

  // API endpoints
  TOURNAMENTS: {
    GET_ALL: '/api/v1/tournaments/getTournaments',
    GET_BY_ID: (id: string) => `/api/v1/tournaments/getTournamentById/${id}`,
    CREATE: '/api/v1/tournaments/createTournament',
    UPDATE: (id: string) => `/api/v1/tournaments/updateTournament/${id}`,
    DELETE: (id: string) => `/api/v1/tournaments/deleteTournament/${id}`,
    UPDATE_VISIBILITY: () => `/api/v1/tournaments/updateVisibility`,
    REGISTER: () => `/api/v1/tournaments/registerForTournament`,
  },
  USERS: {
    UPDATE_PROFILE: '/api/v1/users/update-profile',
    GET_USER_DETAILS: '/api/v1/users/user-details',
    GET_BY_ID: (userId: string) => `/api/v1/users/user-by-id/${userId}`, // Append userId as query param
    GET_ALL: '/api/v1/users/getAllUsers',
  },
  PLAYERS: {
    GET_ALL: '/api/v1/players',
  },
  TEAMS: {
    GET_ALL: '/api/v1/teams/getTeams',
    GET_USER_TEAMS: '/api/v1/teams/fetchUserTeams',
    CREATE: '/api/v1/teams/createTeam',
    // Upload image to server public folder, returns public URL
    // NOTE: matches server route '/uploadTeamLogo'
    UPLOAD: '/api/v1/teams/uploadTeamLogo',
    UPDATE: (id: string) => `/api/v1/teams/updateTeam/${id}`,
    DELETE: (id: string) => `/api/v1/teams/deleteTeam/${id}`,
  },
  GAMES: {
    GET_ALL: '/api/v1/games/getGames',
    GET_BY_ID: (id: string) => `/api/v1/games/getGameById/${id}`,
  },
  BRACKETS: {
    GET_ALL: '/api/v1/brackets/getBrackets',
    GET_BY_ID: (id: string) => `/api/v1/brackets/getBracketById/${id}`,
    GET_BY_TOURNAMENT: (tournamentId: string) => `/api/v1/brackets/getByTournament/${tournamentId}`,
    CREATE: '/api/v1/brackets/createBracket',
    UPDATE: (id: string) => `/api/v1/brackets/updateBracket/${id}`,
    UPDATE_MATCH: (bracketId: string, matchIndex: number) => `/api/v1/brackets/updateMatch/${bracketId}/${matchIndex}`,
    DELETE: (id: string) => `/api/v1/brackets/deleteBracket/${id}`,
    RESET: (id: string) => `/api/v1/brackets/${id}/reset`,
  },
  NEWS: {
    GET_NEWS: '/api/v1/news/getNews',
  },
  LICHESS_ENDPOINTS: {
    ACCOUNT_PROFILE: '/api/account',
    ACCOUNT_EMAIL: '/api/account/email',
    ARENA_CURRENT: '/api/tournament',
    ARENA_CREATE: '/api/tournament',
    ARENA_BY_ID: (id: string) => `/api/tournament/${encodeURIComponent(id)}`,
    ARENA_JOIN: (id: string) => `/api/tournament/${encodeURIComponent(id)}/join`,
    ARENA_WITHDRAW: (id: string) => `/api/tournament/${encodeURIComponent(id)}/withdraw`,
    ARENA_RESULTS: (id: string) => `/api/tournament/${encodeURIComponent(id)}/results`,
    ARENA_TEAMS: (id: string) => `/api/tournament/${encodeURIComponent(id)}/teams`,
    BROADCAST_TOP: '/api/broadcast/top',
    BROADCAST_ROUND_PGN: (roundId: string) => `/api/broadcast/round/${encodeURIComponent(roundId)}.pgn`,
    USER_TOURNAMENTS_CREATED: (username: string) => `/api/user/${encodeURIComponent(username)}/tournament/created`,
    USER_TOURNAMENTS_PLAYED: (username: string) => `/api/user/${encodeURIComponent(username)}/tournament/played`,
    USER_PUBLIC: (username: string) => `/api/user/${encodeURIComponent(username)}`,
    USER_GAMES_EXPORT: (username: string) => `/api/games/user/${encodeURIComponent(username)}`,
  },
  AUTH: {
    SIGN_UP: '/api/v1/auth/signup',
    SIGN_IN: '/api/v1/auth/signin',
    SIGN_OUT: '/api/v1/auth/signout',
    REFRESH_TOKEN: '/api/v1/auth/refresh',
    VERIFY_EMAIL: '/api/v1/auth/verify-email',
    FORGOT_PASSWORD: '/api/v1/auth/forgot-password',
    RESET_PASSWORD: '/api/v1/auth/reset-password',
    GOOGLE_AUTH: '/api/v1/auth/google',
    GOOGLE_CALLBACK: '/auth/callback', // Frontend callback route
    DISCORD_AUTH: '/api/v1/auth/discord',
    DISCORD_CALLBACK: '/auth/callback', // Frontend callback route
  },

  // Request configuration
  REQUEST_CONFIG: {
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  },
};

/**
 * Get full API URL
 * @param endpoint - The API endpoint
 * @returns Full URL
 */
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

/**
 * Get request config with optional overrides
 * @param overrides - Config overrides
 * @returns Request config
 */
export const getRequestConfig = (overrides: Record<string, any> = {}): Record<string, any> => {
  return {
    ...API_CONFIG.REQUEST_CONFIG,
    ...overrides,
    headers: {
      ...API_CONFIG.REQUEST_CONFIG.headers,
      ...(overrides.headers || {}),
    },
  };
};

// Log configuration on initialization (development only)
if (isDevelopment) {
  console.log('API Configuration:', {
    mode: import.meta.env.MODE,
    baseUrl: API_CONFIG.BASE_URL,
    oauthRedirectUri: API_CONFIG.OAUTH_REDIRECT_URI,
  });
}

export default API_CONFIG;
