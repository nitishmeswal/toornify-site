import { Trophy, Clock } from 'lucide-react';
import type { BracketMatch } from '@/lib/services';
import { getPreferredTeamLogo } from '@/lib/utils';

interface CustomBracketProps {
  matches: BracketMatch[];
  onMatchClick?: (match: BracketMatch) => void;
  editable?: boolean;
}

export function CustomBracket({ matches, onMatchClick, editable = false }: CustomBracketProps) {
  // Safety check
  if (!matches || matches.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <Trophy className="h-16 w-16 mx-auto mb-4 opacity-50" />
        <p>No matches to display</p>
      </div>
    );
  }

  // Group matches by round
  const roundsMap: Record<number, BracketMatch[]> = {};
  matches.forEach((match) => {
    if (!roundsMap[match.round]) {
      roundsMap[match.round] = [];
    }
    roundsMap[match.round].push(match);
  });

  const rounds = Object.keys(roundsMap)
    .map(Number)
    .sort((a, b) => a - b);

  const renderMatch = (match: BracketMatch) => {
    const isCompleted = match.state === 'completed';
    const isInProgress = match.state === 'in_progress';

    return (
      <div
        key={match.id}
        onClick={() => editable && onMatchClick?.(match)}
        className={`bg-gradient-to-b from-[#1f1a2e] to-[#18152a] border border-[#3d3551] rounded-lg overflow-hidden mb-6 ${
          editable ? 'cursor-pointer hover:border-purple-500 transition-all' : ''
        }`}
        style={{ minWidth: '300px' }}
      >
        {/* Match Header */}
        <div className="bg-[#13111c] px-3 py-2 border-b border-[#3d3551] flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isInProgress && (
              <span className="flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
            )}
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
              {match.startTime ? new Date(match.startTime).toLocaleDateString() : 'TBD'}
            </p>
          </div>
          {isCompleted && <Trophy className="h-3 w-3 text-yellow-400" />}
        </div>

        {/* Teams */}
        <div>
          {/* Team 1 */}
          <div
            className={`flex items-center gap-3 px-4 py-3 transition-all ${
              match.winner === match.team1?.id
                ? 'bg-green-500/10 border-l-4 !border-l-green-500'
                : match.winner && match.winner !== match.team1?.id
                ? 'opacity-50'
                : 'hover:bg-[#1a1625]'
            }`}
          >
            {/* Team Logo/Avatar */}
            {(() => {
              const logoSrc = getPreferredTeamLogo(match.team1);
              return (
                <>
                  <img
                    src={logoSrc || ''}
                    alt={match.team1?.name}
                    className="w-8 h-8 rounded-full object-cover border-2 border-purple-500/50"
                    style={{ display: logoSrc ? 'block' : 'none' }}
                    onLoad={(e) => {
                      const fallback = (e.currentTarget.nextElementSibling as HTMLElement | null);
                      if (fallback) fallback.style.display = 'none';
                    }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const fallback = (e.currentTarget.nextElementSibling as HTMLElement | null);
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                  <div
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white font-bold text-sm"
                    style={{ display: logoSrc ? 'none' : 'flex' }}
                  >
                    {match.team1?.name ? match.team1.name.charAt(0).toUpperCase() : 'T'}
                  </div>
                </>
              );
            })()}

            {/* Team Name */}
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm truncate">
                {match.team1?.name || 'TBD'}
              </p>
            </div>

            {/* Score */}
            <div className="text-white font-bold text-lg px-3 py-1 bg-[#13111c] rounded">
              {match.team1?.score ?? 0}
            </div>

            {/* Winner Trophy */}
            {match.winner === match.team1?.id && (
              <Trophy className="h-5 w-5 text-yellow-400 flex-shrink-0" />
            )}
          </div>

          {/* Team 2 */}
          <div
            className={`flex items-center gap-3 px-4 py-3 border-t border-[#3d3551] transition-all ${
              match.winner === match.team2?.id
                ? 'bg-green-500/10 border-l-4 !border-l-green-500'
                : match.winner && match.winner !== match.team2?.id
                ? 'opacity-50'
                : 'hover:bg-[#1a1625]'
            }`}
          >
            {/* Team Logo/Avatar */}
            {(() => {
              const logoSrc = getPreferredTeamLogo(match.team2);
              return (
                <>
                  <img
                    src={logoSrc || ''}
                    alt={match.team2?.name}
                    className="w-8 h-8 rounded-full object-cover border-2 border-purple-500/50"
                    style={{ display: logoSrc ? 'block' : 'none' }}
                    onLoad={(e) => {
                      const fallback = (e.currentTarget.nextElementSibling as HTMLElement | null);
                      if (fallback) fallback.style.display = 'none';
                    }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const fallback = (e.currentTarget.nextElementSibling as HTMLElement | null);
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                  <div
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white font-bold text-sm"
                    style={{ display: logoSrc ? 'none' : 'flex' }}
                  >
                    {match.team2?.name ? match.team2.name.charAt(0).toUpperCase() : 'T'}
                  </div>
                </>
              );
            })()}

            {/* Team Name */}
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm truncate">
                {match.team2?.name || 'TBD'}
              </p>
            </div>

            {/* Score */}
            <div className="text-white font-bold text-lg px-3 py-1 bg-[#13111c] rounded">
              {match.team2?.score ?? 0}
            </div>

            {/* Winner Trophy */}
            {match.winner === match.team2?.id && (
              <Trophy className="h-5 w-5 text-yellow-400 flex-shrink-0" />
            )}
          </div>
        </div>

        {/* Match Footer */}
        {isInProgress && (
          <div className="bg-[#13111c] px-3 py-2 border-t border-[#3d3551] flex items-center gap-2">
            <Clock className="h-3 w-3 text-green-400" />
            <p className="text-xs text-green-400 font-semibold">LIVE</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="custom-bracket py-8">
      <div className="flex gap-8 overflow-x-auto pb-4">
        {rounds.map((roundNum) => (
          <div key={roundNum} className="flex flex-col min-w-[320px]">
            {/* Round Title */}
            <div className="text-center mb-6 px-4 sticky top-0 bg-[#0a0a0f]/95 backdrop-blur-sm py-4 z-10 rounded-lg">
              <h3 className="text-xl font-bold text-white mb-1">
                {roundsMap[roundNum][0]?.roundName || `Round ${roundNum}`}
              </h3>
              <p className="text-sm text-gray-400">
                {roundsMap[roundNum].length} {roundsMap[roundNum].length === 1 ? 'Match' : 'Matches'}
              </p>
            </div>

            {/* Matches in this round */}
            <div className="flex flex-col justify-around flex-1">
              {roundsMap[roundNum].map((match) => renderMatch(match))}
            </div>
          </div>
        ))}
      </div>

      {/* Connecting Lines SVG Overlay - Optional Enhancement */}
      <style>{`
        .custom-bracket {
          position: relative;
        }
        
        .custom-bracket::-webkit-scrollbar {
          height: 8px;
        }
        
        .custom-bracket::-webkit-scrollbar-track {
          background: #13111c;
          border-radius: 4px;
        }
        
        .custom-bracket::-webkit-scrollbar-thumb {
          background: #8B5CF6;
          border-radius: 4px;
        }
        
        .custom-bracket::-webkit-scrollbar-thumb:hover {
          background: #A78BFA;
        }
      `}</style>
    </div>
  );
}
