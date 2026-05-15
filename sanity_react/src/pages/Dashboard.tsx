import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Loader } from '@/components/ui/Loader';
import { Trophy, Users, GamepadIcon, Calendar, AlertCircle, Edit2, User } from 'lucide-react';
import {
  lichessService,
  authService,
  tournamentService,
  type LichessAccountProfile,
  type LichessArenaStatus,
} from '@/lib/services';
import { getImageUrl } from '@/lib/utils';
import { Link, useLocation } from 'react-router-dom';
import { BackgroundEffects } from '@/components/BackgroundEffects';
import { UpdateRoleModal } from '@/components/UpdateRoleModal';
import { motion } from 'framer-motion';
import { API_CONFIG } from '@/lib/api-config';

export default function Dashboard() {
  const location = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdateRoleModalOpen, setIsUpdateRoleModalOpen] = useState(false);
  const [lichessProfile, setLichessProfile] = useState<LichessAccountProfile | null>(null);
  const [isLichessLoading, setIsLichessLoading] = useState(false);
  const [lichessError, setLichessError] = useState<string | null>(null);
  const [createdArenas, setCreatedArenas] = useState<LichessArenaStatus[]>([]);
  const [isArenasLoading, setIsArenasLoading] = useState(false);
  const [arenasError, setArenasError] = useState<string | null>(null);
  const [createArenaLoading, setCreateArenaLoading] = useState(false);
  const [createArenaError, setCreateArenaError] = useState<string | null>(null);
  const [createArenaSuccess, setCreateArenaSuccess] = useState<string | null>(null);
  const [oauthMessage, setOauthMessage] = useState<string | null>(null);
  const [arenaForm, setArenaForm] = useState({
    name: '',
    clockTime: '5',
    clockIncrement: '0',
    minutes: '60',
  });

  useEffect(() => {
    // Only fetch data when auth is loaded
    if (!authLoading) {
      fetchDashboardData();
    }
  }, [authLoading]);

  useEffect(() => {
    const state = location.state as { message?: string } | null;
    if (state?.message) {
      setOauthMessage(state.message);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [location.state]);
  const fetchDashboardData = async ()=>{
    await Promise.all([fetchUserTournaments(), fetchLichessProfileData()]);
  }

  useEffect(() => {
    if (!lichessProfile?.username) return;

    fetchCreatedArenasStatus(lichessProfile.username);

    const interval = window.setInterval(() => {
      fetchCreatedArenasStatus(lichessProfile.username);
    }, 30000);

    return () => {
      window.clearInterval(interval);
    };
  }, [lichessProfile?.username]);

  const fetchLichessProfileData = async () => {
    const hasLichessToken = Boolean(localStorage.getItem('lichessToken') || API_CONFIG.LICHESS.TOKEN);
    if (!hasLichessToken) {
      setLichessProfile(null);
      setLichessError('No Lichess token found');
      return;
    }

    try {
      setIsLichessLoading(true);
      setLichessError(null);
      const profile = await lichessService.getMyProfile();
      setLichessProfile(profile);
      await fetchCreatedArenasStatus(profile.username);
    } catch (err: any) {
      setLichessProfile(null);
      setLichessError(err?.message || 'Failed to load Lichess profile');
    } finally {
      setIsLichessLoading(false);
    }
  };

  const fetchCreatedArenasStatus = async (username?: string) => {
    const targetUsername = username || lichessProfile?.username;
    if (!targetUsername) return;

    try {
      setIsArenasLoading(true);
      setArenasError(null);
      const statuses = await lichessService.getCreatedArenaStatuses(targetUsername, 8);
      setCreatedArenas(statuses);
    } catch (err: any) {
      setArenasError(err?.message || 'Failed to fetch created arenas');
    } finally {
      setIsArenasLoading(false);
    }
  };

  const handleCreateArena = async (e: FormEvent) => {
    e.preventDefault();
    setCreateArenaError(null);
    setCreateArenaSuccess(null);

    try {
      if (!lichessProfile?.username) {
        throw new Error('Connect Lichess account first');
      }

      const clockTime = Number(arenaForm.clockTime);
      const clockIncrement = Number(arenaForm.clockIncrement);
      const minutes = Number(arenaForm.minutes);

      if (!Number.isFinite(clockTime) || clockTime <= 0) throw new Error('Clock time must be greater than 0');
      if (!Number.isFinite(clockIncrement) || clockIncrement < 0) throw new Error('Increment cannot be negative');
      if (!Number.isFinite(minutes) || minutes <= 0) throw new Error('Duration must be greater than 0');

      setCreateArenaLoading(true);
      const arena = await lichessService.createArena({
        name: arenaForm.name.trim() || undefined,
        clockTime,
        clockIncrement,
        minutes,
      });

      setCreateArenaSuccess(`Arena created: ${arena.fullName || arena.id}`);
      setArenaForm((prev) => ({ ...prev, name: '' }));
      await fetchCreatedArenasStatus(lichessProfile.username);
    } catch (err: any) {
      setCreateArenaError(err?.message || 'Failed to create arena');
    } finally {
      setCreateArenaLoading(false);
    }
  };

  const formatArenaTimer = (value?: number): string => {
    if (typeof value !== 'number') return '-';
    const seconds = Math.max(0, value);
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  const handleConnectLichess = async () => {
    setLichessError(null);
    try {
      await authService.signInWithLichess();
    } catch (err: any) {
      setLichessError(err?.message || 'Failed to start Lichess OAuth flow');
    }
  };

  const handleDisconnectLichess = () => {
    lichessService.clearToken();
    localStorage.removeItem('lichessUsername');
    localStorage.removeItem('lichessTokenExpiresAt');
    setLichessProfile(null);
    setCreatedArenas([]);
    setLichessError(null);
    setArenasError(null);
    setOauthMessage('Lichess disconnected.');
  };
  const fetchUserTournaments = async () => {
    try {
      setIsLoading(true);
      // Fetch user's tournaments - adjust this based on your API
      const data = await tournamentService.getAll({ status: 'ongoing' });
      if(data===null){
        setTournaments([]);
        return;
      }
      setTournaments(data?.data?.slice(0, 3)); // Get first 3 for dashboard
    } catch (err: any) {
      console.error('Failed to fetch tournaments:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const stats = [
    {
      title: 'Active Tournaments',
      value: isLoading ? '...' : tournaments.length.toString(),
      icon: Trophy,
      description: 'Tournaments you\'re participating in',
      color: 'from-[#8B5CF6] to-[#6D28D9]',
    },
    {
      title: 'Team Members',
      value: '12',
      icon: Users,
      description: 'Across all your teams',
      color: 'from-[#A78BFA] to-[#A78BFA]',
    },
    {
      title: 'Games Played',
      value: '8',
      icon: GamepadIcon,
      description: 'Different games',
      color: 'from-orange-500 to-red-500',
    },
    {
      title: 'Upcoming Matches',
      value: '5',
      icon: Calendar,
      description: 'This week',
      color: 'from-green-500 to-emerald-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1625] via-[#13111c] to-[#0f0b15] py-12 px-4 relative overflow-hidden">
      <BackgroundEffects />
      <div className="max-w-[1920px] mx-auto relative z-10">
        {/* Profile & Role Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-r from-purple-600/10 to-blue-600/10 border border-purple-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-4">
                {/* Profile Image */}
                <div className="relative">
                  {user?.profilePic || user?.image ? (
                    <img
                      src={getImageUrl(user.profilePic || user.image)}
                      alt={user.username}
                      className="w-16 h-16 rounded-full object-cover border-2 border-purple-500/30"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center border-2 border-purple-500/30"
                    style={{ display: (user?.profilePic || user?.image) ? 'none' : 'flex' }}
                  >
                    <User className="w-8 h-8 text-white" />
                  </div>
                </div>
                
                <div>
                  <CardTitle className="text-white">Your Profile</CardTitle>
                  <CardDescription className="mt-1">
                    Role: <span className="font-semibold text-primary capitalize">{user?.role || 'Not set'}</span>
                    {user?.isProfileComplete ? (
                      <span className="ml-2 inline-block px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full font-medium">
                        Profile Complete
                      </span>
                    ) : (
                      <span className="ml-2 inline-block px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full font-medium">
                        Complete Onboarding
                      </span>
                    )}
                  </CardDescription>
                </div>
              </div>
              {!user?.isProfileComplete && (
                <Button
                  onClick={() => setIsUpdateRoleModalOpen(true)}
                  variant="outline"
                  className="gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Update Role
                </Button>
              )}
            </CardHeader>
          </Card>
        </motion.div>

        {/* UpdateRoleModal */}
        <UpdateRoleModal
          isOpen={isUpdateRoleModalOpen}
          onClose={() => setIsUpdateRoleModalOpen(false)}
          currentRole={user?.role || 'player'}
          onSuccess={() => {
            setIsUpdateRoleModalOpen(false);
            // Refresh dashboard data after role update
            fetchDashboardData();
          }}
        />
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome back, {user?.username || 'Player'}!
          </h1>
          <p className="text-gray-400">
            Here's what's happening with your tournaments
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="bg-gradient-to-b from-[#1f1a2e] to-[#18152a] border border-[#3d3551] hover:border-purple-500/30 transition-all backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color}`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                  <p className="text-xs text-gray-500">{stat.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent Activity */}
        <Card className="bg-gradient-to-b from-[#1f1a2e] to-[#18152a] border border-[#3d3551] backdrop-blur-sm mb-6">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-white">Lichess Account</CardTitle>
              <CardDescription>
                {lichessProfile
                  ? `Connected as @${lichessProfile.username}`
                  : 'Connect your Lichess account token to load chess stats'}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={fetchLichessProfileData}>
                Refresh
              </Button>
              {lichessProfile ? (
                <Button variant="outline" onClick={handleDisconnectLichess}>
                  Disconnect
                </Button>
              ) : (
                <Button onClick={handleConnectLichess}>
                  Connect with Lichess
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {oauthMessage && (
              <div className="p-3 rounded-lg border border-green-500/30 bg-green-500/10 text-green-300 text-sm mb-4">
                {oauthMessage}
              </div>
            )}
            {isLichessLoading ? (
              <div className="flex justify-center py-6">
                <Loader variant="spinner" size="md" />
              </div>
            ) : lichessProfile ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                  <div className="p-3 rounded-lg border border-[#3d3551] bg-[#18152a]/70">
                    <p className="text-gray-400">Username</p>
                    <p className="text-white font-medium">@{lichessProfile.username}</p>
                  </div>
                  <div className="p-3 rounded-lg border border-[#3d3551] bg-[#18152a]/70">
                    <p className="text-gray-400">Bullet Rating</p>
                    <p className="text-white font-medium">{lichessProfile.perfs?.bullet?.rating ?? '-'}</p>
                  </div>
                  <div className="p-3 rounded-lg border border-[#3d3551] bg-[#18152a]/70">
                    <p className="text-gray-400">Blitz Rating</p>
                    <p className="text-white font-medium">{lichessProfile.perfs?.blitz?.rating ?? '-'}</p>
                  </div>
                </div>

                <form onSubmit={handleCreateArena} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                  <div className="md:col-span-2">
                    <p className="text-xs text-gray-400 mb-1">Arena name (optional)</p>
                    <Input
                      value={arenaForm.name}
                      onChange={(e) => setArenaForm((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Toornify Blitz Arena"
                      className="bg-[#18152a]/80 border-[#3d3551] text-white"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Clock (min)</p>
                    <Input
                      type="number"
                      min={1}
                      value={arenaForm.clockTime}
                      onChange={(e) => setArenaForm((prev) => ({ ...prev, clockTime: e.target.value }))}
                      className="bg-[#18152a]/80 border-[#3d3551] text-white"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Increment (sec)</p>
                    <Input
                      type="number"
                      min={0}
                      value={arenaForm.clockIncrement}
                      onChange={(e) => setArenaForm((prev) => ({ ...prev, clockIncrement: e.target.value }))}
                      className="bg-[#18152a]/80 border-[#3d3551] text-white"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Duration (min)</p>
                    <Input
                      type="number"
                      min={1}
                      value={arenaForm.minutes}
                      onChange={(e) => setArenaForm((prev) => ({ ...prev, minutes: e.target.value }))}
                      className="bg-[#18152a]/80 border-[#3d3551] text-white"
                    />
                  </div>
                  <Button type="submit" disabled={createArenaLoading} className="md:col-span-5">
                    {createArenaLoading ? 'Creating arena...' : 'Create Lichess Arena'}
                  </Button>
                </form>

                {createArenaError && (
                  <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 text-sm">
                    {createArenaError}
                  </div>
                )}

                {createArenaSuccess && (
                  <div className="p-3 rounded-lg border border-green-500/30 bg-green-500/10 text-green-300 text-sm">
                    {createArenaSuccess}
                  </div>
                )}

                <div className="border border-[#3d3551] rounded-lg p-3 bg-[#18152a]/70">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-300">Created arenas status</p>
                    <Button variant="outline" size="sm" onClick={() => fetchCreatedArenasStatus()}>
                      Refresh status
                    </Button>
                  </div>

                  {isArenasLoading ? (
                    <div className="py-4 flex justify-center"><Loader variant="spinner" size="sm" /></div>
                  ) : arenasError ? (
                    <p className="text-sm text-red-300">{arenasError}</p>
                  ) : createdArenas.length === 0 ? (
                    <p className="text-sm text-gray-400">No created arenas found for this account.</p>
                  ) : (
                    <div className="space-y-2">
                      {createdArenas.map((arena) => (
                        <div key={arena.id} className="p-2 rounded border border-[#3d3551] bg-[#13111c]">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <a href={arena.url} target="_blank" rel="noreferrer" className="text-sm text-purple-300 hover:text-purple-200">
                              {arena.name}
                            </a>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              arena.status === 'ongoing'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : arena.status === 'upcoming'
                                  ? 'bg-amber-500/20 text-amber-300'
                                  : arena.status === 'finished'
                                    ? 'bg-slate-500/20 text-slate-300'
                                    : 'bg-gray-500/20 text-gray-300'
                            }`}>
                              {arena.status}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            Players: {arena.nbPlayers ?? '-'} • Starts in: {formatArenaTimer(arena.secondsToStart)} • Time left: {formatArenaTimer(arena.secondsToFinish)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-300 text-sm">
                {lichessError || 'Unable to connect Lichess account.'} Add token to localStorage key
                {' '}
                <span className="font-semibold">lichessToken</span>
                {' '}
                or set
                {' '}
                <span className="font-semibold">VITE_LICHESS_TOKEN</span>
                .
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-b from-[#1f1a2e] to-[#18152a] border border-[#3d3551] backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Recent Tournaments</CardTitle>
              <CardDescription>Your latest tournament activity</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader variant="spinner" size="md" />
                </div>
              ) : error ? (
                <div className="flex items-center gap-2 p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400">
                  <AlertCircle className="w-5 h-5" />
                  <p className="text-sm">{error}</p>
                </div>
              ) : tournaments.length > 0 ? (
                <div className="space-y-3">
                  {tournaments.map((tournament) => (
                    <div key={tournament._id} className="p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors">
                      <p className="text-white font-medium">{tournament.name}</p>
                      <p className="text-sm text-gray-400">{tournament.game?.name || 'Game'}</p>
                    </div>
                  ))}
                  <Link to="/tournaments">
                    <Button className="w-full mt-4" variant="outline">
                      View All Tournaments
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-gray-400 text-sm text-center py-8">
                    No recent tournaments. Join one to get started!
                  </p>
                  <Link to="/tournaments">
                    <Button className="w-full" variant="outline">
                      Browse Tournaments
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-b from-[#1f1a2e] to-[#18152a] border border-[#3d3551] backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Your Teams</CardTitle>
              <CardDescription>Manage your team memberships</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-400 text-sm text-center py-8">
                  You haven't joined any teams yet.
                </p>
                <Button className="w-full" variant="outline">
                  Create or Join Team
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
