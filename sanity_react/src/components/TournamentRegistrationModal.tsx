import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';
import { teamService } from '@/lib/services';
import type { Team } from '@/lib/services/team.service';

interface TournamentRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (teamId: string, registrationTime: string) => Promise<void>;
  tournamentStartDate?: string;
  isLoading?: boolean;
}

export function TournamentRegistrationModal({
  isOpen,
  onClose,
  onSubmit,
  tournamentStartDate,
  isLoading = false,
}: TournamentRegistrationModalProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [registrationTime, setRegistrationTime] = useState<string>('');
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchTeams();
    }
  }, [isOpen]);

  const fetchTeams = async () => {
    try {
      setLoadingTeams(true);
      const userTeams = await teamService.getAll();
      setTeams(userTeams);
      
      if (userTeams.length > 0) {
        setSelectedTeamId(userTeams[0]._id);
      }
    } catch (error) {
      console.error('Failed to fetch teams:', error);
      toast.error('Failed to load teams');
    } finally {
      setLoadingTeams(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedTeamId) {
      toast.error('Please select a team');
      return;
    }

    if (!registrationTime) {
      toast.error('Please select a registration time');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(selectedTeamId, registrationTime);
      setSelectedTeamId('');
      setRegistrationTime('');
      onClose();
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // Get min and max time for registration
  const minTime = tournamentStartDate
    ? new Date(new Date(tournamentStartDate).getTime() - 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 16)
    : new Date().toISOString().slice(0, 16);

  const maxTime = tournamentStartDate
    ? new Date(tournamentStartDate).toISOString().slice(0, 16)
    : new Date(new Date().getTime() + 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 16);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gradient-to-b from-[#1e2837] to-[#16202d] border border-[#3d4450] rounded-lg shadow-2xl max-w-md w-full relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-4 right-4 p-2 hover:bg-[#3d4450] rounded-full transition-colors z-10"
        >
          <X className="h-5 w-5 text-gray-400 hover:text-white" />
        </button>

        {/* Header */}
        <div className="border-b border-[#3d4450] px-6 py-4">
          <h2 className="text-2xl font-bold text-white">Register for Tournament</h2>
          <p className="text-gray-400 text-sm mt-1">Select your team and preferred registration time</p>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-5">
          {/* Team Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Select Team *
            </label>
            {loadingTeams ? (
              <div className="flex items-center justify-center py-3 bg-[#13111c] rounded border border-[#3d3551]">
                <Loader2 className="h-5 w-5 text-purple-400 animate-spin" />
              </div>
            ) : teams.length === 0 ? (
              <div className="bg-red-900/20 border border-red-700/50 rounded p-3">
                <p className="text-red-300 text-sm">
                  No teams found. Please create or join a team first.
                </p>
              </div>
            ) : (
              <select
                value={selectedTeamId}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedTeamId(e.target.value)}
                disabled={isSubmitting}
                className="w-full bg-[#13111c] border border-[#3d3551] rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Choose a team...</option>
                {teams.map((team) => (
                  <option key={team._id} value={team._id}>
                    {team.teamname}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Time Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Registration Time *
            </label>
            <p className="text-xs text-gray-400 mb-2">
              Choose when you want to register (up to 24 hours before tournament start)
            </p>
            <Input
              type="datetime-local"
              value={registrationTime}
              onChange={(e) => setRegistrationTime(e.target.value)}
              min={minTime}
              max={maxTime}
              disabled={isSubmitting}
              className="w-full bg-[#13111c] border border-[#3d3551] rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            {tournamentStartDate && (
              <p className="text-xs text-gray-400 mt-1">
                Tournament starts: {new Date(tournamentStartDate).toLocaleString()}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#3d4450] px-6 py-4 flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 border border-[#3d4450] hover:border-purple-500 bg-[#16202d] hover:bg-[#1e2837] text-gray-400 font-semibold transition-all duration-200"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              isLoading ||
              loadingTeams ||
              teams.length === 0 ||
              !selectedTeamId ||
              !registrationTime
            }
            className="flex-1 bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] hover:from-[#A78BFA] hover:to-[#8B5CF6] text-white font-bold shadow-lg border border-purple-400/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting || isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Registering...
              </>
            ) : (
              'Register'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
