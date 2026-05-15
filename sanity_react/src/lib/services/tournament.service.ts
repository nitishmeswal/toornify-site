import { api, handleApiError } from '@/lib/api-client';
import { API_CONFIG } from '@/lib/api-config';

export interface Tournament {
  _id: string;
  tournamentName: string;
  tournamentDates: {
    created: string;
  };
  organizerId: string;
  gameType: 'SOLO' | 'DUO' | 'SQUAD';
  gameId: string;
  gameBannerPhoto?: string;
  results: any[];
  teamsRegistered: any[];
  rounds: any[];
  prize: any[];
  howToX: any[];
  rules: string[];
  registeredNumber: number;
  tournamentFormat: string;
  registrationEndDate: string;
  tournamentStartDate: string;
  tournamentEndDate?: string;
  maxTeamMembers: number;
  minTeamMembers: number;
  maxTeams: number;
  minTeams: number;
  tournamentVisibility: 'public' | 'private';
  prizeConfig?: Array<{
    position: number;
    prizeType?: 'money' | 'custom';
    amount: string;
    currency: string;
    customPrize?: string;
    customPrizeValue?: string;
  }>;
  sponsors?: string[];
  selectedPlatform?: string;
  selectedTimezone?: string;
  brackets: any[];
  participants: any[];
  createdAt: string;
  updatedAt: string;
  tournamentIcon?: string;
  tournamentBanner?: string;
  organiser?: {
    _id: string;
    username: string;
    email: string;
  };
  game?: {
    _id: string;
    name: string;
    gameBannerPhoto?: string;
    players: any[];
  };
  // Legacy fields for backward compatibility
  title?: string;
  currentPlayers?: number;
  maxPlayers?: number;
  startDate?: string;
  endDate?: string;
  status?: 'upcoming' | 'ongoing' | 'completed';
  description?: string;
  entryFee?: number;
  prizePool?: number;
  visibility?: 'public' | 'private';
}

export interface TournamentFilters {
  search?: string;
  gameType?: string;
  gameId?: string;
  entryFee?: number;
  status?: string;
  page?: number;
  limit?: number;
}

export interface TournamentResponse {
  success: boolean;
  data: Tournament[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export const tournamentService = {
  /**
   * Get all tournaments with optional filters
   */
  async getAll(filters?: TournamentFilters): Promise<TournamentResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.search) params.append('search', filters.search);
      if (filters?.gameType) params.append('gameType', filters.gameType);
      if (filters?.gameId) params.append('gameId', filters.gameId);
      if (filters?.entryFee) params.append('entryFee', filters.entryFee.toString());
      if (filters?.status) params.append('status', filters.status);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const queryString = params.toString();
      const url = queryString 
        ? `${API_CONFIG.TOURNAMENTS.GET_ALL}?${queryString}`
        : API_CONFIG.TOURNAMENTS.GET_ALL;

      const response = await api.get<TournamentResponse>(url);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get tournament by ID
   */
  async getById(id: string): Promise<Tournament> {
    try {
      const response = await api.get<{ success: boolean; data: Tournament }>(
        API_CONFIG.TOURNAMENTS.GET_BY_ID(id)
      );
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Create new tournament with image uploads
   */
  async create(
    tournamentData: Omit<Partial<Tournament>, 'tournamentIcon' | 'tournamentBanner'> & { tournamentIcon?: File | string | null; tournamentBanner?: File | string | null }
  ): Promise<Tournament> {
    try {
      // Check if we need to send as FormData (if files are present)
      const hasFiles = 
        (tournamentData.tournamentIcon instanceof File) || 
        (tournamentData.tournamentBanner instanceof File);

      if (hasFiles) {
        const formData = new FormData();

        // Add all tournament data fields
        Object.entries(tournamentData).forEach(([key, value]) => {
          if (key === 'tournamentIcon' || key === 'tournamentBanner') {
            // Handle file fields separately
            if (value instanceof File) {
              formData.set(key, value);
            }
          } else if (Array.isArray(value)) {
            // Handle arrays without wrapping everything into one string.
            // This avoids payloads like: prizeConfig: ["[{...}]"]
            if (key === 'prizeConfig') {
              value.forEach((prize: any, index: number) => {
                if (!prize || typeof prize !== 'object') return;
                if (prize.position !== undefined) {
                  formData.append(`prizeConfig[${index}][position]`, String(prize.position));
                }
                if (prize.prizeType !== undefined) {
                  formData.append(`prizeConfig[${index}][prizeType]`, String(prize.prizeType));
                }
                if (prize.amount !== undefined) {
                  formData.append(`prizeConfig[${index}][amount]`, String(prize.amount));
                }
                if (prize.currency !== undefined) {
                  formData.append(`prizeConfig[${index}][currency]`, String(prize.currency));
                }
                if (prize.customPrize !== undefined) {
                  formData.append(`prizeConfig[${index}][customPrize]`, String(prize.customPrize));
                }
                if (prize.customPrizeValue !== undefined) {
                  formData.append(`prizeConfig[${index}][customPrizeValue]`, String(prize.customPrizeValue));
                }
              });
            } else if (key === 'rules' || key === 'sponsors') {
              value.forEach((item, index) => {
                if (item !== null && item !== undefined && String(item).trim() !== '') {
                  formData.append(`${key}[${index}]`, String(item));
                }
              });
            } else {
              // Generic array handling
              value.forEach((item) => {
                if (item !== null && item !== undefined) {
                  formData.append(`${key}[]`, String(item));
                }
              });
            }
          } else if (typeof value === 'object' && value !== null) {
            formData.set(key, JSON.stringify(value));
          } else if (value !== null && value !== undefined) {
            formData.set(key, String(value));
          }
        });

        const response = await api.post<{ success: boolean; data: Tournament }>(
          API_CONFIG.TOURNAMENTS.CREATE,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        return response.data.data;
      } else {
        // Send as regular JSON if no files
        const response = await api.post<{ success: boolean; data: Tournament }>(
          API_CONFIG.TOURNAMENTS.CREATE,
          tournamentData
        );
        return response.data.data;
      }
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Update tournament
   */
  async update(id: string, tournamentData: Partial<Tournament>): Promise<Tournament> {
    try {
      const response = await api.put<{ success: boolean; data: Tournament }>(
        API_CONFIG.TOURNAMENTS.UPDATE(id),
        tournamentData
      );
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Delete tournament
   */
  async delete(id: string): Promise<void> {
    try {
      await api.delete(API_CONFIG.TOURNAMENTS.DELETE(id));
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Update tournament visibility
   */
  async updateVisibility(id: string, visibility: 'public' | 'private'): Promise<Tournament> {
    try {
      const response = await api.patch<{ success: boolean; data: Tournament }>(
        API_CONFIG.TOURNAMENTS.UPDATE_VISIBILITY(),
        { id, visibility }
      );
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Register for tournament
   */
  async register(id: string, teamId: string, registrationTime?: string): Promise<any> {
    try {
      const payload: any = { tournamentId: id, teamId };
      if (registrationTime) {
        payload.registrationTime = registrationTime;
      }
      const response = await api.post(
        API_CONFIG.TOURNAMENTS.REGISTER(),
        payload
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};

export default tournamentService;
