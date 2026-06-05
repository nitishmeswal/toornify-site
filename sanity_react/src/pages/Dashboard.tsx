import { useAuth } from '@/context/AuthContext';
import { useEffect, useState, useCallback } from 'react';
import { Loader } from '@/components/ui/Loader';
import {
  Trophy, Users, BarChart3, Star, Flame,
  Home, Swords, Shield, Bell, MessageSquare,
  UserCircle, Settings, LogOut, Search, ChevronRight, Plus,
} from 'lucide-react';
import { tournamentService } from '@/lib/services';
import { getImageUrl } from '@/lib/utils';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface UpcomingMatch {
  id: string;
  game: string;
  gameIcon: string;
  mode: string;
  teamA: string;
  teamB: string;
  teamALogo: string;
  teamBLogo: string;
  time: string;
  date: string;
  countdown: number; // seconds remaining
  isLive: boolean;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar: string;
  rp: number;
}

interface ActivityItem {
  id: string;
  text: string;
  detail?: string;
  detailColor?: string;
  time: string;
  icon: 'trophy' | 'star' | 'flame' | 'plus';
}

interface TopGame {
  name: string;
  icon: string;
  matches: number;
  pct: number;
  color: string;
}

/* ------------------------------------------------------------------ */
/*  Sidebar nav items                                                  */
/* ------------------------------------------------------------------ */

const MAIN_NAV = [
  { label: 'Home', icon: Home, href: '/dashboard' },
  { label: 'Tournaments', icon: Trophy, href: '/tournaments' },
  { label: 'Matches', icon: Swords, href: '/bracket' },
  { label: 'Teams', icon: Shield, href: '/teams' },
  { label: 'Rankings', icon: BarChart3, href: '/news' },
];

const SOCIAL_NAV = [
  { label: 'Friends', icon: Users, href: '#' },
  { label: 'Messages', icon: MessageSquare, href: '#', badge: 12 },
  { label: 'Notifications', icon: Bell, href: '#', badge: 6 },
];

const ACCOUNT_NAV = [
  { label: 'Profile', icon: UserCircle, href: '#' },
  { label: 'Settings', icon: Settings, href: '#' },
];

/* ------------------------------------------------------------------ */
/*  Countdown hook                                                     */
/* ------------------------------------------------------------------ */

function useCountdowns(matches: UpcomingMatch[]) {
  const [countdowns, setCountdowns] = useState<Record<string, number>>({});

  useEffect(() => {
    const map: Record<string, number> = {};
    matches.forEach((m) => { map[m.id] = m.countdown; });
    setCountdowns(map);

    const iv = setInterval(() => {
      setCountdowns((prev) => {
        const next: Record<string, number> = {};
        for (const k in prev) next[k] = Math.max(0, prev[k] - 1);
        return next;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [matches]);

  return countdowns;
}

function fmtCountdown(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

/* ------------------------------------------------------------------ */
/*  Dashboard Component                                                */
/* ------------------------------------------------------------------ */

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading: authLoading, signOut } = useAuth();

  const [tournaments, setTournaments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Derived data — in production these would come from dedicated endpoints
  const [upcomingMatches, setUpcomingMatches] = useState<UpcomingMatch[]>([]);
  const [leaderboard] = useState<LeaderboardEntry[]>([
    { rank: 1, name: 'Rexon', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rexon', rp: 6250 },
    { rank: 2, name: 'Arjun', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=arjun', rp: 2450 },
    { rank: 3, name: 'Phoenix', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=phoenix', rp: 2120 },
    { rank: 4, name: 'Zoro', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zoro', rp: 1080 },
    { rank: 5, name: 'Shadow', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=shadow', rp: 1060 },
  ]);

  const [recentActivity] = useState<ActivityItem[]>([
    { id: '1', text: 'You won against Team Omega', time: '2m ago', icon: 'trophy' },
    { id: '2', text: 'New match result', detail: 'Victory', detailColor: 'text-green-400', time: '15m ago', icon: 'star' },
    { id: '3', text: 'You earned 250 XP', time: '1h ago', icon: 'flame' },
    { id: '4', text: 'You joined BGMI Pro Scrims', time: '2h ago', icon: 'plus' },
  ]);

  const [topGames] = useState<TopGame[]>([
    { name: 'Valorant', icon: '🎯', matches: 24, pct: 68, color: 'from-red-500 to-rose-600' },
    { name: 'BGMI', icon: '🔫', matches: 18, pct: 72, color: 'from-amber-500 to-orange-600' },
    { name: 'Call of Duty', icon: '💥', matches: 12, pct: 65, color: 'from-emerald-500 to-green-600' },
    { name: 'Free Fire', icon: '🔥', matches: 8, pct: 61, color: 'from-orange-500 to-red-600' },
  ]);

  const countdowns = useCountdowns(upcomingMatches);

  const fetchDashboard = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await tournamentService.getAll({ status: 'ongoing' });
      const list = res?.data ?? [];
      setTournaments(list);

      // Build upcoming-match cards from real tournaments
      const mapped: UpcomingMatch[] = list.slice(0, 3).map((t: any, i: number) => ({
        id: t._id || `t-${i}`,
        game: t.game?.name || 'Tournament',
        gameIcon: t.game?.gameBannerPhoto || '',
        mode: t.teamSize ? `${t.teamSize}v${t.teamSize}` : '5v5',
        teamA: t.teams?.[0]?.name || 'Team Alpha',
        teamB: t.teams?.[1]?.name || 'Team Omega',
        teamALogo: t.teams?.[0]?.logo || 'https://api.dicebear.com/7.x/shapes/svg?seed=teamA',
        teamBLogo: t.teams?.[1]?.logo || 'https://api.dicebear.com/7.x/shapes/svg?seed=teamB',
        time: i === 0 ? 'TODAY · 7:00 PM' : i === 1 ? 'MAY 17 · 5:00 PM' : 'MAY 18 · 8:00 PM',
        date: '',
        countdown: i === 0 ? 9912 : i === 1 ? 74712 : 86400,
        isLive: i === 0,
      }));
      setUpcomingMatches(mapped);
    } catch (err) {
      console.error('Dashboard fetch failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) fetchDashboard();
  }, [authLoading, fetchDashboard]);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const tournamentsJoined = tournaments.length;
  const matchesPlayed = tournaments.reduce((acc: number, t: any) => acc + (t.matchesPlayed || 0), 0) || 48;
  const winRate = 72;
  const currentRank = '#24';

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0b0a12]">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#0b0a12] text-white">
      {/* ============================================================ */}
      {/*  SIDEBAR                                                      */}
      {/* ============================================================ */}
      <aside className="hidden lg:flex flex-col w-[260px] border-r border-white/5 bg-[#0f0d18]/80 backdrop-blur-md">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 px-6 h-20 border-b border-white/5">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#a855f7] via-[#7c3aed] to-[#3b82f6] flex items-center justify-center shadow-lg shadow-purple-500/30">
            <span className="text-white font-black text-lg">T</span>
          </div>
          <span className="text-xl font-bold text-white tracking-tight">Toornify</span>
        </Link>

        {/* Main nav */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">Main</p>
          {MAIN_NAV.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.href;
            return (
              <Link
                key={item.label}
                to={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? 'bg-gradient-to-r from-purple-600/20 to-blue-600/10 text-white border border-purple-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-[18px] h-[18px]" />
                {item.label}
              </Link>
            );
          })}

          <p className="px-3 mt-6 mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">Social</p>
          {SOCIAL_NAV.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                to={item.href}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all"
              >
                <span className="flex items-center gap-3">
                  <Icon className="w-[18px] h-[18px]" />
                  {item.label}
                </span>
                {item.badge && (
                  <span className="min-w-[22px] h-[22px] flex items-center justify-center rounded-full bg-purple-600 text-[11px] font-bold text-white px-1.5">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <p className="px-3 mt-6 mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">Account</p>
          {ACCOUNT_NAV.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                to={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all"
              >
                <Icon className="w-[18px] h-[18px]" />
                {item.label}
              </Link>
            );
          })}

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/5 transition-all"
          >
            <LogOut className="w-[18px] h-[18px]" />
            Log out
          </button>
        </nav>
      </aside>

      {/* ============================================================ */}
      {/*  MAIN CONTENT                                                 */}
      {/* ============================================================ */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-6 lg:px-8 bg-[#0f0d18]/60 backdrop-blur-md">
          <div className="flex items-center gap-3 w-full max-w-md">
            <Search className="w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search tournaments, teams, players..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none"
            />
            <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 rounded border border-white/10 text-[10px] font-mono text-gray-500">⌘K</kbd>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-purple-500" />
            </button>
            <button className="relative p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all">
              <MessageSquare className="w-5 h-5" />
            </button>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center border-2 border-purple-500/30 overflow-hidden">
              {user?.profilePic || user?.image ? (
                <img src={getImageUrl(user.profilePic || user.image)} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-sm font-bold">{user?.username?.[0]?.toUpperCase() || 'U'}</span>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable body */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {/* Welcome */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            <h1 className="text-3xl sm:text-4xl font-bold">
              Welcome back, <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">{user?.username || 'Player'}</span>! 👋
            </h1>
            <p className="text-gray-400 mt-1">Ready to dominate today?</p>
          </motion.div>

          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Tournaments Joined', value: tournamentsJoined.toString(), change: '20%', icon: Trophy, color: 'from-purple-500/20 to-purple-600/10', border: 'border-purple-500/20' },
              { label: 'Matches Played', value: matchesPlayed.toString(), change: '15%', icon: Swords, color: 'from-blue-500/20 to-blue-600/10', border: 'border-blue-500/20' },
              { label: 'Win Rate', value: `${winRate}%`, change: '8%', icon: BarChart3, color: 'from-rose-500/20 to-rose-600/10', border: 'border-rose-500/20' },
              { label: 'Current Rank', value: currentRank, sub: 'Diamond II', icon: Star, color: 'from-amber-500/20 to-amber-600/10', border: 'border-amber-500/20' },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-xl border ${s.border} bg-gradient-to-br ${s.color} backdrop-blur-sm p-5`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-medium text-gray-400">{s.label}</p>
                    <div className="p-2 rounded-lg bg-white/5"><Icon className="w-4 h-4 text-gray-300" /></div>
                  </div>
                  <p className="text-3xl font-bold">{isLoading ? '...' : s.value}</p>
                  {s.sub ? (
                    <p className="text-xs text-gray-400 mt-1">{s.sub}</p>
                  ) : (
                    <p className="text-xs text-green-400 mt-1">▲ {s.change} vs last month</p>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Main grid */}
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
            {/* Left column */}
            <div className="space-y-6">
              {/* Upcoming matches */}
              <div className="rounded-xl border border-white/5 bg-[#12101c]/80 backdrop-blur-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Upcoming Matches</h2>
                  <Link to="/tournaments" className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1">
                    View All <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>

                {isLoading ? (
                  <div className="flex justify-center py-10"><Loader size="md" /></div>
                ) : upcomingMatches.length === 0 ? (
                  <p className="text-center text-gray-500 py-10">No upcoming matches. Join a tournament!</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {upcomingMatches.map((match) => (
                      <div key={match.id} className="rounded-xl border border-white/5 bg-[#18152a]/80 p-4">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{match.time}</p>
                          {match.isLive ? (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-[10px] font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Live
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold">Upcoming</span>
                          )}
                        </div>
                        <p className="font-semibold text-sm mb-1">{match.game}</p>
                        <p className="text-[10px] text-gray-500 mb-3">{match.mode}</p>

                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <img src={match.teamALogo} alt="" className="w-8 h-8 rounded-full bg-white/10" />
                            <span className="text-xs font-medium">{match.teamA}</span>
                          </div>
                          <span className="text-xs font-bold text-gray-500">vs</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium">{match.teamB}</span>
                            <img src={match.teamBLogo} alt="" className="w-8 h-8 rounded-full bg-white/10" />
                          </div>
                        </div>

                        <div className="text-center mb-3">
                          <p className="text-2xl font-bold font-mono tracking-wider">
                            {fmtCountdown(countdowns[match.id] ?? match.countdown)}
                          </p>
                          <p className="text-[10px] text-gray-500">Time Left</p>
                        </div>

                        <Link
                          to={`/tournaments`}
                          className="block w-full text-center py-2 rounded-lg border border-white/10 text-xs font-medium text-gray-300 hover:text-white hover:border-purple-500/30 hover:bg-purple-500/5 transition-all"
                        >
                          View Match
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom row: Top games + Leaderboard */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Top Games */}
                <div className="rounded-xl border border-white/5 bg-[#12101c]/80 backdrop-blur-sm p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-semibold">Top Titles</h2>
                      <p className="text-xs text-gray-500">Based on your activity</p>
                    </div>
                    <Link to="/games" className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1">
                      View All <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                  <div className="space-y-4">
                    {topGames.map((g) => (
                      <div key={g.name} className="flex items-center gap-3">
                        <span className="text-lg">{g.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-medium truncate">{g.name}</p>
                            <p className="text-xs text-gray-400">{g.matches} Matches</p>
                          </div>
                          <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                            <div
                              className={`h-full rounded-full bg-gradient-to-r ${g.color}`}
                              style={{ width: `${g.pct}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-sm font-bold text-purple-300 w-10 text-right">{g.pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Leaderboard */}
                <div className="rounded-xl border border-white/5 bg-[#12101c]/80 backdrop-blur-sm p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-semibold">Leaderboard</h2>
                      <p className="text-xs text-gray-500">This Season</p>
                    </div>
                    <Link to="/news" className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1">
                      View All <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                  <div className="space-y-3">
                    {leaderboard.map((entry) => (
                      <div key={entry.rank} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-all">
                        <span className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold ${
                          entry.rank === 1 ? 'bg-amber-500/20 text-amber-400' :
                          entry.rank === 2 ? 'bg-gray-400/20 text-gray-300' :
                          entry.rank === 3 ? 'bg-orange-500/20 text-orange-400' :
                          'bg-white/5 text-gray-500'
                        }`}>
                          {entry.rank}
                        </span>
                        <img src={entry.avatar} alt={entry.name} className="w-8 h-8 rounded-full bg-white/10" />
                        <span className="flex-1 text-sm font-medium">{entry.name}</span>
                        <span className="text-sm font-bold text-purple-300">{entry.rp.toLocaleString()} RP</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Create Tournament CTA */}
              <div className="relative rounded-xl overflow-hidden border border-purple-500/20">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-900/40 via-[#12101c] to-[#12101c]" />
                <div className="relative p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold mb-1">Create your own tournament</h3>
                    <p className="text-sm text-gray-400">Set your rules, invite players, and build your legacy.</p>
                  </div>
                  <Link
                    to="/tournaments"
                    className="shrink-0 px-6 py-3 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-[#7c3aed] to-[#a855f7] hover:shadow-lg hover:shadow-purple-500/40 transition-all"
                  >
                    Create Tournament
                  </Link>
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-6">
              {/* Your Progress */}
              <div className="rounded-xl border border-white/5 bg-[#12101c]/80 backdrop-blur-sm p-5">
                <h2 className="text-lg font-semibold mb-4">Your Progress</h2>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Level 28</span>
                  <span className="text-xs text-gray-500">4,250 / 6,000 XP</span>
                </div>
                <div className="h-2.5 rounded-full bg-white/5 overflow-hidden mb-5">
                  <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500" style={{ width: '70%' }} />
                </div>

                <div className="text-center p-4 rounded-lg border border-white/5 bg-[#18152a]/60 mb-4">
                  <p className="text-xs text-gray-500 mb-1">Season 5</p>
                  <p className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Diamond II</p>
                  <p className="text-sm text-gray-400 mt-1">2,450 RP</p>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="rounded-xl border border-white/5 bg-[#12101c]/80 backdrop-blur-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Recent Activity</h2>
                  <button className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1">
                    View All <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="space-y-4">
                  {recentActivity.map((item) => {
                    const iconMap = {
                      trophy: <Trophy className="w-4 h-4 text-amber-400" />,
                      star: <Star className="w-4 h-4 text-green-400" />,
                      flame: <Flame className="w-4 h-4 text-orange-400" />,
                      plus: <Plus className="w-4 h-4 text-purple-400" />,
                    };
                    return (
                      <div key={item.id} className="flex items-start gap-3">
                        <div className="mt-0.5 p-1.5 rounded-lg bg-white/5">{iconMap[item.icon]}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm">{item.text}</p>
                          {item.detail && <p className={`text-xs font-semibold ${item.detailColor || 'text-gray-400'}`}>{item.detail}</p>}
                        </div>
                        <span className="text-[10px] text-gray-500 shrink-0">{item.time}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tournament Spotlight */}
              <div className="rounded-xl border border-white/5 bg-[#12101c]/80 backdrop-blur-sm overflow-hidden">
                <div className="h-32 bg-gradient-to-br from-purple-900/60 via-purple-800/30 to-[#12101c] flex items-center justify-center relative">
                  <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" /> LIVE
                  </span>
                  <Trophy className="w-10 h-10 text-purple-300/40" />
                </div>
                <div className="p-5">
                  <h3 className="font-semibold mb-1">Toornify Champions Cup</h3>
                  <p className="text-xs text-gray-400 mb-1">$50,000 Prize Pool</p>
                  <p className="text-xs text-purple-300 mb-3">128 Teams · Live Now</p>
                  <Link
                    to="/tournaments"
                    className="block w-full text-center py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-[#7c3aed] to-[#a855f7] hover:shadow-lg hover:shadow-purple-500/40 transition-all"
                  >
                    Watch Now
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
