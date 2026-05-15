import { api, handleApiError } from '@/lib/api-client';
import { API_CONFIG } from '@/lib/api-config';

export interface BracketMatch {
  id: string;
  round: number;
  roundName: string;
  team1: {
    id: string;
    name: string;
    logo?: string;
    score?: number;
  } | null;
  team2: {
    id: string;
    name: string;
    logo?: string;
    score?: number;
  } | null;
  winner?: string;
  nextMatchId?: string;
  startTime?: string;
  state?: 'pending' | 'in_progress' | 'completed';
}

export interface Bracket {
  _id: string;
  tournament_id: string;
  tournament_name: string;
  format: 'single_elimination' | 'double_elimination' | 'round_robin';
  consolationFinal: boolean;
  grandFinalType: string;
  teams: string[];
  matches: BracketMatch[];
  userId: string;
  status: 'draft' | 'active' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface CreateBracketInput {
  tournament_id: string;
  tournament_name: string;
  format: 'single_elimination' | 'double_elimination' | 'round_robin';
  teams: string[];
  consolationFinal?: boolean;
  grandFinalType?: string;
}

export interface UpdateMatchInput {
  team1Score?: number;
  team2Score?: number;
  winner?: string;
  state?: 'pending' | 'in_progress' | 'completed';
}

export const bracketService = {
  /**
   * Get all brackets
   */
  async getAll(): Promise<Bracket[]> {
    try {
      const response = await api.get<{ success: boolean; data: Bracket[] }>(
        API_CONFIG.BRACKETS.GET_ALL
      );
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get bracket by ID
   */
  async getById(id: string): Promise<Bracket> {
    try {
      const response = await api.get<{ success: boolean; data: Bracket }>(
        API_CONFIG.BRACKETS.GET_BY_ID(id)
      );
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get brackets by tournament ID
   */
  async getByTournament(tournamentId: string): Promise<Bracket[]> {
    try {
      const response = await api.get<{ success: boolean; data: Bracket[] }>(
        API_CONFIG.BRACKETS.GET_BY_TOURNAMENT(tournamentId)
      );
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Create new bracket
   */
  async create(data: CreateBracketInput): Promise<Bracket> {
    try {
      const response = await api.post<{ success: boolean; data: Bracket }>(
        API_CONFIG.BRACKETS.CREATE,
        data
      );
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Update match result
   */
  async updateMatch(
    bracketId: string,
    matchIndex: number,
    data: UpdateMatchInput
  ): Promise<Bracket> {
    try {
      const response = await api.patch<{ success: boolean; data: Bracket }>(
        API_CONFIG.BRACKETS.UPDATE_MATCH(bracketId, matchIndex),
        data
      );
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Delete bracket
   */
  async delete(id: string): Promise<void> {
    try {
      await api.delete(API_CONFIG.BRACKETS.DELETE(id));
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Reset bracket (clear all match results)
   */
  async reset(id: string): Promise<Bracket> {
    try {
      const response = await api.post<{ success: boolean; data: Bracket }>(
        API_CONFIG.BRACKETS.RESET(id)
      );
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};

export default bracketService;
