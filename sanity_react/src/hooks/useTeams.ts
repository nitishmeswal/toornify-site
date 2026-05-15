import { useState, useEffect, useCallback } from 'react';
import { teamService } from '@/lib/services';
import type { Team } from '@/lib/services/team.service';

interface UseTeamsReturn {
  teams: Team[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  userTeamsOnly: boolean;
  setUserTeamsOnly: (value: boolean) => void;
}

/**
 * Custom hook for fetching and managing teams
 * @param userOnly - Whether to fetch only user's teams
 * @returns Team data, loading state, error, and refetch function
 */
export function useTeams(userOnly: boolean = false): UseTeamsReturn {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userTeamsOnly, setUserTeamsOnly] = useState(userOnly);

  const fetchTeams = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = userTeamsOnly 
        ? await teamService.getUserTeams()
        : await teamService.getAll();
      setTeams(data);
    } catch (err: any) {
      console.error('Failed to fetch teams:', err);
      setError(err.message || 'Failed to load teams');
      setTeams([]);
    } finally {
      setIsLoading(false);
    }
  }, [userTeamsOnly]);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  return {
    teams,
    isLoading,
    error,
    refetch: fetchTeams,
    userTeamsOnly,
    setUserTeamsOnly,
  };
}
