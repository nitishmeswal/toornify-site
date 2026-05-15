import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/Button';
import { tournamentService, teamService } from '@/lib/services';
import type { Tournament, Team } from '@/lib/services';

interface CreateBracketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    tournament_id: string;
    tournament_name: string;
    format: 'single_elimination' | 'double_elimination' | 'round_robin';
    teams: string[];
    consolationFinal?: boolean;
    grandFinalType?: string;
  }) => void;
  preSelectedTournamentId?: string;
}

export function CreateBracketModal({
  isOpen,
  onClose,
  onSubmit,
  preSelectedTournamentId,
}: CreateBracketModalProps) {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [selectedTournamentId, setSelectedTournamentId] = useState(
    preSelectedTournamentId || ''
  );
  const [format, setFormat] = useState<'single_elimination' | 'double_elimination' | 'round_robin'>(
    'single_elimination'
  );
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [consolationFinal, setConsolationFinal] = useState(false);
  const [grandFinalType, setGrandFinalType] = useState('simple');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    try {
      const [tournamentsResponse, teamsData] = await Promise.all([
        tournamentService.getAll(),
        teamService.getAll(),
      ]);
      // tournamentService.getAll() returns { data: Tournament[] }
      const tournamentsData = tournamentsResponse.data || [];
      setTournaments(Array.isArray(tournamentsData) ? tournamentsData : []);
      setAllTeams(teamsData);
      console.log('Fetched tournaments:', tournamentsData.length);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setTournaments([]);
      setAllTeams([]);
    }
  };

  const selectedTournament = tournaments.find((t) => t._id === selectedTournamentId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTournamentId || selectedTeams.length < 2) {
      alert('Please select a tournament and at least 2 teams');
      return;
    }

    // Validate team count based on format
    if (format === 'single_elimination' || format === 'double_elimination') {
      const validCounts = [2, 4, 8, 16, 32, 64];
      if (!validCounts.includes(selectedTeams.length)) {
        alert('For elimination brackets, you need exactly 2, 4, 8, 16, 32, or 64 teams');
        return;
      }
    }

    setIsLoading(true);
    try {
      await onSubmit({
        tournament_id: selectedTournamentId,
        tournament_name: selectedTournament?.tournamentName || '',
        format,
        teams: selectedTeams,
        consolationFinal: format === 'single_elimination' ? consolationFinal : false,
        grandFinalType: format === 'double_elimination' ? grandFinalType : 'simple',
      });
      onClose();
      resetForm();
    } catch (error) {
      console.error('Failed to create bracket:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedTournamentId(preSelectedTournamentId || '');
    setFormat('single_elimination');
    setSelectedTeams([]);
    setConsolationFinal(false);
    setGrandFinalType('simple');
  };

  const toggleTeam = (teamId: string) => {
    setSelectedTeams((prev) =>
      prev.includes(teamId) ? prev.filter((id) => id !== teamId) : [...prev, teamId]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-gradient-to-b from-[#1f1a2e] to-[#18152a] border border-[#3d3551] rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#3d3551]">
          <h2 className="text-2xl font-bold text-white">Create Tournament Bracket</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Tournament Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Select Tournament *
            </label>
            <select
              value={selectedTournamentId}
              onChange={(e) => setSelectedTournamentId(e.target.value)}
              className="w-full px-4 py-3 bg-[#13111c] border border-[#3d3551] rounded text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
              required
              disabled={!!preSelectedTournamentId}
            >
              <option value="">Choose a tournament...</option>
              {tournaments.map((tournament) => (
                <option key={tournament._id} value={tournament._id}>
                  {tournament.tournamentName}
                </option>
              ))}
            </select>
          </div>

          {/* Bracket Format */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Bracket Format *
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'single_elimination', label: 'Single Elimination' },
                { value: 'double_elimination', label: 'Double Elimination' },
                { value: 'round_robin', label: 'Round Robin' },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setFormat(option.value as any)
                    console.log('Selected format:', option.value);
                  }}
                  className={`px-4 py-3 rounded border-2 transition-all font-semibold ${
                    format === option.value
                      ? 'bg-purple-500/20 border-purple-500 text-white'
                      : 'bg-[#13111c] border-[#3d3551] text-gray-400 hover:border-purple-500/50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Additional Options */}
          {format === 'single_elimination' && (
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="consolationFinal"
                checked={consolationFinal}
                onChange={(e) => setConsolationFinal(e.target.checked)}
                className="w-5 h-5 text-purple-500 bg-[#13111c] border-[#3d3551] rounded focus:ring-purple-500"
              />
              <label htmlFor="consolationFinal" className="text-gray-300 font-medium">
                Include Consolation Final (3rd place match)
              </label>
            </div>
          )}

          {format === 'double_elimination' && (
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Grand Final Type
              </label>
              <select
                value={grandFinalType}
                onChange={(e) => setGrandFinalType(e.target.value)}
                className="w-full px-4 py-3 bg-[#13111c] border border-[#3d3551] rounded text-white focus:outline-none focus:border-purple-500"
              >
                <option value="simple">Simple (1 match)</option>
                <option value="double">Double (Best of 2 if needed)</option>
              </select>
            </div>
          )}

          {/* Team Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Select Teams * ({selectedTeams.length} selected)
            </label>
            {(format === 'single_elimination' || format === 'double_elimination') && (
              <p className="text-xs text-gray-400 mb-3">
                Must select 2, 4, 8, 16, 32, or 64 teams for elimination brackets
              </p>
            )}
            <div className="max-h-64 overflow-y-auto bg-[#13111c] border border-[#3d3551] rounded">
              {allTeams.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <p>No teams available</p>
                </div>
              ) : (
                <div className="divide-y divide-[#3d3551]">
                  {allTeams.map((team) => (
                    <label
                      key={team._id}
                      className="flex items-center gap-3 p-3 hover:bg-[#1a1625] cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedTeams.includes(team._id)}
                        onChange={() => toggleTeam(team._id)}
                        className="w-5 h-5 text-purple-500 bg-[#13111c] border-[#3d3551] rounded focus:ring-purple-500"
                      />
                      <div className="flex-1">
                        <p className="text-white font-semibold">{team.teamname}</p>
                        {team.game && typeof team.game === 'object' && 'name' in team.game && (
                          <p className="text-xs text-gray-400">Game: {team.game.name}</p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#3d3551]">
            <Button
              type="button"
              onClick={onClose}
              className="bg-[#13111c] hover:bg-[#1a1625] text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || selectedTeams.length < 2 || !selectedTournamentId}
              className="bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] hover:from-[#A78BFA] hover:to-[#7C3AED]"
            >
              {isLoading ? 'Creating...' : 'Create Bracket'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
