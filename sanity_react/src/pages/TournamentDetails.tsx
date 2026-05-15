import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Calendar, 
  Users, 
  DollarSign, 
  Trophy, 
  Clock, 
  Shield,
  ArrowLeft,
  UserPlus,
  Share2,
  FileText,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Loader } from "@/components/ui/Loader";
import { TournamentRegistrationModal } from "@/components/TournamentRegistrationModal";
import { CreateBracketModal } from "@/components/CreateBracketModal";
import { tournamentService, bracketService, teamService } from "@/lib/services";
import { getAvatarUrl, getCharacterAvatar, getImageUrl } from "@/lib/utils";
import type { Tournament } from "@/lib/services/tournament.service";
import type { Bracket } from "@/lib/services";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

export function TournamentDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [brackets, setBrackets] = useState<Bracket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [bracketsLoading, setBracketsLoading] = useState(false);
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [myTeamIds, setMyTeamIds] = useState<string[]>([]);
  const [isCreateBracketModalOpen, setIsCreateBracketModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchTournamentDetails();
    }
  }, [id]);

  useEffect(() => {
    if (user) {
      fetchMyTeams();
    } else {
      setMyTeamIds([]);
    }
  }, [user?.id, user?._id]);

  const fetchMyTeams = async () => {
    try {
      const teams = await teamService.getUserTeams();
      const ids = teams
        .map((team: any) => team?._id || team?.id)
        .filter((teamId): teamId is string => Boolean(teamId));
      setMyTeamIds(ids);
    } catch (err) {
      console.error('Failed to fetch user teams:', err);
      setMyTeamIds([]);
    }
  };

  const fetchTournamentDetails = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const data = await tournamentService.getById(id);
      setTournament(data);
      
      // Fetch related brackets
      fetchBrackets(id);
    } catch (err: any) {
      console.error('Failed to fetch tournament details:', err);
      setError(err.message || 'Failed to load tournament details');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBrackets = async (tournamentId: string) => {
    try {
      setBracketsLoading(true);
      const allBrackets = await bracketService.getAll();
      // Filter brackets for this tournament
      const tournamentBrackets = allBrackets.filter(
        bracket => bracket.tournament_id === tournamentId
      );
      setBrackets(tournamentBrackets);
    } catch (err: any) {
      console.error('Failed to fetch brackets:', err);
    } finally {
      setBracketsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!user) {
      navigate('/sign-in', { state: { from: `/tournaments/${id}` } });
      return;
    }

    setIsRegistrationModalOpen(true);
  };

  const handleRegistrationSubmit = async (teamId: string, registrationTime: string) => {
    try {
      setIsRegistering(true);
      await tournamentService.register(id!, teamId, registrationTime);
      // Refresh tournament data to update participant count
      await fetchTournamentDetails();
      setIsRegistrationModalOpen(false);
      toast.success('Successfully registered for the tournament!');
    } catch (err: any) {
      console.error('Failed to register:', err);
      toast.error(err.message || 'Failed to register for tournament');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: tournament?.tournamentName,
        text: `Check out this tournament: ${tournament?.tournamentName}`,
        url: url,
      });
    } else {
      navigator.clipboard.writeText(url);
      alert('Tournament link copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1b2838] via-[#171a21] to-[#0d1117] py-20 px-4 flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1b2838] via-[#171a21] to-[#0d1117] py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate('/tournaments')}
            className="mb-8 text-purple-400 hover:text-purple-300"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tournaments
          </Button>
          <Card className="bg-red-900/20 border-red-700">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-red-400">
                <AlertCircle className="h-6 w-6" />
                <div>
                  <h3 className="font-semibold text-lg">Error Loading Tournament</h3>
                  <p className="text-sm text-red-300">{error || 'Tournament not found'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const statusColors = {
    upcoming: 'bg-purple-500/20 text-purple-300 border-purple-500/50',
    ongoing: 'bg-green-500/20 text-green-300 border-green-500/50 animate-pulse',
    completed: 'bg-slate-500/20 text-slate-300 border-slate-500/50',
  };

  const statusLabels = {
    upcoming: 'Upcoming',
    ongoing: 'Live Now',
    completed: 'Completed',
  };

  const extractTeamId = (teamEntry: any): string | null => {
    if (!teamEntry) return null;
    if (typeof teamEntry === 'string') return teamEntry;
    return (
      teamEntry._id ||
      teamEntry.id ||
      teamEntry.teamId ||
      teamEntry.team?._id ||
      teamEntry.team?.id ||
      null
    );
  };

  const registeredTeamIds = (tournament.teamsRegistered || [])
    .map((teamEntry: any) => extractTeamId(teamEntry))
    .filter((teamId): teamId is string => Boolean(teamId));

  const isMyTeamRegistered = myTeamIds.some((teamId) => registeredTeamIds.includes(teamId));

  const progress = tournament.maxTeams && tournament.teamsRegistered 
    ? ((tournament.teamsRegistered.length || 0) / tournament.maxTeams) * 100 
    : 0;
  const spotsLeft = (tournament.maxTeams || 0) - (tournament.teamsRegistered.length || 0);
  const canRegister = tournament.status === 'upcoming' && spotsLeft > 0 && !isMyTeamRegistered;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1b2838] via-[#171a21] to-[#0d1117] relative overflow-hidden py-12 px-4">
      {/* Steam-like background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/10 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDEzOSwgOTIsIDI0NiwgMC4wNSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-400/20 rounded-full blur-[120px] animate-pulse" style={{animationDelay: '1s'}}></div>
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/tournaments')}
          className="mb-6 text-purple-400 hover:text-purple-300 font-semibold relative z-10 hover:bg-purple-900/20"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Tournaments
        </Button>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-gradient-to-b from-[#1e2837] to-[#16202d] border border-[#3d4450] shadow-lg overflow-hidden mb-8 backdrop-blur-sm relative group hover:border-purple-500/50 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative h-80 md:h-96 overflow-hidden">
              {tournament.tournamentBanner || tournament.gameBannerPhoto || tournament.game?.gameBannerPhoto ? (
                <img
                  src={getImageUrl(tournament.tournamentBanner || tournament.gameBannerPhoto || tournament.game?.gameBannerPhoto)}
                  alt={tournament.tournamentName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#1e2837] to-[#16202d] flex items-center justify-center">
                  <div className="text-9xl">🎮</div>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              
              {/* Status Badge */}
              <div className="absolute top-4 right-4">
                {tournament.status && (
                  <span className={`${statusColors[tournament.status]} px-4 py-2 rounded-full font-medium text-sm border backdrop-blur-sm`}>
                    {statusLabels[tournament.status]}
                  </span>
                )}
              </div>

              {/* Tournament Info Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-8 relative z-10">
                <div className="flex items-end gap-4 mb-3">
                  {/* Tournament Icon */}
                  {tournament.tournamentIcon && (
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 border-purple-500/60 shadow-lg shadow-purple-900/40 flex-shrink-0 bg-[#1e2837]">
                      <img
                        src={getImageUrl(tournament.tournamentIcon)}
                        alt={`${tournament.tournamentName} icon`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
                    {tournament.tournamentName}
                  </h1>
                </div>
                <div className="flex flex-wrap gap-4 text-gray-100">
                  <div className="flex items-center gap-2 bg-black/60 px-3 py-1 rounded backdrop-blur-sm border border-purple-500/20">
                    <Shield className="h-5 w-5 text-purple-400" />
                    <span className="font-semibold">{tournament.game?.name || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-black/60 px-3 py-1 rounded backdrop-blur-sm border border-purple-500/20">
                    <Users className="h-5 w-5 text-purple-400" />
                    <span className="font-semibold">{tournament.gameType || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-black/60 px-3 py-1 rounded backdrop-blur-sm border border-purple-500/20">
                    <Calendar className="h-5 w-5 text-purple-400" />
                    <span>{tournament.tournamentStartDate ? new Date(tournament.tournamentStartDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'TBA'}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mb-8">
            <Button
              onClick={handleRegister}
              disabled={!canRegister || isRegistering || isMyTeamRegistered}
              className="flex-1 md:flex-none bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] hover:from-[#A78BFA] hover:to-[#8B5CF6] shadow-lg border border-purple-400/30 font-bold uppercase tracking-wider transition-all duration-200"
            >
              {isRegistering ? (
                <>
                  <Loader size="sm" className="mr-2" />
                  Registering...
                </>
              ) : isMyTeamRegistered ? (
                'Registered for this tournament'
              ) : !canRegister ? (
                tournament.status === 'completed' ? 'Tournament Ended' : 'Registration Closed'
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Register Now
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleShare}
              className="border border-[#3d4450] hover:border-purple-500 bg-[#16202d] hover:bg-[#1e2837] text-gray-800 transition-all duration-200"
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="bg-gradient-to-b from-[#1e2837] to-[#16202d] border border-[#3d4450] hover:border-purple-500/50 transition-all duration-200 backdrop-blur-sm group">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1 font-medium uppercase tracking-wide">Prize Pool</p>
                    {tournament.prizeConfig && tournament.prizeConfig.length > 0 ? (
                      <div className="space-y-1">
                        {tournament.prizeConfig.slice(0, 3).map((prize, idx) => (
                          <p key={idx} className="text-lg font-bold text-purple-400">
                            {prize.position}:{' '}
                            {prize.prizeType === 'custom'
                              ? `${prize.customPrize || 'Prize TBA'}${prize.customPrizeValue ? ` (${prize.customPrizeValue})` : ''}`
                              : prize.amount
                              ? `${prize.currency || '$'}${prize.amount?.toLocaleString()}`
                              : (prize.customPrize || 'Prize TBA')}
                          </p>
                        ))}
                        {tournament.prizeConfig.length > 3 && (
                          <p className="text-xs text-gray-300">+{tournament.prizeConfig.length - 3} more</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-2xl font-bold text-purple-400">
                        ${(tournament.prizePool || 0).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <Trophy className="h-10 w-10 text-purple-400 group-hover:scale-110 transition-transform duration-300" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-b from-[#1e2837] to-[#16202d] border border-[#3d4450] hover:border-green-500/50 transition-all duration-200 backdrop-blur-sm group">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1 font-medium uppercase tracking-wide">Entry Fee</p>
                    <p className="text-2xl font-bold text-green-400">
                      ${(tournament.entryFee || 0).toLocaleString()}
                    </p>
                  </div>
                  <DollarSign className="h-10 w-10 text-green-400 group-hover:scale-110 transition-transform duration-300" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-b from-[#1e2837] to-[#16202d] border border-[#3d4450] hover:border-purple-500/50 transition-all duration-200 backdrop-blur-sm group">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1 font-medium uppercase tracking-wide">Teams Registered</p>
                    <p className="text-2xl font-bold text-purple-400">
                      {tournament.teamsRegistered.length || 0}/{tournament.maxTeams || 0}
                    </p>
                  </div>
                  <Users className="h-10 w-10 text-purple-400 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="mt-3">
                  <div className="h-2 bg-[#16202d] rounded overflow-hidden border border-[#3d4450]">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-200 mt-1 font-medium">
                    {spotsLeft} {spotsLeft === 1 ? 'spot' : 'spots'} remaining
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-b from-[#1e2837] to-[#16202d] border border-[#3d4450] hover:border-slate-500/50 transition-all duration-200 backdrop-blur-sm group">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400 mb-1 font-medium uppercase tracking-wide">Status</p>
                    <p className="text-2xl font-bold text-slate-300 capitalize">
                      {tournament.status}
                    </p>
                  </div>
                  <Clock className="h-10 w-10 text-slate-400 group-hover:scale-110 transition-transform duration-300" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Details Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              {tournament.description && (
                <Card className="bg-gradient-to-b from-[#1e2837] to-[#16202d] border border-[#3d4450] hover:border-purple-500/30 transition-all duration-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <FileText className="h-5 w-5 text-purple-400" />
                      About This Tournament
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-100 leading-relaxed whitespace-pre-wrap">
                      {tournament.description}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Rules */}
              {tournament.rules && (
                <Card className="bg-gradient-to-b from-[#1e2837] to-[#16202d] border border-[#3d4450] hover:border-purple-500/30 transition-all duration-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Shield className="h-5 w-5 text-purple-400" />
                      Rules & Regulations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-100 leading-relaxed whitespace-pre-wrap">
                      {tournament.rules}
                    </p>
                  </CardContent>
                </Card>
              )}
              {/* Brackets Section */}
              <Card className="bg-gradient-to-b from-[#1f1a2e] to-[#18152a] border border-[#3d3551] hover:border-purple-500/30 transition-all duration-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2 text-white">
                      <Trophy className="h-5 w-5 text-purple-400" />
                      Tournament Brackets
                    </CardTitle>
                    {brackets.length > 0 && (
                      <span className="text-sm text-gray-400">
                        {brackets.length} {brackets.length === 1 ? 'bracket' : 'brackets'}
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {bracketsLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader size="md" />
                    </div>
                  ) : brackets.length > 0 ? (
                    <div className="space-y-3">
                      {brackets.map((bracket) => {
                        const completedMatches = bracket.matches?.filter(m => m.winner).length || 0;
                        const totalMatches = bracket.matches?.length || 0;
                        const progress = totalMatches > 0 ? (completedMatches / totalMatches) * 100 : 0;
                        
                        return (
                          <Link key={bracket._id} to={`/bracket/${bracket._id}`}>
                            <div className="bg-[#13111c] border border-[#3d3551] hover:border-purple-500/50 rounded-lg p-4 transition-all cursor-pointer group">
                              <div className="flex items-start justify-between gap-4 mb-3">
                                <div className="flex-1">
                                  <h4 className="text-white font-semibold group-hover:text-purple-400 transition-colors">
                                    {bracket.format === 'single_elimination' && 'Single Elimination'}
                                    {bracket.format === 'double_elimination' && 'Double Elimination'}
                                    {bracket.format === 'round_robin' && 'Round Robin'}
                                  </h4>
                                  <p className="text-sm text-gray-400 mt-1">
                                    {bracket.teams?.length || 0} teams • {totalMatches} matches
                                  </p>
                                </div>
                                <div className="text-right">
                                  {progress === 100 ? (
                                    <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                                      Completed
                                    </span>
                                  ) : progress > 0 ? (
                                    <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                                      In Progress
                                    </span>
                                  ) : (
                                    <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                                      Upcoming
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              {/* Progress Bar */}
                              {totalMatches > 0 && (
                                <div>
                                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                                    <span>Progress</span>
                                    <span>{completedMatches}/{totalMatches} matches</span>
                                  </div>
                                  <div className="w-full bg-[#1a1625] rounded-full h-2 overflow-hidden">
                                    <div
                                      className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-500"
                                      style={{ width: `${progress}%` }}
                                    />
                                  </div>
                                </div>
                              )}
                              
                              <div className="mt-3 pt-3 border-t border-[#3d3551]">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="w-full text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                                >
                                  View Bracket
                                </Button>
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Trophy className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400 mb-4">No brackets created yet</p>
                      {user && user.id === tournament.organizerId && (
                        <Button
                          className="bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-400 hover:to-purple-600 text-white"
                          onClick={() => setIsCreateBracketModalOpen(true)}
                        >
                          <Trophy className="mr-2 h-4 w-4" />
                          Create Bracket
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Organizer Info */}
              {tournament.organiser && (
                <Card className="bg-gradient-to-b from-[#1e2837] to-[#16202d] border border-[#3d4450] hover:border-purple-500/30 transition-all duration-200 group">
                  <CardHeader>
                    <CardTitle className="text-lg text-white">Organized By</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <img
                        src={getAvatarUrl(
                          (tournament.organiser as any)?.profilePic || (tournament.organiser as any)?.image,
                          tournament.organiser?.username || tournament.organiser?.email || tournament.organiser?._id || 'organiser'
                        )}
                        alt={tournament.organiser?.username || 'Organiser'}
                        className="h-12 w-12 rounded object-cover border border-purple-400/30"
                        onError={(e) => {
                          e.currentTarget.src = getCharacterAvatar(
                            tournament.organiser?.username || tournament.organiser?.email || tournament.organiser?._id || 'organiser'
                          );
                        }}
                      />
                      <div>
                        <p className="font-semibold text-white">{tournament.organiser?.username || 'Unknown'}</p>
                        <p className="text-sm text-gray-400">{tournament.organiser?.email || 'N/A'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quick Info */}
              <Card className="bg-gradient-to-b from-[#1e2837] to-[#16202d] border border-[#3d4450] hover:border-purple-500/30 transition-all duration-200">
                <CardHeader>
                  <CardTitle className="text-lg text-white">Tournament Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-300 mb-1 font-medium uppercase tracking-wide">Game</p>
                    <p className="font-semibold text-white text-lg">{tournament.game?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-300 mb-1 font-medium uppercase tracking-wide">Format</p>
                    <p className="font-semibold text-white text-lg">{tournament.tournamentFormat || tournament.gameType || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-300 mb-1 font-medium uppercase tracking-wide">Registration Ends</p>
                    <p className="font-semibold text-white text-lg">
                      {tournament.registrationEndDate ? new Date(tournament.registrationEndDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      }) : 'TBA'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-300 mb-1 font-medium uppercase tracking-wide">Start Date</p>
                    <p className="font-semibold text-white text-lg">
                      {tournament.tournamentStartDate ? new Date(tournament.tournamentStartDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      }) : 'TBA'}
                    </p>
                    {tournament.tournamentStartDate && (
                      <p className="text-sm text-gray-300">
                        {new Date(tournament.tournamentStartDate).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    )}
                  </div>
                  {tournament.tournamentEndDate && (
                    <div>
                      <p className="text-sm text-gray-300 mb-1 font-medium uppercase tracking-wide">End Date</p>
                      <p className="font-semibold text-white text-lg">
                        {new Date(tournament.tournamentEndDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-300 mb-1 font-medium uppercase tracking-wide">Visibility</p>
                    <p className="font-semibold text-white text-lg capitalize">{tournament.tournamentVisibility || 'Public'}</p>
                  </div>
                  {tournament.selectedPlatform && (
                    <div>
                      <p className="text-sm text-gray-300 mb-1 font-medium uppercase tracking-wide">Platform</p>
                      <p className="font-semibold text-white text-lg">{tournament.selectedPlatform}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* CTA Card */}
              {(canRegister || isMyTeamRegistered) && (
                <Card className="bg-gradient-to-b from-purple-900/30 to-[#16202d] border border-purple-500/40 transition-all duration-200 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <CardContent className="pt-6 relative z-10">
                    <h3 className="font-bold text-2xl text-white mb-2 drop-shadow-lg">Ready to compete?</h3>
                    <p className="text-gray-100 mb-4 text-base font-medium">
                      {isMyTeamRegistered
                        ? 'Your team is already registered for this tournament.'
                        : `Join ${tournament.teamsRegistered.length || 0} other teams in this exciting tournament!`}
                    </p>
                    <Button
                      onClick={handleRegister}
                      disabled={isRegistering || isMyTeamRegistered}
                      className="w-full bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] hover:from-[#A78BFA] hover:to-[#8B5CF6] text-white font-bold uppercase tracking-wider shadow-lg border border-purple-400/30 transition-all duration-200 relative z-10"
                    >
                      {isRegistering
                        ? 'Registering...'
                        : isMyTeamRegistered
                        ? 'Registered for this tournament'
                        : 'Register Now'}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Create Bracket Modal */}
      <CreateBracketModal
        isOpen={isCreateBracketModalOpen}
        onClose={() => setIsCreateBracketModalOpen(false)}
        onSubmit={async (data) => {
          try {
            await bracketService.create(data);
            setIsCreateBracketModalOpen(false);
            toast.success('Bracket created successfully!');
            // Refresh brackets
            if (id) {
              const b = await bracketService.getByTournament(id);
              setBrackets(b);
            }
          } catch (err) {
            toast.error('Failed to create bracket');
          }
        }}
        preSelectedTournamentId={id}
      />

      {/* Tournament Registration Modal */}
      <TournamentRegistrationModal
        isOpen={isRegistrationModalOpen}
        onClose={() => setIsRegistrationModalOpen(false)}
        onSubmit={handleRegistrationSubmit}
        tournamentStartDate={tournament?.tournamentStartDate}
        isLoading={isRegistering}
      />
    </div>
  );
}
