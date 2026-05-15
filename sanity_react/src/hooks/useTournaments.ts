import { useState, useEffect, useCallback } from 'react';
import { tournamentService } from '@/lib/services';
import type { Tournament, TournamentFilters } from '@/lib/services/tournament.service';

interface UseTournamentsReturn {
  tournaments: Tournament[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  setFilters: (filters: TournamentFilters) => void;
}

/**
 * Custom hook for fetching and managing tournaments
 * @param initialFilters - Initial filter values
 * @returns Tournament data, loading state, error, and refetch function
 */
export function useTournaments(initialFilters?: TournamentFilters): UseTournamentsReturn {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TournamentFilters>(initialFilters || {});

  const fetchTournaments = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await tournamentService.getAll(filters);
      setTournaments(response.data || []);
    } catch (err: any) {
      console.error('Failed to fetch tournaments:', err);
      setError(err.message || 'Failed to load tournaments');
      setTournaments([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTournaments();
  }, [fetchTournaments]);

  return {
    tournaments,
    isLoading,
    error,
    refetch: fetchTournaments,
    setFilters,
  };
}
