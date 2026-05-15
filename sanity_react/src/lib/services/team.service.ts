import { api, handleApiError } from '@/lib/api-client';
import { API_CONFIG } from '@/lib/api-config';

export interface Team {
  _id: string;
  teamname: string;
  logo?: string;
  teamIcon?: string; // Alternative field name from backend
  players: {
    _id: string;
    username: string;
    email: string;
    role: string;
    profilePic?: string;
    image?: string;
  }[];
  owner: string;
  game?: {
    _id: string;
    name: string;
    gameBannerPhoto?: string;
  };
  requests?: string[];
  isMyTeam?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTeamData {
  teamname: string;
  logo?: string;
  logo_url?: string;
  players?: string[];
  game?: string;
  role?: string;
  rank?: string;
  server?: string;
  language?: string;
}

export interface UpdateTeamData {
  name?: string;
  logo?: string;
  logo_url?: string;
  members?: string[];
  game?: string;
  role?: string;
  rank?: string;
  server?: string;
  language?: string;
}

export const teamService = {
  /**
   * Get all teams
   */
  async getAll(): Promise<Team[]> {
    try {
      const response = await api.get<{ success: boolean; data: Team[] }>(
        API_CONFIG.TEAMS.GET_ALL
      );
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Get user's teams
   */
  async getUserTeams(): Promise<Team[]> {
    try {
      const response = await api.get<{ success: boolean; data: Team[] }>(
        API_CONFIG.TEAMS.GET_USER_TEAMS,
      );
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Create new team with optional logo file upload
   */
  async create(teamData: CreateTeamData): Promise<Team> {
    try {
      const response = await api.post<{ success: boolean; data: Team }>(
        API_CONFIG.TEAMS.CREATE,
        teamData
      );
      
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Create new team with logo file upload
   */
  async createWithLogo(teamData: CreateTeamData, logoFile?: File): Promise<Team> {
    try {
      if (logoFile) {
        // Create FormData for multipart upload
        const formData = new FormData();
        
        // Add individual team data fields to FormData
        if (teamData.teamname) formData.append('teamname', teamData.teamname);
        if (teamData.logo_url) formData.append('logo_url', teamData.logo_url);
        if (teamData.players?.length) {
          teamData.players.forEach((playerId) => {
            formData.append('players[]', playerId);
          });
        }
        if (teamData.game) formData.append('game', teamData.game);
        if (teamData.role) formData.append('role', teamData.role);
        if (teamData.rank) formData.append('rank', teamData.rank);
        if (teamData.server) formData.append('server', teamData.server);
        if (teamData.language) formData.append('language', teamData.language);
        
        // Add logo file with 'logo' field name as expected by backend
        formData.append('logo', logoFile);
        
        // Important: Remove Content-Type header so axios auto-detects FormData
        // and sets multipart/form-data with proper boundary
        const response = await api.post<{ success: boolean; data: Team }>(
          API_CONFIG.TEAMS.CREATE,
          formData,
          {
            headers: {
              'Content-Type': undefined
            }
          }
        );
        
        return response.data.data;
      } else {
        // No logo file, use regular create
        return this.create(teamData);
      }
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Upload team logo file to server and return public URL.
   * If `id` is provided, it will be sent as part of the multipart body so the server can associate the file with that team.
   */
  async uploadLogo(file: File, id?: string): Promise<string> {
    try {
      const form = new FormData();
      // server expects the field name 'team_logo'
      form.append('team_logo', file);
      if (id) {
        form.append('id', id);
      }
      const response = await api.post<{ success: boolean; data: { fileUrl: string } }>(
        API_CONFIG.TEAMS.UPLOAD,
        form
      );
      // server responds with { data: { fileUrl } }
      return response.data.data.fileUrl;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Update team
   */
  async update(id: string, teamData: Partial<CreateTeamData>): Promise<Team> {
    try {
      const response = await api.put<{ success: boolean; data: Team }>(
        API_CONFIG.TEAMS.UPDATE(id),
        teamData
      );
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  /**
   * Delete team
   */
  async delete(id: string): Promise<void> {
    try {
      await api.delete(API_CONFIG.TEAMS.DELETE(id));
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },
};

export default teamService;
