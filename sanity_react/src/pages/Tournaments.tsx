import { useState, useCallback, useMemo, useEffect } from "react";
import { ListFilter, Search, RefreshCw, Plus, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/ui/Loader";
import { BackgroundEffects } from "@/components/BackgroundEffects";
import { CreateTournamentModal } from "@/components/CreateTournamentModal";
import type { TournamentFormData } from "@/components/CreateTournamentModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { lichessService, tournamentService } from "@/lib/services";
import { getImageUrl } from "@/lib/utils";
import type { Tournament } from "@/lib/services/tournament.service";
import type { LichessArenaBoard, LichessArenaBoards, LichessArenaStatus } from "@/lib/services";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";

const TOURNAMENT_SOURCE_STORAGE_KEY = 'tournaments.source';


export function Tournaments() {
  const { isAuthenticated, user } = useAuth();
  const [tournamentSource, setTournamentSource] = useState<"platform" | "lichess">(() => {
    const stored = localStorage.getItem(TOURNAMENT_SOURCE_STORAGE_KEY);
    return stored === 'lichess' ? 'lichess' : 'platform';
  });
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lichessTournaments, setLichessTournaments] = useState<LichessArenaStatus[]>([]);
  const [runningLichessTournaments, setRunningLichessTournaments] = useState<LichessArenaStatus[]>([]);
  const [liveBroadcastBoards, setLiveBroadcastBoards] = useState<LichessArenaBoard[]>([]);
  const [boardsByTournament, setBoardsByTournament] = useState<Record<string, LichessArenaBoards>>({});
  const [boardsLoadingByTournament, setBoardsLoadingByTournament] = useState<Record<string, boolean>>({});
  const [joinLoadingByTournament, setJoinLoadingByTournament] = useState<Record<string, boolean>>({});
  const [isLichessLoading, setIsLichessLoading] = useState(false);
  const [lichessError, setLichessError] = useState<string | null>(null);
  const [isCreatingLichessTournament, setIsCreatingLichessTournament] = useState(false);
  const [lichessForm, setLichessForm] = useState({
    name: "",
    clockTime: "5",
    clockIncrement: "0",
    minutes: "60",
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    gameType: "",
    gameId: "",
    entryFee: "",
    status: "",
  });
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Fetch tournaments on mount and when filters change
  useEffect(() => {
    if (tournamentSource === "platform") {
      fetchTournaments();
    } else {
      fetchLichessTournaments();
    }
  }, [filters.gameType, filters.status]);

  useEffect(() => {
    if (tournamentSource === "platform") {
      fetchTournaments();
    } else {
      fetchLichessTournaments();
    }
  }, [tournamentSource]);

  useEffect(() => {
    localStorage.setItem(TOURNAMENT_SOURCE_STORAGE_KEY, tournamentSource);
  }, [tournamentSource]);

  useEffect(() => {
    if (tournamentSource !== 'lichess') return;
    if (runningLichessTournaments.length === 0) return;

    let isCancelled = false;

    const loadLiveBoardsForRunningTournaments = async () => {
      // Keep requests sequential to respect API rate limits.
      for (const tournament of runningLichessTournaments.slice(0, 6)) {
        if (isCancelled) break;

        try {
          const boards = await lichessService.getArenaBoards(tournament.id);
          if (isCancelled) break;
          setBoardsByTournament((prev) => ({ ...prev, [tournament.id]: boards }));
        } catch {
          // ignore individual board refresh errors
        }
      }

      // Also pull live boards from active broadcasts for continuously updated games.
      try {
        const broadcastBoards = await lichessService.getActiveBroadcastBoards(2, 6);
        if (!isCancelled) {
          setLiveBroadcastBoards(broadcastBoards);
        }
      } catch {
        // ignore broadcast refresh errors
      }
    };

    loadLiveBoardsForRunningTournaments();
    const interval = window.setInterval(loadLiveBoardsForRunningTournaments, 20000);

    return () => {
      isCancelled = true;
      window.clearInterval(interval);
    };
  }, [tournamentSource, runningLichessTournaments]);

  const fetchTournaments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await tournamentService.getAll({
        gameType: filters.gameType || undefined,
        status: filters.status || undefined,
      });
      setTournaments(response.data || []);
    } catch (err: any) {
      console.error('Failed to fetch tournaments:', err);
      setError(err.message || 'Failed to load tournaments');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLichessTournaments = async () => {
    const lichessUsername = localStorage.getItem('lichessUsername');

    if (!lichessService.isConnected() || !lichessUsername) {
      setLichessError('Connect Lichess from Dashboard first to manage Lichess tournaments.');
      setLichessTournaments([]);
      setRunningLichessTournaments([]);
      return;
    }

    try {
      setIsLichessLoading(true);
      setLichessError(null);
      const [statuses, current] = await Promise.all([
        lichessService.getTournamentsByUsername(lichessUsername, 20),
        lichessService.getCurrentArenaStatuses().catch(() => ({ created: [], started: [], finished: [] })),
      ]);
      setLichessTournaments(statuses);
      setRunningLichessTournaments(current.started || []);
    } catch (err: any) {
      console.error('Failed to fetch Lichess tournaments:', err);
      setLichessError(err?.message || 'Failed to load Lichess tournaments');
    } finally {
      setIsLichessLoading(false);
    }
  };

  const handleJoinLichessTournament = async (tournamentId: string) => {
    try {
      setJoinLoadingByTournament((prev) => ({ ...prev, [tournamentId]: true }));
      await lichessService.joinArena(tournamentId, { pairMeAsap: true });
      toast.success('Joined tournament successfully');
      await fetchLichessTournaments();
    } catch (err: any) {
      console.error('Failed to join Lichess tournament:', err);
      toast.error(err?.message || 'Failed to join tournament');
    } finally {
      setJoinLoadingByTournament((prev) => ({ ...prev, [tournamentId]: false }));
    }
  };

  const handleLoadBoards = async (tournamentId: string) => {
    try {
      setBoardsLoadingByTournament((prev) => ({ ...prev, [tournamentId]: true }));
      const boards = await lichessService.getArenaBoards(tournamentId);
      setBoardsByTournament((prev) => ({ ...prev, [tournamentId]: boards }));
    } catch (err: any) {
      console.error('Failed to load boards:', err);
      toast.error(err?.message || 'Failed to load tournament boards');
    } finally {
      setBoardsLoadingByTournament((prev) => ({ ...prev, [tournamentId]: false }));
    }
  };

  const handleFilterChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, search: e.target.value }));
  }, []);

  const handleCreateTournament = async (data: TournamentFormData) => {
    try {
      if (!isAuthenticated || !user?.email) {
        toast.error('You must be signed in to create a tournament');
        return;
      }

      const tournamentPayload = {
        ...data,
        email: user.email,
      };
      
      await tournamentService.create(tournamentPayload as any);
      await fetchTournaments();
      setIsCreateModalOpen(false);
      toast.success('Tournament created successfully');
    } catch (err: any) {
      console.error('Failed to create tournament:', err);
      toast.error(err.message || 'Failed to create tournament');
    }
  };

  const handleCreateLichessTournament = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!lichessService.isConnected()) {
      toast.error('Connect Lichess first from dashboard');
      return;
    }

    try {
      setIsCreatingLichessTournament(true);

      const clockTime = Number(lichessForm.clockTime);
      const clockIncrement = Number(lichessForm.clockIncrement);
      const minutes = Number(lichessForm.minutes);

      if (!Number.isFinite(clockTime) || clockTime <= 0) throw new Error('Clock time must be greater than 0');
      if (!Number.isFinite(clockIncrement) || clockIncrement < 0) throw new Error('Clock increment cannot be negative');
      if (!Number.isFinite(minutes) || minutes <= 0) throw new Error('Duration must be greater than 0');

      const created = await lichessService.createTournament({
        name: lichessForm.name.trim() || undefined,
        clockTime,
        clockIncrement,
        minutes,
      });

      toast.success(`Lichess tournament created: ${created.fullName || created.id}`);
      setLichessForm((prev) => ({ ...prev, name: '' }));
      await fetchLichessTournaments();
    } catch (err: any) {
      console.error('Failed to create Lichess tournament:', err);
      toast.error(err?.message || 'Failed to create Lichess tournament');
    } finally {
      setIsCreatingLichessTournament(false);
    }
  };

  const clearFilters = useCallback(() => {
    setFilters({
      search: "",
      gameType: "",
      gameId: "",
      entryFee: "",
      status: "",
    });
  }, []);

  const filteredTournaments = useMemo(() => {
    return tournaments.filter((tournament) => {
      if (filters.search && !tournament.tournamentName?.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      if (filters.gameType && tournament.gameType !== filters.gameType) {
        return false;
      }
      if (filters.status && tournament.status !== filters.status) {
        return false;
      }
      if (filters.entryFee && tournament.entryFee && tournament.entryFee > Number(filters.entryFee)) {
        return false;
      }
      return true;
    });
  }, [filters, tournaments]);

  const filterCount = useMemo(() => {
    return Object.values(filters).filter((value) => value !== "").length;
  }, [filters]);
  
  return (
    <div className="relative flex flex-col min-h-screen">
      <div className="min-h-screen  bg-gradient-to-b from-[#1a1625] via-[#13111c] to-[#0f0b15] relative overflow-hidden">
        <BackgroundEffects />
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 pb-12 pt-2 mt-10 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12 space-y-8 md:space-y-0">
            <div className="flex flex-col">
              <h1 className="text-4xl md:text-4xl lg:text-5xl font-bold max-w-7xl pb-2 text-white drop-shadow-lg uppercase tracking-wider">
                {tournamentSource === 'platform' ? 'Gaming Tournaments' : 'Lichess Tournaments'}
              </h1>
              <p className="text-gray-200 text-lg max-w-2xl font-medium">
                {tournamentSource === 'platform'
                  ? 'Compete with the best to win exciting prizes'
                  : 'Create and monitor Lichess arenas separately from platform tournaments'}
              </p>
              <div className="mt-4 inline-flex bg-[#18152a] border border-[#3d3551] rounded-xl p-1 w-fit">
                <Button
                  type="button"
                  onClick={() => setTournamentSource('platform')}
                  className={`${tournamentSource === 'platform' ? 'bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9]' : 'bg-transparent hover:bg-[#2a2540]'} text-white px-4 py-2 rounded-lg`}
                >
                  Platform
                </Button>
                <Button
                  type="button"
                  onClick={() => setTournamentSource('lichess')}
                  className={`${tournamentSource === 'lichess' ? 'bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9]' : 'bg-transparent hover:bg-[#2a2540]'} text-white px-4 py-2 rounded-lg`}
                >
                  Lichess
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 md:gap-6 items-center">
              {tournamentSource === 'platform' && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search tournaments..."
                  value={filters.search}
                  onChange={handleSearchChange}
                  className="bg-gray-700 border border-gray-600 rounded-xl px-10 py-3 text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent w-64"
                />
              </div>
              )}

              <Button
                onClick={tournamentSource === 'platform' ? fetchTournaments : fetchLichessTournaments}
                variant="outline"
                className="bg-gray-700 hover:bg-gray-800 border-gray-600 text-gray-200 px-4 py-3 rounded-xl"
                disabled={tournamentSource === 'platform' ? isLoading : isLichessLoading}
              >
                <RefreshCw className={`w-4 h-4 ${(tournamentSource === 'platform' ? isLoading : isLichessLoading) ? 'animate-spin' : ''}`} />
              </Button>

              {tournamentSource === 'platform' && (
              <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="bg-gray-700 hover:bg-gray-800 border-gray-600 text-gray-200 px-6 py-3 rounded-xl flex items-center gap-3"
                  >
                    <ListFilter className="w-5 h-5" />
                    Filters
                    {filterCount > 0 && (
                      <span className="ml-1 bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {filterCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-80 bg-gray-800 border-gray-700 rounded-xl shadow-2xl p-6">
                  <div className="mb-6">
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Game Type
                    </label>
                    <select
                      name="gameType"
                      value={filters.gameType}
                      onChange={handleFilterChange}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-violet-500"
                    >
                      <option value="">All</option>
                      <option value="SOLO">Solo</option>
                      <option value="DUO">Duo</option>
                      <option value="SQUAD">Squad</option>
                    </select>
                  </div>

                  <div className="mb-6">
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Entry Fee (Max)
                    </label>
                    <input
                      type="number"
                      name="entryFee"
                      value={filters.entryFee}
                      onChange={handleFilterChange}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-violet-500"
                      placeholder="Enter max entry fee"
                    />
                  </div>

                  <div className="mb-6">
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Status
                    </label>
                    <select
                      name="status"
                      value={filters.status}
                      onChange={handleFilterChange}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-violet-500"
                    >
                      <option value="">All</option>
                      <option value="upcoming">Upcoming</option>
                      <option value="ongoing">Ongoing</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  <DropdownMenuSeparator className="my-4 border-gray-700" />

                  <div className="flex gap-4">
                    <Button
                      variant="default"
                      onClick={() => setDropdownOpen(false)}
                      className="flex-1 bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] hover:from-[#A78BFA] hover:to-[#2a95f0] text-white py-3 rounded-lg flex items-center justify-center gap-2"
                    >
                      <Search className="w-4 h-4" />
                      Apply Filters
                    </Button>

                    <Button
                      variant="ghost"
                      onClick={clearFilters}
                      className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-200 py-3 rounded-lg"
                    >
                      Clear
                    </Button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
              )}

             {isAuthenticated && tournamentSource === 'platform' && ( 
              <Button 
                type="button"
                onClick={() => {
                  setIsCreateModalOpen(true);
                }}
                className="bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] hover:from-[#A78BFA] hover:to-[#8B5CF6] text-white px-6 py-3 rounded flex items-center gap-2 font-bold uppercase tracking-wider border border-purple-400/30 relative z-10"
              >
                <Plus className="w-4 h-4" />
                Create Tournament
              </Button>
            )}
            </div>
          </div>

          {tournamentSource === 'lichess' && lichessService.isConnected() && (
            <Card className="bg-gradient-to-b from-[#1f1a2e] to-[#18152a] border border-[#3d3551] mb-6">
              <CardHeader>
                <CardTitle className="text-white text-lg">Create Lichess Tournament</CardTitle>
                <CardDescription>Separate Lichess arena creation for tournament section</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateLichessTournament} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                  <div className="md:col-span-2">
                    <label className="text-sm text-gray-300 mb-1 block">Name (optional)</label>
                    <input
                      type="text"
                      value={lichessForm.name}
                      onChange={(e) => setLichessForm((prev) => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-xl px-3 py-2 text-gray-200"
                      placeholder="Toornify Arena"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-300 mb-1 block">Clock (min)</label>
                    <input
                      type="number"
                      min={1}
                      value={lichessForm.clockTime}
                      onChange={(e) => setLichessForm((prev) => ({ ...prev, clockTime: e.target.value }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-xl px-3 py-2 text-gray-200"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-300 mb-1 block">Increment</label>
                    <input
                      type="number"
                      min={0}
                      value={lichessForm.clockIncrement}
                      onChange={(e) => setLichessForm((prev) => ({ ...prev, clockIncrement: e.target.value }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-xl px-3 py-2 text-gray-200"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-300 mb-1 block">Duration (min)</label>
                    <input
                      type="number"
                      min={1}
                      value={lichessForm.minutes}
                      onChange={(e) => setLichessForm((prev) => ({ ...prev, minutes: e.target.value }))}
                      className="w-full bg-gray-700 border border-gray-600 rounded-xl px-3 py-2 text-gray-200"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="md:col-span-5 bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] hover:from-[#A78BFA] hover:to-[#8B5CF6]"
                    disabled={isCreatingLichessTournament}
                  >
                    {isCreatingLichessTournament ? 'Creating...' : 'Create Lichess Tournament'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Login Prompt */}
          {!isAuthenticated && tournamentSource === 'platform' && (
            <div className="mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="bg-gradient-to-r from-purple-900/30 to-[#18152a] border border-purple-500/40 rounded-lg p-6 backdrop-blur-sm relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="flex flex-col md:flex-row items-center gap-4">
                    <div className="flex-1 text-center md:text-left">
                      <h3 className="text-xl font-semibold text-white mb-2 drop-shadow-lg">Want to Create a Tournament?</h3>
                      <p className="text-gray-100 font-medium">Sign in to create and manage your own tournaments</p>
                    </div>
                    <Link to="/sign-up">
                      <Button className="bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] hover:from-[#A78BFA] hover:to-[#8B5CF6] text-white px-8 py-3 rounded flex items-center gap-2 font-bold uppercase tracking-wider border border-purple-400/30 relative z-10">
                        Sign In to Create
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {/* Stats Bar */}
          {tournamentSource === 'platform' && filteredTournaments?.length > 0 && (
            <div className="bg-gradient-to-r from-[#1f1a2e] to-[#18152a] rounded-lg p-4 mb-8 flex items-center justify-between border border-[#3d3551]">
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-gray-300 text-sm font-medium uppercase tracking-wide">Total Tournaments</p>
                  <p className="text-white font-bold text-lg">{tournaments.length}</p>
                </div>
                <div className="h-10 w-px bg-gray-700" />
                <div>
                  <p className="text-gray-300 text-sm font-medium uppercase tracking-wide">Showing</p>
                  <p className="text-white font-bold text-lg">{filteredTournaments?.length}</p>
                </div>
                {filterCount > 0 && (
                  <>
                    <div className="h-10 w-px bg-gray-700" />
                    <div>
                      <p className="text-gray-300 text-sm font-medium uppercase tracking-wide">Active Filters</p>
                      <p className="text-violet-400 font-semibold text-lg">{filterCount}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Error State */}
          {tournamentSource === 'platform' && error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-4 bg-red-900/20 border border-red-500/30 rounded-xl text-red-400 mb-8"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium">Failed to load tournaments</p>
                <p className="text-sm text-red-400/80">{error}</p>
              </div>
              <Button onClick={fetchTournaments} variant="outline" className="border-red-500/50 hover:bg-red-900/30">
                Retry
              </Button>
            </motion.div>
          )}

          {/* Loading State */}
          {tournamentSource === 'platform' && isLoading && (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
              <Loader variant="spinner" size="lg" />
              <p className="text-gray-400 mt-4">Loading tournaments...</p>
            </div>
          )}

          {/* Tournament Grid */}
          {tournamentSource === 'platform' && !isLoading && !error && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredTournaments.map((tournament) => (
                  <TournamentCard key={tournament._id} tournament={tournament} />
                ))}
              </div>

              {filteredTournaments.length === 0 && (
                <div className="flex flex-col items-center justify-center min-h-[400px] bg-gray-800/30 rounded-xl p-8">
                  <div className="text-6xl mb-4">🎮</div>
                  <p className="text-xl font-medium mb-2 text-white">No tournaments found</p>
                  <p className="text-gray-400 mb-6">Try adjusting your filters or check back later</p>
                </div>
              )}
            </>
          )}

          {tournamentSource === 'lichess' && lichessError && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-4 bg-red-900/20 border border-red-500/30 rounded-xl text-red-400 mb-8"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium">Lichess tournaments unavailable</p>
                <p className="text-sm text-red-400/80">{lichessError}</p>
              </div>
            </motion.div>
          )}

          {tournamentSource === 'lichess' && isLichessLoading && (
            <div className="flex flex-col items-center justify-center min-h-[300px]">
              <Loader variant="spinner" size="lg" />
              <p className="text-gray-400 mt-4">Loading Lichess tournaments...</p>
            </div>
          )}

          {tournamentSource === 'lichess' && !isLichessLoading && !lichessError && (
            <>
              {liveBroadcastBoards.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-white mb-4">Live Broadcast Boards</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {liveBroadcastBoards.slice(0, 6).map((board) => (
                      <Card key={`broadcast-${board.id}`} className="bg-gradient-to-b from-[#1f1a2e] to-[#18152a] border border-[#3d3551]">
                        <CardContent className="pt-4">
                          <p className="text-sm text-gray-300 mb-2">{board.white || 'White'} vs {board.black || 'Black'}</p>
                          <div className="relative w-full aspect-[4/3] rounded overflow-hidden border border-[#2b2440]">
                            <iframe
                              src={toLichessEmbedUrl(board.id)}
                              title={`Broadcast game ${board.id}`}
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
                            Open on Lichess ↗
                          </a>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {runningLichessTournaments.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-white mb-4">Running tournaments with boards</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {runningLichessTournaments.slice(0, 6).map((tournament) => (
                      <LichessTournamentCard
                        key={`running-${tournament.id}`}
                        tournament={tournament}
                        onJoin={handleJoinLichessTournament}
                        onLoadBoards={handleLoadBoards}
                        boards={boardsByTournament[tournament.id]}
                        isJoinLoading={!!joinLoadingByTournament[tournament.id]}
                        isBoardsLoading={!!boardsLoadingByTournament[tournament.id]}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {lichessTournaments.map((tournament) => (
                  <LichessTournamentCard
                    key={tournament.id}
                    tournament={tournament}
                    onJoin={handleJoinLichessTournament}
                    onLoadBoards={handleLoadBoards}
                    boards={boardsByTournament[tournament.id]}
                    isJoinLoading={!!joinLoadingByTournament[tournament.id]}
                    isBoardsLoading={!!boardsLoadingByTournament[tournament.id]}
                  />
                ))}
              </div>

              {lichessTournaments.length === 0 && (
                <div className="flex flex-col items-center justify-center min-h-[300px] bg-gray-800/30 rounded-xl p-8">
                  <div className="text-6xl mb-4">♟️</div>
                  <p className="text-xl font-medium mb-2 text-white">No Lichess tournaments found</p>
                  <p className="text-gray-400">Create one above or refresh your connected account data.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Create Tournament Modal */}
      <CreateTournamentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTournament}
      />
    </div>
  );

}

function LichessTournamentCard({
  tournament,
  onJoin,
  onLoadBoards,
  boards,
  isJoinLoading,
  isBoardsLoading,
}: {
  tournament: LichessArenaStatus;
  onJoin: (tournamentId: string) => Promise<void>;
  onLoadBoards: (tournamentId: string) => Promise<void>;
  boards?: LichessArenaBoards;
  isJoinLoading?: boolean;
  isBoardsLoading?: boolean;
}) {
  const navigate = useNavigate();

  const statusClass =
    tournament.status === 'ongoing'
      ? 'bg-green-500/20 text-green-300 border-green-500/40'
      : tournament.status === 'upcoming'
        ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
        : tournament.status === 'finished'
          ? 'bg-slate-500/20 text-slate-300 border-slate-500/40'
          : 'bg-gray-500/20 text-gray-300 border-gray-500/40';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-gradient-to-b from-[#1f1a2e] to-[#18152a] border border-[#3d3551] hover:border-purple-500/50 transition-all duration-200 overflow-hidden group">
        <CardHeader>
          <div className="flex justify-between items-start gap-2">
            <CardTitle className="text-white text-lg group-hover:text-purple-300 transition-colors">
              {tournament.name}
            </CardTitle>
            <span className={`text-xs px-3 py-1 rounded-full border uppercase tracking-wide ${statusClass}`}>
              {tournament.status}
            </span>
          </div>
          <CardDescription className="text-gray-300">Tournament ID: {tournament.id}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-400">Players</p>
              <p className="text-white font-semibold">{tournament.nbPlayers ?? '-'}</p>
            </div>
            <div>
              <p className="text-gray-400">Starts in</p>
              <p className="text-white font-semibold">{formatTimer(tournament.secondsToStart)}</p>
            </div>
            <div className="col-span-2">
              <p className="text-gray-400">Time left</p>
              <p className="text-white font-semibold">{formatTimer(tournament.secondsToFinish)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              className="bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] hover:from-[#A78BFA] hover:to-[#8B5CF6]"
              onClick={() => navigate(`/bracket/${tournament.id}`)}
            >
              View Bracket
            </Button>
            <Button
              variant="outline"
              className="border-[#3d3551] hover:border-purple-500 text-gray-200"
              onClick={() => window.open(tournament.url, '_blank', 'noopener,noreferrer')}
            >
              Open Lichess
            </Button>
            {(tournament.status === 'upcoming' || tournament.status === 'ongoing') && (
              <Button
                className="col-span-2 bg-green-600/20 border border-green-500/40 text-green-300 hover:bg-green-600/30"
                onClick={() => onJoin(tournament.id)}
                disabled={isJoinLoading}
              >
                {isJoinLoading ? 'Joining…' : tournament.status === 'ongoing' ? 'Join & Pair Me' : 'Join Tournament'}
              </Button>
            )}
            {tournament.status === 'ongoing' && (
              <Button
                variant="outline"
                className="col-span-2 border-[#3d3551] hover:border-purple-500 text-gray-200"
                onClick={() => onLoadBoards(tournament.id)}
                disabled={isBoardsLoading}
              >
                {isBoardsLoading ? 'Loading boards…' : 'Show Running Boards'}
              </Button>
            )}
          </div>

          {tournament.status === 'ongoing' && boards && (boards.featured || boards.duels.length > 0) && (
            <div className="mt-2 border border-[#3d3551] rounded-lg p-3 bg-[#13111c] space-y-2">
              <p className="text-xs uppercase tracking-wide text-gray-400">Live boards</p>

              {(boards.featured || boards.duels[0]) && (
                <div className="relative w-full aspect-[4/3] rounded overflow-hidden border border-[#2b2440] mb-2">
                  <iframe
                    src={toLichessEmbedUrl((boards.featured || boards.duels[0]).id)}
                    title={`Live board ${tournament.id}`}
                    className="absolute inset-0 w-full h-full"
                    loading="lazy"
                    allowFullScreen
                  />
                </div>
              )}

              {boards.featured && (
                <a
                  href={boards.featured.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block text-sm text-purple-300 hover:text-purple-200"
                >
                  Featured: {boards.featured.white || 'White'} vs {boards.featured.black || 'Black'}
                </a>
              )}

              {boards.duels.slice(0, 4).map((board) => (
                <a
                  key={board.id}
                  href={board.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block text-sm text-gray-200 hover:text-purple-300"
                >
                  {board.white || 'White'} vs {board.black || 'Black'}
                </a>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function formatTimer(value?: number): string {
  if (typeof value !== 'number') return '-';
  const safe = Math.max(0, value);
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function toLichessEmbedUrl(gameId: string): string {
  return `https://lichess.org/embed/game/${encodeURIComponent(gameId)}?theme=auto&bg=auto`;
}

function TournamentCard({ tournament }: { tournament: Tournament }) {
  const navigate = useNavigate();

  const statusColors = {
    upcoming: "bg-purple-500",
    ongoing: "bg-green-500",
    completed: "bg-gray-500",
    registration_open: "bg-purple-500",
    registration_closed: "bg-orange-500",
    in_progress: "bg-green-500",
    cancelled: "bg-red-500",
  };

  const statusLabels = {
    upcoming: "Upcoming",
    ongoing: "Live Now",
    completed: "Completed",
    registration_open: "Open",
    registration_closed: "Closed",
    in_progress: "Live",
    cancelled: "Cancelled",
  };

  const progress = tournament.maxTeams
    ? (tournament.registeredNumber / tournament.maxTeams) * 100
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className="bg-gradient-to-b from-[#1f1a2e] to-[#18152a] border border-[#3d3551] hover:border-purple-500/50 transition-all duration-200 cursor-pointer overflow-hidden group"
        onClick={() => navigate(`/tournaments/${tournament._id}`)}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"></div>
        <div className="relative h-48 bg-gradient-to-br from-[#1f1a2e] to-[#18152a] flex items-center justify-center overflow-hidden">
          {tournament.tournamentBanner || tournament.gameBannerPhoto || tournament.game?.gameBannerPhoto ? (
            <img
              src={getImageUrl(tournament.tournamentBanner || tournament.gameBannerPhoto || tournament.game?.gameBannerPhoto)}
              alt={tournament.tournamentName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-6xl">🎮</div>
          )}
          {/* Tournament Icon */}
          {tournament.tournamentIcon && (
            <div className="absolute bottom-2 left-2 z-10 w-10 h-10 rounded-lg overflow-hidden border-2 border-purple-500/60 shadow-lg bg-[#1f1a2e]">
              <img
                src={getImageUrl(tournament.tournamentIcon)}
                alt={`${tournament.tournamentName} icon`}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="absolute top-2 right-2 z-10">
            {tournament.status && (
              <span className={`${(statusColors as any)[tournament.status] || statusColors.upcoming} text-white text-xs px-3 py-1 rounded font-medium backdrop-blur-sm bg-black/40 border uppercase tracking-wide`}>
                {(statusLabels as any)[tournament.status] || tournament.status}
              </span>
            )}
          </div>
        </div>
        <CardHeader className="relative z-10">
          <CardTitle className="text-white text-xl font-bold drop-shadow-[0_0_10px_rgba(0,0,0,0.9)] group-hover:text-purple-400 transition-all duration-300">{tournament.tournamentName}</CardTitle>
          <CardDescription className="text-gray-200 font-medium">
            {tournament.game?.name || 'Game'} • {tournament.tournamentFormat || tournament.gameType}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 relative z-10">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-400 text-sm uppercase tracking-wide font-medium">Entry Fee</p>
              <p className="text-green-400 font-bold text-lg">${tournament.entryFee || 0}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm uppercase tracking-wide font-medium">Prize Pool</p>
              <p className="text-purple-400 font-bold text-lg">${tournament.prizePool || 0}</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400 uppercase tracking-wide font-medium">Teams</span>
              <span className="text-purple-400 font-bold">
                {tournament.teamsRegistered.length || 0}/{tournament.maxTeams || 0}
              </span>
            </div>
            <div className="w-full bg-[#18152a] rounded h-2 border border-[#3d3551]">
              <div
                className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded transition-all"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-200 font-medium">Starts: {new Date(tournament.tournamentStartDate).toLocaleDateString()}</span>
          </div>
          <Button
            className="w-full bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] hover:from-[#A78BFA] hover:to-[#8B5CF6] text-white font-bold uppercase tracking-wider shadow-lg border border-purple-400/30 transition-all duration-200"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/tournaments/${tournament._id}`);
            }}
          >
            View Details
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
