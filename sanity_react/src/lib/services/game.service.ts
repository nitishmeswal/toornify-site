import { api, handleApiError } from '@/lib/api-client';
import { API_CONFIG } from '@/lib/api-config';

export interface Game {
  _id: string;
  id?: string; // Alternative ID field
  name: string;
  description?: string;
  image?: string;
  gameBannerPhoto?: string; // Game banner image
  category?: string;
  platform?: string[];
  releaseDate?: string;
}

export const gameService = {
  /**
   * Get all games
   */
  async getAll(): Promise<Game[]> {
    try {
      const response = await api.get<{ success: boolean; data: Game[] }>(
        API_CONFIG.GAMES.GET_ALL
      );
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get game by ID
   */
  async getById(id: string): Promise<Game> {
    try {
      const response = await api.get<{ success: boolean; data: Game }>(
        API_CONFIG.GAMES.GET_BY_ID(id)
      );
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};

export default gameService;
