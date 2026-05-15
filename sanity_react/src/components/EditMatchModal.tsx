import { useState } from 'react';
import { X, Trophy } from 'lucide-react';
import { Button } from './ui/Button';
import type { BracketMatch } from '@/lib/services';
import { getPreferredTeamLogo } from '@/lib/utils';

interface EditMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: BracketMatch | null;
  onSubmit: (data: { team1Score: number; team2Score: number; winner: string; state: string }) => void;
}

export function EditMatchModal({ isOpen, onClose, match, onSubmit }: EditMatchModalProps) {
  const [team1Score, setTeam1Score] = useState(match?.team1?.score || 0);
  const [team2Score, setTeam2Score] = useState(match?.team2?.score || 0);
  const [state, setState] = useState<'pending' | 'in_progress' | 'completed'>(
    match?.state || 'pending'
  );

  if (!isOpen || !match) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let winner = '';
    if (state === 'completed') {
      if (team1Score > team2Score) {
        winner = match.team1?.id || '';
      } else if (team2Score > team1Score) {
        winner = match.team2?.id || '';
      }
    }

    onSubmit({
      team1Score,
      team2Score,
      winner,
      state,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-gradient-to-b from-[#1f1a2e] to-[#18152a] border border-[#3d3551] rounded-lg w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#3d3551]">
          <h2 className="text-xl font-bold text-white">Edit Match Result</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Match Status */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Match Status
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'pending', label: 'Pending', color: 'gray' },
                { value: 'in_progress', label: 'Live', color: 'green' },
                { value: 'completed', label: 'Completed', color: 'blue' },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setState(option.value as any)}
                  className={`px-4 py-2 rounded border-2 transition-all font-semibold text-sm ${
                    state === option.value
                      ? option.value === 'in_progress'
                        ? 'bg-green-500/20 border-green-500 text-green-400'
                        : option.value === 'completed'
                        ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                        : 'bg-gray-500/20 border-gray-500 text-gray-400'
                      : 'bg-[#13111c] border-[#3d3551] text-gray-400 hover:border-purple-500/50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Team 1 */}
          <div className="bg-[#13111c] border border-[#3d3551] rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              {(() => {
                const logoSrc = getPreferredTeamLogo(match.team1);
                return (
                  <>
                    <img
                      src={logoSrc || ''}
                      alt={match.team1?.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-purple-500/50"
                      style={{ display: logoSrc ? 'block' : 'none' }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                    <div 
                      className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white font-bold"
                      style={{ display: logoSrc ? 'none' : 'flex' }}
                    >
                      {match.team1?.name.charAt(0).toUpperCase()}
                    </div>
                  </>
                );
              })()}
              <div className="flex-1">
                <p className="text-white font-bold text-lg">{match.team1?.name || 'TBD'}</p>
                <p className="text-xs text-gray-400">Team 1</p>
              </div>
              {state === 'completed' && team1Score > team2Score && (
                <Trophy className="h-6 w-6 text-yellow-400" />
              )}
            </div>
            <label className="block text-sm text-gray-400 mb-2">Score</label>
            <input
              type="number"
              min="0"
              value={team1Score}
              onChange={(e) => setTeam1Score(Number(e.target.value))}
              className="w-full px-4 py-3 bg-[#1a1625] border border-[#3d3551] rounded text-white text-xl font-bold text-center focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
              disabled={state === 'pending'}
            />
          </div>

          {/* VS Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#3d3551]"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-gradient-to-r from-[#1f1a2e] to-[#18152a] text-gray-400 text-sm font-bold">
                VS
              </span>
            </div>
          </div>

          {/* Team 2 */}
          <div className="bg-[#13111c] border border-[#3d3551] rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              {(() => {
                const logoSrc = getPreferredTeamLogo(match.team2);
                return (
                  <>
                    <img
                      src={logoSrc || ''}
                      alt={match.team2?.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-purple-500/50"
                      style={{ display: logoSrc ? 'block' : 'none' }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                    <div 
                      className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white font-bold"
                      style={{ display: logoSrc ? 'none' : 'flex' }}
                    >
                      {match.team2?.name.charAt(0).toUpperCase()}
                    </div>
                  </>
                );
              })()}
              <div className="flex-1">
                <p className="text-white font-bold text-lg">{match.team2?.name || 'TBD'}</p>
                <p className="text-xs text-gray-400">Team 2</p>
              </div>
              {state === 'completed' && team2Score > team1Score && (
                <Trophy className="h-6 w-6 text-yellow-400" />
              )}
            </div>
            <label className="block text-sm text-gray-400 mb-2">Score</label>
            <input
              type="number"
              min="0"
              value={team2Score}
              onChange={(e) => setTeam2Score(Number(e.target.value))}
              className="w-full px-4 py-3 bg-[#1a1625] border border-[#3d3551] rounded text-white text-xl font-bold text-center focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
              disabled={state === 'pending'}
            />
          </div>

          {/* Winner Preview */}
          {state === 'completed' && (
            <div className="bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border border-yellow-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2 text-yellow-400">
                <Trophy className="h-5 w-5" />
                <p className="font-semibold">
                  Winner:{' '}
                  {team1Score > team2Score
                    ? match.team1?.name
                    : team2Score > team1Score
                    ? match.team2?.name
                    : 'Draw - Please set different scores'}
                </p>
              </div>
            </div>
          )}

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
              className="bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] hover:from-[#A78BFA] hover:to-[#7C3AED]"
              disabled={state === 'completed' && team1Score === team2Score}
            >
              Save Result
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
