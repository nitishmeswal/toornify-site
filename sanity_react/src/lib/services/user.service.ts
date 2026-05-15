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
  bio?: string;
  image?: string;
  profilePic?: string;
  banner?: string;
  firstName?: string;
  lastName?: string;
  dob?: string;
  country?: string;
  city?: string;
  socialLinks?: {
    twitter?: string;
    discord?: string;
    twitch?: string;
    instagram?: string;
    youtube?: string;
    website?: string;
  };
  // Player Specific
  education?: {
    institution: string;
    status: string;
    gradYear: string;
  }[];
  gameProfiles?: {
    gameId: string; // or generic string if ID not available
    ign: string;
    rank: string;
    platformId?: string;
  }[];
  // Organiser Specific
  organization?: {
    name: string;
    type: string;
    description?: string;
  };
  // Creator Specific
  creatorProfile?: {
    tags: string[];
    primaryContent: string;
    platforms: {
      platform: string;
      handle: string;
      followers: string;
    }[];
    monetization?: {
      openToWork: boolean;
      hourlyRate?: string;
      services?: string[];
    };
  };
}

export interface UpdateProfileData {
  username?: string;
  name?: string; // Keeping for backward compatibility
  firstName?: string;
  lastName?: string;
  bio?: string;
  image?: string;
  dob?: string;
  country?: string;
  city?: string;
  role?: string;
  socialLinks?: User['socialLinks'];
  // Extended fields
  education?: User['education'];
  gameProfiles?: User['gameProfiles'];
  organization?: User['organization'];
  creatorProfile?: User['creatorProfile'];
  // File fields for multipart upload
  profilePic?: string | File;
  bannerPic?: string | File;
  banner?: string | File; // Alias for bannerPic
  logo?: string | File;
}

export const userService = {
  /**
   * Get all players
   */
  async getPlayers(): Promise<User[]> {
    try {
      const response = await api.get<{ success: boolean; data: User[] }>(
        API_CONFIG.PLAYERS.GET_ALL
      );
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get all users
   */
  async getAll(): Promise<User[]> {
    try {
      const response = await api.get<{ success: boolean; data: User[] }>(
        API_CONFIG.USERS.GET_ALL
      );
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get user details
   */
  async getUserDetails(): Promise<User> {
    try {
      const response = await api.post<{ statusCode: number; success: boolean; data: User; message: string }>(
        API_CONFIG.USERS.GET_USER_DETAILS
      );
      return response.data.data;
    } catch (error) {
      // Re-throw the original error to preserve status codes
      throw error;
    }
  },

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User> {
    try {
      const response = await api.get<{ statusCode: number; success: boolean; data: User; message: string }>(
        API_CONFIG.USERS.GET_BY_ID(userId),
       
      );
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Update user profile
   * Supports FormData for file uploads (profilePic, bannerPic, logo)
   */
  async updateProfile(data: UpdateProfileData | FormData): Promise<User> {
    try {
      const config = data instanceof FormData ? {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      } : undefined;

      const response = await api.post<{ statusCode: number; success: boolean; data: User; message: string }>(
        API_CONFIG.USERS.UPDATE_PROFILE,
        data,
        config
      );
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};

export default userService;
