import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Loader } from "@/components/ui/Loader";
import { Trophy, Users, Calendar, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { bracketService, lichessService } from "@/lib/services";
import type { Bracket, LichessArenaStatus } from "@/lib/services";
import { BackgroundEffects } from "@/components/BackgroundEffects";
import { CreateBracketModal } from "@/components/CreateBracketModal";

interface CreateBracketInput {
  tournament_id: string;
  tournament_name: string;
  format: 'single_elimination' | 'double_elimination' | 'round_robin';
  teams: string[];
  consolationFinal?: boolean;
  grandFinalType?: string;
  userEmail?: string;
}

export function Bracket() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [bracketSource, setBracketSource] = useState<"platform" | "lichess">(() => {
    const stored = localStorage.getItem('brackets.source');
    return stored === 'lichess' ? 'lichess' : 'platform';
  });
  const [brackets, setBrackets] = useState<Bracket[]>([]);
  const [lichessBrackets, setLichessBrackets] = useState<LichessArenaStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLichessLoading, setIsLichessLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lichessError, setLichessError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (bracketSource === 'platform') {
      fetchBrackets();
    } else {
      fetchLichessBrackets();
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('brackets.source', bracketSource);
    if (bracketSource === 'platform') {
      fetchBrackets();
    } else {
      fetchLichessBrackets();
    }
  }, [bracketSource]);

  const fetchBrackets = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await bracketService.getAll();
      setBrackets(data);
    } catch (err: any) {
      console.error('Failed to fetch brackets:', err);
      setError(err.message || 'Failed to load brackets');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLichessBrackets = async () => {
    const lichessUsername = localStorage.getItem('lichessUsername');

    if (!lichessService.isConnected() || !lichessUsername) {
      setLichessError('Connect Lichess from Dashboard to load Lichess brackets.');
      setLichessBrackets([]);
      return;
    }

    try {
      setIsLichessLoading(true);
      setLichessError(null);
      const statuses = await lichessService.getTournamentsByUsername(lichessUsername, 25);
      setLichessBrackets(statuses);
    } catch (err: any) {
      console.error('Failed to fetch Lichess brackets:', err);
      setLichessError(err?.message || 'Failed to load Lichess brackets');
    } finally {
      setIsLichessLoading(false);
    }
  };

  const filteredBrackets = brackets.filter(bracket =>
    bracket.tournament_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLichessBrackets = lichessBrackets.filter((bracket) =>
    bracket.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bracket.id.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleCreateBracket = async (data: CreateBracketInput) => {
    try {
      if (!user?.email) {
        alert('You must be signed in to create a bracket');
        return;
      }
      
      const bracketData = {
        ...data,
        userEmail: user.email,
      };
      
      console.log('Creating bracket with data:', bracketData);
      const result = await bracketService.create(bracketData);
      console.log('Bracket created:', result);
      await fetchBrackets();
      setIsCreateModalOpen(false);
    } catch (err: any) {
      console.error('Failed to create bracket:', err);
      alert(err.message || 'Failed to create bracket');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1625] via-[#13111c] to-[#0f0b15] py-12 px-4">
       <BackgroundEffects />
      <div className="max-w-[1920px] mx-auto relative z-10">
        {/* Header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {bracketSource === 'platform' ? 'Tournament Brackets' : 'Lichess Brackets'}
            </h1>
            <p className="text-gray-400 text-lg">
                {bracketSource === 'platform'
                  ? 'Manage and track your tournament brackets'
                  : 'Separate bracket system for Lichess tournaments with running status'}
            </p>
              <div className="mt-4 inline-flex bg-[#18152a] border border-[#3d3551] rounded-xl p-1 w-fit">
                <Button
                  type="button"
                  onClick={() => setBracketSource('platform')}
                  className={`${bracketSource === 'platform' ? 'bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9]' : 'bg-transparent hover:bg-[#2a2540]'} text-white px-4 py-2 rounded-lg`}
                >
                  Platform
                </Button>
                <Button
                  type="button"
                  onClick={() => setBracketSource('lichess')}
                  className={`${bracketSource === 'lichess' ? 'bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9]' : 'bg-transparent hover:bg-[#2a2540]'} text-white px-4 py-2 rounded-lg`}
                >
                  Lichess
                </Button>
              </div>
          </div>
            {bracketSource === 'platform' ? (
              <Button
                onClick={() => {
                  if (!isAuthenticated) {
                    navigate('/sign-in', { state: { from: '/bracket' } });
                  } else {
                    setIsCreateModalOpen(true);
                  }
                }}
                className="bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] hover:from-[#A78BFA] hover:to-[#7C3AED]"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Bracket
              </Button>
            ) : (
              <Button
                onClick={fetchLichessBrackets}
                className="bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] hover:from-[#A78BFA] hover:to-[#7C3AED]"
                disabled={isLichessLoading}
              >
                {isLichessLoading ? 'Refreshing...' : 'Refresh Lichess Brackets'}
              </Button>
            )}
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search brackets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-[#18152a] border border-[#3d3551] rounded text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all backdrop-blur-sm"
            />
          </div>
        </div>

        {/* Brackets Grid */}
        {bracketSource === 'platform' && isLoading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader size="lg" />
          </div>
        ) : bracketSource === 'platform' && error ? (
          <Card className="bg-gradient-to-b from-[#1f1a2e] to-[#18152a] border border-[#3d3551] backdrop-blur-sm">
            <CardContent className="pt-6 text-center py-20">
              <Trophy className="h-20 w-20 text-red-600 mx-auto mb-4" />
              <p className="text-red-400 text-lg mb-4">{error}</p>
              <Button 
                onClick={fetchBrackets}
                className="bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] hover:from-[#A78BFA] hover:to-[#7C3AED]"
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : bracketSource === 'platform' && filteredBrackets.length === 0 ? (
          <Card className="bg-gradient-to-b from-[#1f1a2e] to-[#18152a] border border-[#3d3551] backdrop-blur-sm">
            <CardContent className="pt-6 text-center py-20">
              <Trophy className="h-20 w-20 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg mb-4">
                {searchTerm
                  ? 'No brackets found matching your search'
                  : user
                  ? "You haven't created any brackets yet"
                  : 'No brackets available'}
              </p>
              {user && !searchTerm && (
                <Button className="bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] hover:from-[#A78BFA] hover:to-[#7C3AED]">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Bracket
                </Button>
              )}
            </CardContent>
          </Card>
        ) : bracketSource === 'platform' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBrackets.map((bracket, index) => (
              <BracketCard key={bracket._id} bracket={bracket} index={index} />
            ))}
          </div>
        ) : isLichessLoading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader size="lg" />
          </div>
        ) : lichessError ? (
          <Card className="bg-gradient-to-b from-[#1f1a2e] to-[#18152a] border border-[#3d3551] backdrop-blur-sm">
            <CardContent className="pt-6 text-center py-20">
              <Trophy className="h-20 w-20 text-red-600 mx-auto mb-4" />
              <p className="text-red-400 text-lg mb-4">{lichessError}</p>
              <Button
                onClick={fetchLichessBrackets}
                className="bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] hover:from-[#A78BFA] hover:to-[#7C3AED]"
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : filteredLichessBrackets.length === 0 ? (
          <Card className="bg-gradient-to-b from-[#1f1a2e] to-[#18152a] border border-[#3d3551] backdrop-blur-sm">
            <CardContent className="pt-6 text-center py-20">
              <Trophy className="h-20 w-20 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg mb-4">No Lichess brackets found</p>
              <p className="text-sm text-gray-500">Create a Lichess tournament from Tournaments → Lichess tab.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLichessBrackets.map((bracket, index) => (
              <LichessBracketCard key={bracket.id} bracket={bracket} index={index} />
            ))}
          </div>
        )}
      </div>

      {/* Create Bracket Modal */}
      <CreateBracketModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateBracket}
      />
    </div>
  );
}

function LichessBracketCard({ bracket, index }: { bracket: LichessArenaStatus; index: number }) {
  const running = bracket.status === 'ongoing';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className="bg-gradient-to-b from-[#1f1a2e] to-[#18152a] border border-[#3d3551] hover:border-purple-500/50 transition-all h-full group backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-start justify-between gap-2 mb-2">
            <CardTitle className="text-white group-hover:text-purple-400 transition-colors">
              {bracket.name}
            </CardTitle>
            <span
              className={`text-xs px-2 py-1 rounded-full border uppercase ${
                bracket.status === 'ongoing'
                  ? 'bg-green-500/20 text-green-400 border-green-500/30'
                  : bracket.status === 'upcoming'
                    ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                    : bracket.status === 'finished'
                      ? 'bg-slate-500/20 text-slate-300 border-slate-500/30'
                      : 'bg-gray-500/20 text-gray-300 border-gray-500/30'
              }`}
            >
              {bracket.status}
            </span>
          </div>
          <CardDescription className="text-gray-400">Tournament ID: {bracket.id}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Users className="h-4 w-4" />
            <span>{bracket.nbPlayers ?? '-'} Players</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Calendar className="h-4 w-4" />
            <span>
              {running
                ? `Running • ${formatSeconds(bracket.secondsToFinish)} left`
                : bracket.status === 'upcoming'
                  ? `Starts in ${formatSeconds(bracket.secondsToStart)}`
                  : 'Not running'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Link to={`/bracket/${bracket.id}`}>
              <Button
                variant="outline"
                className="w-full border-[#3d3551] hover:border-purple-500 hover:bg-purple-500/10 transition-all"
              >
                View Bracket
              </Button>
            </Link>
            <Button
              variant="outline"
              className="w-full border-[#3d3551] hover:border-purple-500 hover:bg-purple-500/10 transition-all"
              onClick={() => window.open(bracket.url, '_blank', 'noopener,noreferrer')}
            >
              Open Lichess
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function formatSeconds(value?: number): string {
  if (typeof value !== 'number') return '-';
  const seconds = Math.max(0, value);
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function BracketCard({ bracket, index }: { bracket: Bracket; index: number }) {
  const getStatusColor = () => {
    const matchCount = bracket.matches.length;
    const completedMatches = bracket.matches.filter(m => m.winner).length;
    
    if (completedMatches === matchCount && matchCount > 0) {
      return { style: 'bg-slate-500/20 text-slate-400 border-slate-500/30', label: 'Completed' };
    } else if (completedMatches > 0) {
      return { style: 'bg-green-500/20 text-green-400 border-green-500/30', label: 'Ongoing' };
    } else {
      return { style: 'bg-purple-500/20 text-purple-400 border-purple-500/30', label: 'Upcoming' };
    }
  };

  const status = getStatusColor();
  const formattedFormat = formatBracketType(bracket.format);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link to={`/bracket/${bracket._id}`}>
        <Card className="bg-gradient-to-b from-[#1f1a2e] to-[#18152a] border border-[#3d3551] hover:border-purple-500/50 transition-all cursor-pointer h-full group backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-start justify-between gap-2 mb-2">
              <CardTitle className="text-white group-hover:text-purple-400 transition-colors">
                {bracket.tournament_name}
              </CardTitle>
              <span className={`text-xs px-2 py-1 rounded-full border ${status.style}`}>
                {status.label}
              </span>
            </div>
            <CardDescription className="text-gray-400">
              Tournament ID: {bracket.tournament_id}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-400">
                <Trophy className="h-4 w-4" />
                <span>{formattedFormat}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Users className="h-4 w-4" />
              <span>{bracket.teams?.length || 0} Teams</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Calendar className="h-4 w-4" />
              <span>{new Date(bracket.createdAt).toLocaleDateString()}</span>
            </div>
            <Button
              variant="outline"
              className="w-full border-[#3d3551] hover:border-purple-500 hover:bg-purple-500/10 transition-all"
            >
              View Bracket
            </Button>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}

// Helper function for formatBracketType (moved outside component)
function formatBracketType(format: string) {
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
}
