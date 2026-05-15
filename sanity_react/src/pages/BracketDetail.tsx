import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Loader } from "@/components/ui/Loader";
import { ArrowLeft, Trophy, Calendar, Users, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { bracketService, lichessService, teamService } from "@/lib/services";
import type {
  Bracket,
  BracketMatch,
  LichessArena,
  LichessArenaBoards,
  LichessArenaResult,
  LichessArenaStatus,
  LichessArenaTeamStanding,
  LichessTournamentBracket,
  Team,
} from "@/lib/services";
import { motion } from "framer-motion";
import { BracketVisualization } from "@/components/BracketVisualization";
import { EditMatchModal } from "@/components/EditMatchModal";
import { BackgroundEffects } from "@/components/BackgroundEffects";
import { useAuth } from "@/context/AuthContext";
import { getPreferredTeamLogo } from "@/lib/utils";

export function BracketDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bracket, setBracket] = useState<Bracket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lichessBracket, setLichessBracket] = useState<LichessTournamentBracket | null>(null);
  const [lichessStatus, setLichessStatus] = useState<LichessArenaStatus | null>(null);
  const [lichessArena, setLichessArena] = useState<LichessArena | null>(null);
  const [lichessBoards, setLichessBoards] = useState<LichessArenaBoards | null>(null);
  const [lichessResults, setLichessResults] = useState<LichessArenaResult[]>([]);
  const [lichessTeamStandings, setLichessTeamStandings] = useState<LichessArenaTeamStanding[]>([]);
  const [selectedLichessPlayer, setSelectedLichessPlayer] = useState<string | null>(null);
  const [selectedLichessPair, setSelectedLichessPair] = useState<{ player1: string; player2: string } | null>(null);
  const [refreshIntervalMs, setRefreshIntervalMs] = useState<number>(30000);
  const [isRefreshingLichess, setIsRefreshingLichess] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<BracketMatch | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchBracketDetails(id);
    }
  }, [id]);

  useEffect(() => {
    if (!id || !lichessBracket) return;

    const interval = window.setInterval(async () => {
      try {
        if (refreshIntervalMs <= 0) return;
        const status = await lichessService.getArenaStatus(id);
        setLichessStatus(status);

        if (status.status === 'ongoing') {
          const [results, teamStandings, arena, refreshedBracket, boards] = await Promise.all([
            lichessService.getArenaResults(id, { nb: 30, sheet: true }).catch(() => []),
            lichessService.getArenaTeamStandings(id).catch(() => []),
            lichessService.getArenaById(id).catch(() => null),
            lichessService.getTournamentBracket(id, { nb: 64 }).catch(() => null),
            lichessService.getArenaBoards(id).catch(() => null),
          ]);

          setLichessResults(results);
          setLichessTeamStandings(teamStandings);
          setLichessArena(arena);
          setLichessBoards(boards);
          if (refreshedBracket && refreshedBracket.rounds.length > 0) {
            setLichessBracket(refreshedBracket);
          }
        }
      } catch {
        // ignore interval fetch errors
      }
    }, refreshIntervalMs);

    return () => window.clearInterval(interval);
  }, [id, lichessBracket, refreshIntervalMs]);

  const refreshLichessDetails = async (bracketId: string) => {
    try {
      setIsRefreshingLichess(true);
      const [arena, status, results, teamStandings, refreshedBracket, boards] = await Promise.all([
        lichessService.getArenaById(bracketId).catch(() => null),
        lichessService.getArenaStatus(bracketId).catch(() => null),
        lichessService.getArenaResults(bracketId, { nb: 30, sheet: true }).catch(() => []),
        lichessService.getArenaTeamStandings(bracketId).catch(() => []),
        lichessService.getTournamentBracket(bracketId, { nb: 64 }).catch(() => null),
        lichessService.getArenaBoards(bracketId).catch(() => null),
      ]);

      setLichessArena(arena);
      setLichessStatus(status);
      setLichessResults(results);
      setLichessTeamStandings(teamStandings);
      setLichessBoards(boards);
      if (refreshedBracket && refreshedBracket.rounds.length > 0) {
        setLichessBracket(refreshedBracket);
      }
    } finally {
      setIsRefreshingLichess(false);
    }
  };

  const fetchBracketDetails = async (bracketId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      setLichessBracket(null);
      setLichessStatus(null);
      setLichessArena(null);
      setLichessBoards(null);
      setLichessResults([]);
      setLichessTeamStandings([]);
      setSelectedLichessPlayer(null);
      setSelectedLichessPair(null);

      // Lichess tournament IDs are not Mongo ObjectIds.
      // Skip local bracket endpoint to avoid ObjectId cast errors.
      if (!isMongoObjectId(bracketId)) {
        const loaded = await tryLoadLichessBracket(bracketId);
        if (loaded) return;
        throw new Error('Bracket not found');
      }
      
      const bracketData = await bracketService.getById(bracketId);
      console.log('Fetched bracket data:', bracketData);
      
      // Handle if backend returns an array instead of single object
      const bracket = Array.isArray(bracketData) ? bracketData[0] : bracketData;
      console.log('Processed bracket:', bracket);
      console.log('Bracket matches:', bracket?.matches);
      console.log('Bracket teams:', bracket?.teams);
      
      if (!bracket) {
        throw new Error('Bracket not found');
      }

      // Fetch all teams data to populate match details
      const allTeams = await teamService.getAll();
      const teamMap: Record<string, Team> = {};
      allTeams.forEach(team => {
        teamMap[team._id] = team;
      });

      // Transform matches - backend returns team objects with teamname (lowercase)
      if (bracket.matches && Array.isArray(bracket.matches)) {
        bracket.matches = bracket.matches.map((match: any, idx: number) => {
          const matchId = match._id || match.id || `match-${idx}`;
          
          return {
            id: matchId,
            round: match.round,
            roundName: match.roundName || getRoundName(match.round, bracket.matches.length),
            team1: match.team1 ? (
              typeof match.team1 === 'string' 
                ? (() => {
                    const teamObj = teamMap[match.team1];
                    return {
                      id: match.team1,
                      name: teamObj?.teamname || 'Unknown Team',
                      logo: getPreferredTeamLogo(teamObj) || '',
                      score: match.team1Score || 0,
                    };
                  })()
                : (() => {
                    return {
                      id: match.team1._id || match.team1.id || `team1-${matchId}`,
                      name: match.team1.teamname || match.team1.teamName || match.team1.name || 'Unknown Team',
                      logo: getPreferredTeamLogo(match.team1) || '',
                      score: match.team1.score || match.team1Score || 0,
                    };
                  })()
            ) : null,
            team2: match.team2 ? (
              typeof match.team2 === 'string'
                ? (() => {
                    const teamObj = teamMap[match.team2];
                    return {
                      id: match.team2,
                      name: teamObj?.teamname || 'Unknown Team',
                      logo: getPreferredTeamLogo(teamObj) || '',
                      score: match.team2Score || 0,
                    };
                  })()
                : (() => {
                    return {
                      id: match.team2._id || match.team2.id || `team2-${matchId}`,
                      name: match.team2.teamname || match.team2.teamName || match.team2.name || 'Unknown Team',
                      logo: getPreferredTeamLogo(match.team2) || '',
                      score: match.team2.score || match.team2Score || 0,
                    };
                  })()
            ) : null,
            winner: match.winner,
            state: match.state || 'pending',
            startTime: match.startTime,
            nextMatchId: match.nextMatchId,
          };
        });
      }
      
      setBracket(bracket);
    } catch (err: any) {
      console.error('Failed to fetch local bracket details:', err);

      // Fallback: allow direct Lichess tournament id in this route
      try {
        const loaded = await tryLoadLichessBracket(bracketId);
        if (loaded) {
          return;
        }
      } catch (fallbackError: any) {
        console.error('Failed to fetch Lichess bracket fallback:', fallbackError);
      }

      setError(err.message || 'Failed to load bracket details');
    } finally {
      setIsLoading(false);
    }
  };

  const tryLoadLichessBracket = async (bracketId: string): Promise<boolean> => {
    const [arena, status, results, teamStandings, boards] = await Promise.all([
      lichessService.getArenaById(bracketId).catch(() => null),
      lichessService.getArenaStatus(bracketId).catch(() => null),
      lichessService.getArenaResults(bracketId, { nb: 30, sheet: true }).catch(() => []),
      lichessService.getArenaTeamStandings(bracketId).catch(() => []),
      lichessService.getArenaBoards(bracketId).catch(() => null),
    ]);

    const fallbackBracket = await lichessService
      .getTournamentBracket(bracketId, { nb: 64 })
      .catch(() => null);

    // If we couldn't fetch any Lichess metadata, treat as invalid id.
    if (!arena && !status && results.length === 0 && !fallbackBracket) {
      return false;
    }

    const bracketData: LichessTournamentBracket =
      fallbackBracket ?? {
        tournamentId: bracketId,
        source: 'arena-sheet',
        generatedAt: new Date().toISOString(),
        rounds: [],
      };

    setBracket(null);
    setLichessBracket(bracketData);
    setLichessStatus(status);
    setLichessArena(arena);
    setLichessBoards(boards);
    setLichessResults(results);
    setLichessTeamStandings(teamStandings);
    setError(null);
    return true;
  };

  // Helper function to generate round names
  const getRoundName = (round: number, totalMatches: number): string => {
    const rounds = Math.ceil(Math.log2(totalMatches));
    if (round === rounds) return 'Final';
    if (round === rounds - 1) return 'Semi Finals';
    if (round === rounds - 2) return 'Quarter Finals';
    return `Round ${round}`;
  };

  const handleMatchClick = (match: BracketMatch) => {
    if (!user || bracket?.userId !== (user as any)._id) {
      return; // Only allow owner to edit
    }
    setSelectedMatch(match);
    setIsEditModalOpen(true);
  };

  const handleMatchUpdate = async (data: {
    team1Score: number;
    team2Score: number;
    winner: string;
    state: string;
  }) => {
    if (!bracket || !selectedMatch) return;

    const matchIndex = bracket.matches.findIndex((match) => match.id === selectedMatch.id);
    if (matchIndex < 0) {
      alert('Selected match not found in bracket');
      return;
    }

    try {
      await bracketService.updateMatch(bracket._id, matchIndex, {
        team1Score: data.team1Score,
        team2Score: data.team2Score,
        winner: data.winner,
        state: data.state as 'pending' | 'in_progress' | 'completed',
      });
      
      // Refresh bracket data
      await fetchBracketDetails(bracket._id);
      setIsEditModalOpen(false);
      setSelectedMatch(null);
    } catch (err: any) {
      console.error('Failed to update match:', err);
      alert(err.message || 'Failed to update match');
    }
  };

  const handleResetBracket = async () => {
    if (!bracket) return;
    
    if (!confirm('Are you sure you want to reset all match results? This cannot be undone.')) {
      return;
    }

    try {
      await bracketService.reset(bracket._id);
      await fetchBracketDetails(bracket._id);
    } catch (err: any) {
      console.error('Failed to reset bracket:', err);
      alert(err.message || 'Failed to reset bracket');
    }
  };

  const handleDeleteBracket = async () => {
    if (!bracket) return;
    
    if (!confirm('Are you sure you want to delete this bracket? This cannot be undone.')) {
      return;
    }

    try {
      await bracketService.delete(bracket._id);
      navigate('/bracket');
    } catch (err: any) {
      console.error('Failed to delete bracket:', err);
      alert(err.message || 'Failed to delete bracket');
    }
  };

  const formatBracketType = (format: string) => {
    switch (format) {
      case 'single_elimination':
        return 'Single Elimination';
      case 'double_elimination':
        return 'Double Elimination';
      case 'round_robin':
        return 'Round Robin';
      default:
        return format;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a1625] via-[#13111c] to-[#0f0b15] flex items-center justify-center">
        <BackgroundEffects />
        <Loader size="lg" />
      </div>
    );
  }

  if (error || !bracket) {
    if (lichessBracket) {
      const totalBracketMatches = lichessBracket.rounds.reduce((sum, round) => sum + round.matches.length, 0);
      const completedBracketMatches = lichessBracket.rounds.reduce(
        (sum, round) => sum + round.matches.filter((match) => match.status === 'completed').length,
        0,
      );
      const topPlayers = lichessResults.slice(0, 10);
      const selectedPlayer = topPlayers.find((player) => player.username === selectedLichessPlayer) ?? null;
      const selectedPlayerSheet = selectedPlayer ? normalizeSheetEntries(selectedPlayer) : [];
      const headToHeadRounds = selectedLichessPair
        ? getHeadToHeadFromArenaSheets(lichessResults, selectedLichessPair.player1, selectedLichessPair.player2)
        : [];
      const averageTopRating =
        topPlayers.length > 0
          ? Math.round(
              topPlayers.reduce((sum, player) => sum + (typeof player.rating === 'number' ? player.rating : 0), 0) /
                topPlayers.length,
            )
          : null;
      const liveBoards = [
        ...(lichessBoards?.featured ? [lichessBoards.featured] : []),
        ...(lichessBoards?.duels || []),
      ].filter((board, index, arr) => arr.findIndex((b) => b.id === board.id) === index);

      return (
        <div className="min-h-screen bg-gradient-to-b from-[#1a1625] via-[#13111c] to-[#0f0b15] py-12 px-4">
          <BackgroundEffects />
          <div className="max-w-[1920px] mx-auto relative z-10">
            <Link to="/bracket">
              <Button className="mb-4 bg-[#18152a] border border-[#3d3551] hover:border-purple-500">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Brackets
              </Button>
            </Link>

            <Card className="bg-gradient-to-b from-[#1f1a2e] to-[#18152a] border border-[#3d3551] backdrop-blur-sm mb-6">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Trophy className="h-6 w-6 text-purple-500" />
                  Lichess Tournament Bracket
                </CardTitle>
                <p className="text-sm text-gray-400">
                  Tournament: <span className="text-white font-medium">{lichessBracket.tournamentId}</span>
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button
                    onClick={() => id && refreshLichessDetails(id)}
                    className="bg-[#18152a] border border-[#3d3551] hover:border-purple-500 text-xs h-8"
                  >
                    {isRefreshingLichess ? 'Refreshing…' : 'Refresh details'}
                  </Button>
                  <select
                    value={String(refreshIntervalMs)}
                    onChange={(e) => setRefreshIntervalMs(Number(e.target.value))}
                    className="h-8 rounded-md border border-[#3d3551] bg-[#18152a] px-2 text-xs text-gray-200"
                  >
                    <option value="15000">Auto-refresh: 15s</option>
                    <option value="30000">Auto-refresh: 30s</option>
                    <option value="60000">Auto-refresh: 60s</option>
                    <option value="0">Auto-refresh: off</option>
                  </select>
                </div>
                {lichessStatus && (
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                    <span
                      className={`px-2 py-1 rounded-full border uppercase tracking-wide ${
                        lichessStatus.status === 'ongoing'
                          ? 'bg-green-500/20 text-green-400 border-green-500/30'
                          : lichessStatus.status === 'upcoming'
                            ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                            : lichessStatus.status === 'finished'
                              ? 'bg-slate-500/20 text-slate-300 border-slate-500/30'
                              : 'bg-gray-500/20 text-gray-300 border-gray-500/30'
                      }`}
                    >
                      {lichessStatus.status}
                    </span>
                    <span className="text-gray-400">Players: {lichessStatus.nbPlayers ?? '-'}</span>
                    <span className="text-gray-400">
                      {lichessStatus.status === 'ongoing'
                        ? `Running • ${formatLichessSeconds(lichessStatus.secondsToFinish)} left`
                        : lichessStatus.status === 'upcoming'
                          ? `Starts in ${formatLichessSeconds(lichessStatus.secondsToStart)}`
                          : 'Not running'}
                    </span>
                  </div>
                )}

                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div className="rounded-lg border border-[#3d3551] bg-[#13111c] px-3 py-2">
                    <p className="text-gray-400 text-xs">Players</p>
                    <p className="text-white font-semibold">{lichessStatus?.nbPlayers ?? lichessArena?.nbPlayers ?? '-'}</p>
                  </div>
                  <div className="rounded-lg border border-[#3d3551] bg-[#13111c] px-3 py-2">
                    <p className="text-gray-400 text-xs">Rounds</p>
                    <p className="text-white font-semibold">{lichessBracket.rounds.length}</p>
                  </div>
                  <div className="rounded-lg border border-[#3d3551] bg-[#13111c] px-3 py-2">
                    <p className="text-gray-400 text-xs">Matches</p>
                    <p className="text-white font-semibold">{totalBracketMatches}</p>
                  </div>
                  <div className="rounded-lg border border-[#3d3551] bg-[#13111c] px-3 py-2">
                    <p className="text-gray-400 text-xs">Completed</p>
                    <p className="text-white font-semibold">{completedBracketMatches}</p>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
              <Card className="xl:col-span-2 bg-gradient-to-b from-[#1f1a2e] to-[#18152a] border border-[#3d3551] backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Top Standings</CardTitle>
                </CardHeader>
                <CardContent>
                  {topPlayers.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-gray-400 border-b border-[#3d3551]">
                            <th className="py-2 pr-3">Rank</th>
                            <th className="py-2 pr-3">Player</th>
                            <th className="py-2 pr-3">Score</th>
                            <th className="py-2 pr-3">Rating</th>
                            <th className="py-2 pr-3">Streak</th>
                          </tr>
                        </thead>
                        <tbody>
                          {topPlayers.map((player, index) => (
                            <tr key={`${player.username}-${index}`} className="border-b border-[#2b2440] last:border-0">
                              <td className="py-2 pr-3 text-white">{player.rank ?? index + 1}</td>
                              <td className="py-2 pr-3 text-white font-medium">
                                <button
                                  onClick={() => {
                                    setSelectedLichessPlayer(player.username);
                                    setSelectedLichessPair(null);
                                  }}
                                  className={`hover:text-purple-300 ${selectedLichessPlayer === player.username ? 'text-purple-300' : ''}`}
                                >
                                  {player.username}
                                </button>
                              </td>
                              <td className="py-2 pr-3 text-emerald-400">{player.score ?? player.points ?? '-'}</td>
                              <td className="py-2 pr-3 text-gray-300">{player.rating ?? '-'}</td>
                              <td className="py-2 pr-3 text-orange-300">{player.fire ? '🔥 Hot' : '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm">
                      {lichessStatus?.status === 'upcoming'
                        ? 'No standings yet. The tournament has not started or has no players yet.'
                        : 'Standings data is not available for this tournament.'}
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-b from-[#1f1a2e] to-[#18152a] border border-[#3d3551] backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Tournament Insights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Created By</span>
                    <span className="text-white">{lichessArena?.createdBy || '-'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Starts At</span>
                    <span className="text-white">{formatLichessDate(lichessArena?.startsAt)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Finishes At</span>
                    <span className="text-white">{formatLichessDate(lichessArena?.finishesAt)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Avg Top-10 Rating</span>
                    <span className="text-white">{averageTopRating ?? '-'}</span>
                  </div>
                  <div className="pt-2 border-t border-[#3d3551]">
                    <a
                      href={`https://lichess.org/tournament/${lichessBracket.tournamentId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-purple-400 hover:text-purple-300 text-xs"
                    >
                      Open official Lichess tournament ↗
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>

            {(selectedPlayer || selectedLichessPair) && (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
                {selectedPlayer && (
                  <Card className="bg-gradient-to-b from-[#1f1a2e] to-[#18152a] border border-[#3d3551] backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-white text-lg">{selectedPlayer.username} • Round Sheet</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedPlayerSheet.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-left text-gray-400 border-b border-[#3d3551]">
                                <th className="py-2 pr-3">Round</th>
                                <th className="py-2 pr-3">Opponent</th>
                                <th className="py-2 pr-3">Color</th>
                                <th className="py-2 pr-3">Result</th>
                                <th className="py-2 pr-3">Game</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedPlayerSheet.map((entry, idx) => (
                                <tr key={`${entry.round}-${entry.opponent}-${idx}`} className="border-b border-[#2b2440] last:border-0">
                                  <td className="py-2 pr-3 text-white">{entry.round}</td>
                                  <td className="py-2 pr-3 text-gray-100">{entry.opponent}</td>
                                  <td className="py-2 pr-3 text-gray-300">{entry.color || '-'}</td>
                                  <td className="py-2 pr-3 text-emerald-400">{entry.result || '-'}</td>
                                  <td className="py-2 pr-3">
                                    {entry.gameId ? (
                                      <a
                                        href={`https://lichess.org/${entry.gameId}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-purple-400 hover:text-purple-300"
                                      >
                                        Open
                                      </a>
                                    ) : (
                                      <span className="text-gray-500">-</span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-gray-400 text-sm">No round sheet entries available for this player.</p>
                      )}
                    </CardContent>
                  </Card>
                )}

                {selectedLichessPair && (
                  <Card className="bg-gradient-to-b from-[#1f1a2e] to-[#18152a] border border-[#3d3551] backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-white text-lg">
                        Match Drill-down: {selectedLichessPair.player1} vs {selectedLichessPair.player2}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {headToHeadRounds.length > 0 ? (
                        <ul className="space-y-2 text-sm">
                          {headToHeadRounds.map((row, idx) => (
                            <li key={`${row.round}-${idx}`} className="rounded border border-[#3d3551] bg-[#13111c] p-3">
                              <p className="text-white font-medium">Round {row.round}</p>
                              <p className="text-gray-300 text-xs mt-1">{row.summary}</p>
                              {row.gameId && (
                                <a
                                  href={`https://lichess.org/${row.gameId}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-purple-400 hover:text-purple-300 text-xs mt-1 inline-block"
                                >
                                  Open game ↗
                                </a>
                              )}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-400 text-sm">No direct sheet-based head-to-head entry found yet.</p>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {lichessStatus?.status === 'ongoing' && (
              <Card className="bg-gradient-to-b from-[#1f1a2e] to-[#18152a] border border-[#3d3551] backdrop-blur-sm mb-6">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Running Games • Live Boards</CardTitle>
                </CardHeader>
                <CardContent>
                  {liveBoards.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {liveBoards.slice(0, 4).map((board) => (
                        <div key={board.id} className="rounded-lg border border-[#3d3551] bg-[#13111c] p-3">
                          <p className="text-xs text-gray-400 mb-2">
                            {board.white || 'White'} vs {board.black || 'Black'}
                          </p>
                          <div className="relative w-full aspect-[4/3] rounded overflow-hidden border border-[#2b2440]">
                            <iframe
                              src={toLichessEmbedUrl(board.id)}
                              title={`Lichess game ${board.id}`}
                              className="absolute inset-0 w-full h-full"
                              loading="lazy"
                              allowFullScreen
                            />
                          </div>
                          <a
                            href={board.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-block mt-2 text-xs text-purple-400 hover:text-purple-300"
                          >
                            Open game on Lichess ↗
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm">
                      No live boards detected yet. Click refresh and wait for active pairings to appear.
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {lichessTeamStandings.length > 0 && (
              <Card className="bg-gradient-to-b from-[#1f1a2e] to-[#18152a] border border-[#3d3551] backdrop-blur-sm mb-6">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Team Battle Standings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-gray-400 border-b border-[#3d3551]">
                          <th className="py-2 pr-3">Team</th>
                          <th className="py-2 pr-3">Score</th>
                          <th className="py-2 pr-3">Players</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lichessTeamStandings.map((team, index) => (
                          <tr key={`${team.id || team.name || 'team'}-${index}`} className="border-b border-[#2b2440] last:border-0">
                            <td className="py-2 pr-3 text-white font-medium">{team.name || team.id || '-'}</td>
                            <td className="py-2 pr-3 text-emerald-400">{team.score ?? '-'}</td>
                            <td className="py-2 pr-3 text-gray-300">{team.players ?? '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-6">
              {lichessBracket.rounds.length === 0 && (
                <Card className="bg-gradient-to-b from-[#1f1a2e] to-[#18152a] border border-[#3d3551] backdrop-blur-sm">
                  <CardContent className="py-8">
                    <p className="text-gray-300 text-sm">
                      No pairings generated yet. This is expected for upcoming tournaments or events without completed games.
                    </p>
                  </CardContent>
                </Card>
              )}

              {lichessBracket.rounds.map((round) => (
                <Card
                  key={round.round}
                  className="bg-gradient-to-b from-[#1f1a2e] to-[#18152a] border border-[#3d3551] backdrop-blur-sm"
                >
                  <CardHeader>
                    <CardTitle className="text-white text-lg">{round.roundName}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                      {round.matches.map((match) => (
                        <button
                          key={match.id}
                          onClick={() => {
                            setSelectedLichessPair({ player1: match.player1, player2: match.player2 });
                            setSelectedLichessPlayer(null);
                          }}
                          className="text-left p-3 rounded-lg border border-[#3d3551] bg-[#13111c] hover:border-purple-500 transition-colors"
                        >
                          <p className="text-sm text-white font-medium truncate">{match.player1}</p>
                          <p className="text-xs text-gray-500 my-1">vs</p>
                          <p className="text-sm text-white font-medium truncate">{match.player2}</p>
                          <p className="text-xs text-emerald-400 mt-2 uppercase tracking-wide">{match.status}</p>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a1625] via-[#13111c] to-[#0f0b15] py-12 px-4">
        <BackgroundEffects />
        <div className="max-w-[1920px] mx-auto relative z-10">
          <Card className="bg-gradient-to-b from-[#1f1a2e] to-[#18152a] border border-[#3d3551] backdrop-blur-sm">
            <CardContent className="pt-6 text-center py-20">
              <Trophy className="h-20 w-20 text-red-600 mx-auto mb-4" />
              <p className="text-red-400 text-lg mb-4">{error || 'Bracket not found'}</p>
              <Link to="/bracket">
                <Button className="bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] hover:from-[#A78BFA] hover:to-[#7C3AED]">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Brackets
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const isOwner = user && bracket.userId === (user as any)._id;
  const completedMatches = bracket.matches?.filter(m => m.winner).length || 0;
  const totalMatches = bracket.matches?.length || 0;
  const progress = totalMatches > 0 ? (completedMatches / totalMatches) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1625] via-[#13111c] to-[#0f0b15] py-12 px-4">
      <BackgroundEffects />
      <div className="max-w-[1920px] mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8">
          <Link to="/bracket">
            <Button className="mb-4 bg-[#18152a] border border-[#3d3551] hover:border-purple-500">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Brackets
            </Button>
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-6">
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                {bracket.tournament_name}
              </h1>
              <p className="text-gray-400 text-lg mb-4">
                {formatBracketType(bracket.format)}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{bracket.teams?.length || 0} Teams</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  <span>{completedMatches} / {totalMatches} Matches Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Created {new Date(bracket.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Admin Actions */}
            {isOwner && (
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={handleResetBracket}
                  className="bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/30"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
                <Button
                  onClick={handleDeleteBracket}
                  className="bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="bg-[#13111c] rounded-full h-3 overflow-hidden border border-[#3d3551]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9]"
            />
          </div>
          <p className="text-xs text-gray-400 mt-2 text-right">
            {progress.toFixed(0)}% Complete
          </p>
        </div>

        {/* Bracket Visualization */}
        <Card className="bg-gradient-to-b from-[#1f1a2e] to-[#18152a] border border-[#3d3551] backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Trophy className="h-6 w-6 text-purple-500" />
              Tournament Bracket
              {isOwner && (
                <span className="text-sm text-gray-400 font-normal ml-2">
                  (Click matches to edit)
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {bracket.matches && Array.isArray(bracket.matches) && bracket.matches.length > 0 ? (
              <BracketVisualization
                matches={bracket.matches}
                onMatchClick={handleMatchClick}
                editable={!!isOwner}
              />
            ) : (
              <div className="text-center py-20">
                <Trophy className="h-16 w-16 mx-auto mb-4 text-red-500 opacity-50" />
                <p className="text-xl font-semibold text-white mb-2">No Matches Available</p>
                <p className="text-gray-400 mb-4">
                  The bracket matches were not generated by the backend.
                </p>
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 max-w-2xl mx-auto text-left">
                  <p className="text-red-400 font-semibold mb-2">⚠️ Backend Issue</p>
                  <p className="text-sm text-red-300 mb-2">
                    The backend needs to generate the matches array when creating a bracket.
                  </p>
                  <p className="text-xs text-red-400">
                    See <code className="bg-black/30 px-2 py-1 rounded">BRACKET_BACKEND_FIX.md</code> for implementation details.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Match Modal */}
      <EditMatchModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedMatch(null);
        }}
        match={selectedMatch}
        onSubmit={handleMatchUpdate}
      />
    </div>
  );
}

function formatLichessSeconds(value?: number): string {
  if (typeof value !== 'number') return '-';
  const seconds = Math.max(0, value);
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function formatLichessDate(value?: number | string): string {
  if (typeof value === 'number' && !Number.isNaN(value)) {
    return new Date(value).toLocaleString();
  }
  if (typeof value === 'string' && value.trim()) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleString();
    }
  }
  return '-';
}

function isMongoObjectId(value: string): boolean {
  return /^[a-fA-F0-9]{24}$/.test(value);
}

function toLichessEmbedUrl(gameId: string): string {
  return `https://lichess.org/embed/game/${encodeURIComponent(gameId)}?theme=auto&bg=auto`;
}

type NormalizedSheetEntry = {
  round: number;
  opponent: string;
  color?: string;
  result?: string;
  gameId?: string;
};

function normalizeSheetEntries(player: LichessArenaResult): NormalizedSheetEntry[] {
  if (!Array.isArray(player.sheet)) return [];

  const rows: NormalizedSheetEntry[] = [];

  player.sheet.forEach((raw, index) => {
    const entry = raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
    const opponent =
      getString(entry, ['opponent', 'opp', 'o', 'username', 'u']) ||
      getString(entry, ['name']);

    if (!opponent) return;

    const resultCode = getString(entry, ['result', 'res', 'r']);
    const gameId = getString(entry, ['gameId', 'gid', 'id', 'g']);
    const color = getString(entry, ['color', 'c']);
    const result = resultCode || getNumber(entry, ['points', 'p'])?.toString();

    const normalized: NormalizedSheetEntry = {
      round: index + 1,
      opponent,
      ...(color ? { color } : {}),
      ...(result ? { result } : {}),
      ...(gameId ? { gameId } : {}),
    };

    rows.push(normalized);
  });

  return rows;
}

function getHeadToHeadFromArenaSheets(
  results: LichessArenaResult[],
  player1: string,
  player2: string,
): Array<{ round: number; summary: string; gameId?: string }> {
  const playerData = results.find((r) => r.username.toLowerCase() === player1.toLowerCase());
  if (!playerData) return [];

  const sheet = normalizeSheetEntries(playerData).filter(
    (entry) => entry.opponent.toLowerCase() === player2.toLowerCase(),
  );

  return sheet.map((entry) => ({
    round: entry.round,
    summary: `${player1} (${entry.color || '?'}) vs ${player2} • result ${entry.result || 'n/a'}`,
    gameId: entry.gameId,
  }));
}

function getString(source: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return undefined;
}

function getNumber(source: Record<string, unknown>, keys: string[]): number | undefined {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === 'string' && value.trim() !== '' && Number.isFinite(Number(value))) {
      return Number(value);
    }
  }
  return undefined;
}
