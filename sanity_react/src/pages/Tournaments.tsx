import { useState, useCallback, useMemo, useEffect } from "react";
import {
  Search, RefreshCw, AlertCircle, Trophy, Users,
  ChevronDown, Plus, Flame, Gamepad2, ShieldCheck, ChevronLeft, ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/ui/Loader";
import { CreateTournamentModal } from "@/components/CreateTournamentModal";
import type { TournamentFormData } from "@/components/CreateTournamentModal";
import { lichessService, tournamentService } from "@/lib/services";
import { getImageUrl } from "@/lib/utils";
import type { Tournament } from "@/lib/services/tournament.service";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";

const TOURNAMENT_SOURCE_STORAGE_KEY = "tournaments.source";
const PAGE_SIZE = 8;

export function Tournaments() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  /* --------------------------- data state (preserved) ---------------------- */
  const [tournamentSource, setTournamentSource] = useState<"platform" | "lichess">(() => {
    const stored = localStorage.getItem(TOURNAMENT_SOURCE_STORAGE_KEY);
    return stored === "lichess" ? "lichess" : "platform";
  });
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [filters, setFilters] = useState({
    search: "",
    gameType: "",
    status: "",
    region: "",
    sortBy: "newest" as "newest" | "oldest" | "prize" | "participants",
  });
  const [page, setPage] = useState(1);

  /* --------------------------- effects (preserved) ------------------------- */
  useEffect(() => {
    fetchTournaments();
  }, [filters.gameType, filters.status]);

  useEffect(() => {
    localStorage.setItem(TOURNAMENT_SOURCE_STORAGE_KEY, tournamentSource);
  }, [tournamentSource]);

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
      console.error("Failed to fetch tournaments:", err);
      setError(err.message || "Failed to load tournaments");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTournament = async (data: TournamentFormData) => {
    try {
      if (!isAuthenticated || !user?.email) {
        toast.error("You must be signed in to create a tournament");
        return;
      }
      await tournamentService.create({ ...data, email: user.email } as any);
      await fetchTournaments();
      setIsCreateModalOpen(false);
      toast.success("Tournament created successfully");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to create tournament");
    }
  };

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((p) => ({ ...p, search: e.target.value }));
    setPage(1);
  }, []);

  /* --------------------------- derived data -------------------------------- */
  const filteredTournaments = useMemo(() => {
    let arr = tournaments.filter((t) => {
      if (filters.search && !t.tournamentName?.toLowerCase().includes(filters.search.toLowerCase())) return false;
      if (filters.gameType && t.gameType !== filters.gameType) return false;
      if (filters.status && t.status !== filters.status) return false;
      return true;
    });
    // sort
    switch (filters.sortBy) {
      case "newest":
        arr = arr.slice().sort((a, b) =>
          new Date(b.tournamentStartDate || 0).getTime() - new Date(a.tournamentStartDate || 0).getTime()
        );
        break;
      case "oldest":
        arr = arr.slice().sort((a, b) =>
          new Date(a.tournamentStartDate || 0).getTime() - new Date(b.tournamentStartDate || 0).getTime()
        );
        break;
      case "prize":
        arr = arr.slice().sort((a, b) => (b.prizePool || 0) - (a.prizePool || 0));
        break;
      case "participants":
        arr = arr.slice().sort((a, b) => (b.registeredNumber || 0) - (a.registeredNumber || 0));
        break;
    }
    return arr;
  }, [tournaments, filters]);

  const totalPages = Math.max(1, Math.ceil(filteredTournaments.length / PAGE_SIZE));
  const pagedTournaments = filteredTournaments.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  /* --------------------------- sidebar aggregations ------------------------ */
  const liveNow = useMemo(() => groupByGame(tournaments, ["ongoing", "in_progress", "registration_open"]), [tournaments]);
  const upcoming = useMemo(() => groupByGame(tournaments, ["upcoming", "registration_closed"]), [tournaments]);

  /* ======================================================================== */
  return (
    <div className="relative">
      {/* HERO */}
      <Hero />

      <div id="tournament-list" className="relative max-w-[1480px] mx-auto px-5 sm:px-6 lg:px-10 py-10">
        {/* FILTER BAR — translucent so the global video shows through */}
        <div className="relative rounded-2xl bg-white/[0.04] ring-1 ring-inset ring-white/10 p-3 mb-8 backdrop-blur-md">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search tournaments..."
                value={filters.search}
                onChange={handleSearchChange}
                className="w-full bg-white/[0.03] ring-1 ring-inset ring-white/8 focus:ring-purple-400/40 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-gray-500 outline-none transition-colors"
              />
            </div>

            <FilterDropdown
              label="All Games"
              value={filters.gameType}
              onChange={(v) => { setFilters((p) => ({ ...p, gameType: v })); setPage(1); }}
              options={[
                { value: "", label: "All Games" },
                { value: "SOLO", label: "Solo" },
                { value: "DUO", label: "Duo" },
                { value: "SQUAD", label: "Squad" },
              ]}
            />
            <FilterDropdown
              label="All Status"
              value={filters.status}
              onChange={(v) => { setFilters((p) => ({ ...p, status: v })); setPage(1); }}
              options={[
                { value: "", label: "All Status" },
                { value: "ongoing", label: "Live" },
                { value: "upcoming", label: "Upcoming" },
                { value: "completed", label: "Completed" },
              ]}
            />
            <FilterDropdown
              label="All Regions"
              value={filters.region}
              onChange={(v) => setFilters((p) => ({ ...p, region: v }))}
              options={[
                { value: "", label: "All Regions" },
                { value: "global", label: "Global" },
                { value: "na", label: "North America" },
                { value: "eu", label: "Europe" },
                { value: "apac", label: "Asia-Pacific" },
              ]}
            />

            <div className="ml-auto flex items-center gap-3">
              <SortBy
                value={filters.sortBy}
                onChange={(v) => setFilters((p) => ({ ...p, sortBy: v as any }))}
              />
              <button
                onClick={fetchTournaments}
                className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] ring-1 ring-inset ring-white/10 text-gray-300 transition-colors"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              </button>
              {isAuthenticated && (
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="hidden md:inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#a855f7] hover:scale-[1.02] text-white text-sm font-bold shadow-lg shadow-purple-900/40 transition-all"
                >
                  <Plus className="w-4 h-4" /> Create
                </button>
              )}
            </div>
          </div>
        </div>

        {/* MAIN GRID: sidebar + list (sidebar moves below on mobile) */}
        <div className="grid lg:grid-cols-[280px_1fr] gap-6">
          {/* SIDEBAR */}
          <aside className="order-2 lg:order-1 space-y-5">
            <SidebarSection title="Live Now" count={liveNow.length} accent="red">
              {liveNow.length === 0 ? (
                <EmptySide label="No live tournaments" />
              ) : (
                liveNow.map((g) => (
                  <SidebarRow
                    key={g.label + "live"}
                    label={g.label}
                    count={g.count}
                    onClick={() => setFilters((p) => ({ ...p, status: "ongoing" }))}
                  />
                ))
              )}
            </SidebarSection>

            <SidebarSection title="Upcoming" count={upcoming.length}>
              {upcoming.length === 0 ? (
                <EmptySide label="No upcoming tournaments" />
              ) : (
                upcoming.map((g) => (
                  <SidebarRow
                    key={g.label + "up"}
                    label={g.label}
                    count={g.count}
                    onClick={() => setFilters((p) => ({ ...p, status: "upcoming" }))}
                  />
                ))
              )}
              <button
                onClick={() => setFilters((p) => ({ ...p, status: "upcoming" }))}
                className="mt-2 w-full text-[11px] font-bold text-purple-300 hover:text-purple-200 transition-colors text-left pl-3 py-1"
              >
                View All Upcoming →
              </button>
            </SidebarSection>

            <SidebarSection title="Top Organizers" count={5}>
              {TOP_ORGANIZERS.map((o) => (
                <div
                  key={o.name}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/[0.03] cursor-pointer transition-colors"
                >
                  <div className="w-7 h-7 rounded-md bg-gradient-to-br from-purple-500/30 to-fuchsia-500/30 ring-1 ring-inset ring-white/10 flex items-center justify-center">
                    <o.icon className="w-3.5 h-3.5 text-purple-200" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[12px] font-bold text-white truncate">{o.name}</div>
                    <div className="text-[10px] text-gray-500">{o.tournaments} tournaments</div>
                  </div>
                </div>
              ))}
              <button className="mt-2 w-full text-[11px] font-bold text-purple-300 hover:text-purple-200 transition-colors text-left pl-3 py-1">
                View All Organizers →
              </button>
            </SidebarSection>
          </aside>

          {/* TOURNAMENT LIST */}
          <main className="order-1 lg:order-2 min-w-0">
            {/* table-style header (desktop) */}
            <div className="hidden lg:grid grid-cols-[1.4fr_0.7fr_0.7fr_0.7fr_0.8fr_0.6fr] gap-3 px-4 py-2 mb-2 text-[10px] uppercase tracking-[0.18em] text-gray-500 font-bold">
              <span>Tournament</span>
              <span>Game</span>
              <span>Prize Pool</span>
              <span>Participants</span>
              <span>Starts In</span>
              <span className="text-right">Status</span>
            </div>

            {/* states */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-4 bg-red-900/20 ring-1 ring-inset ring-red-500/30 rounded-2xl text-red-300 mb-4"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-bold">Failed to load tournaments</p>
                  <p className="text-sm text-red-400/80">{error}</p>
                </div>
                <Button onClick={fetchTournaments} variant="outline" className="border-red-500/40 hover:bg-red-900/30">
                  Retry
                </Button>
              </motion.div>
            )}

            {isLoading && (
              <div className="flex flex-col items-center justify-center min-h-[400px] rounded-2xl bg-white/[0.02] ring-1 ring-inset ring-white/5">
                <Loader variant="spinner" size="lg" />
                <p className="text-gray-400 mt-4 text-sm">Loading tournaments…</p>
              </div>
            )}

            {!isLoading && !error && (
              <>
                <AnimatePresence mode="popLayout">
                  <div className="space-y-2.5">
                    {pagedTournaments.map((t, i) => (
                      <TournamentRow key={t._id} tournament={t} index={i} onClick={() => navigate(`/tournaments/${t._id}`)} />
                    ))}
                  </div>
                </AnimatePresence>

                {filteredTournaments.length === 0 && (
                  <EmptyState onClear={() => setFilters({ search: "", gameType: "", status: "", region: "", sortBy: "newest" })} />
                )}

                {/* pagination */}
                {filteredTournaments.length > PAGE_SIZE && (
                  <Pagination page={page} totalPages={totalPages} onChange={setPage} />
                )}
              </>
            )}
          </main>
        </div>

        {/* small toggle for legacy lichess view (kept for back-compat) */}
        {lichessService.isConnected() && (
          <div className="mt-10 flex justify-center">
            <button
              onClick={() => setTournamentSource(tournamentSource === "platform" ? "lichess" : "platform")}
              className="text-[11px] font-bold uppercase tracking-[0.22em] text-gray-500 hover:text-purple-300 transition-colors"
            >
              {tournamentSource === "platform" ? "Switch to Lichess arenas →" : "← Back to platform tournaments"}
            </button>
          </div>
        )}
      </div>

      <CreateTournamentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTournament}
      />
    </div>
  );
}

/* ============================================================================
 *  HERO
 * ========================================================================= */
function Hero() {
  return (
    <section className="relative pt-32 pb-10 overflow-hidden">
      {/* atmospheric gradient orb — no opaque image overlay anymore so the
          global video backdrop & laser-rain remain visible */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute -top-40 right-[-10%] w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.28),transparent_65%)] blur-2xl" />
        <div className="absolute -bottom-40 left-[-10%] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.20),transparent_70%)] blur-2xl" />
      </div>

      <div className="max-w-[1480px] mx-auto px-5 sm:px-6 lg:px-10 grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-end">
        {/* LEFT: copy */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 backdrop-blur-sm mb-5"
          >
            <Flame className="w-3 h-3 text-purple-300" />
            <span className="text-xs font-bold uppercase tracking-[0.22em] text-purple-200">
              Discover · Compete · Conquer
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-[3.8rem] font-black tracking-tight leading-[1.02] mb-4"
          >
            Find your next{" "}
            <span className="bg-gradient-to-r from-[#a855f7] via-[#c084fc] to-[#7c3aed] bg-clip-text text-transparent">
              tournament
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-gray-400 text-base sm:text-lg max-w-xl mb-7"
          >
            Explore thousands of esports tournaments across your favorite games. Build your roster, climb the ranks, claim the trophy.
          </motion.p>

          {/* primary CTAs in the hero so they stop hiding inside the filter bar */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex items-center flex-wrap gap-3"
          >
            <a
              href="#tournament-list"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#a855f7] text-white text-sm font-bold shadow-lg shadow-purple-900/40 hover:scale-[1.02] hover:shadow-purple-700/60 transition-all"
            >
              Browse Tournaments <ChevronRight className="w-4 h-4" />
            </a>
            <a
              href="#create"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.10] ring-1 ring-inset ring-white/10 text-white text-sm font-bold transition-all"
            >
              <Plus className="w-4 h-4" /> Host Your Own
            </a>
          </motion.div>
        </div>

        {/* RIGHT: live stat cards — cleaner than a faded controller image */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="grid grid-cols-2 gap-3 sm:gap-4"
        >
          {[
            { v: "24K+", l: "Tournaments Hosted", icon: Trophy, accent: "from-purple-500/30 to-fuchsia-500/20" },
            { v: "850K",  l: "Players Registered", icon: Users, accent: "from-blue-500/30 to-purple-500/20" },
            { v: "180",   l: "Live Right Now",     icon: Flame, accent: "from-red-500/30 to-orange-500/20" },
            { v: "40+",   l: "Gaming Communities", icon: ShieldCheck, accent: "from-emerald-500/30 to-cyan-500/20" },
          ].map((s, i) => (
            <motion.div
              key={s.l}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 + i * 0.07 }}
              className="relative rounded-2xl overflow-hidden ring-1 ring-inset ring-white/10 backdrop-blur-md bg-white/[0.04] p-4 sm:p-5"
            >
              <div className={`absolute -inset-px rounded-2xl bg-gradient-to-br ${s.accent} opacity-40 pointer-events-none`} />
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/15 ring-1 ring-inset ring-purple-400/40 flex items-center justify-center">
                    <s.icon className="w-4 h-4 text-purple-200" />
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white tabular-nums tracking-tight">{s.v}</div>
                <div className="text-[10.5px] text-gray-400 uppercase tracking-[0.2em] font-bold mt-1">{s.l}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ============================================================================
 *  TOURNAMENT ROW
 * ========================================================================= */
function TournamentRow({
  tournament: t,
  index,
  onClick,
}: {
  tournament: Tournament;
  index: number;
  onClick: () => void;
}) {
  const status = (t.status || "upcoming") as string;
  const isLive = ["ongoing", "in_progress", "registration_open"].includes(status);
  const banner = t.tournamentBanner || t.gameBannerPhoto || t.game?.gameBannerPhoto;
  const startsIn = formatStartsIn(t.tournamentStartDate);
  const fmt = t.tournamentFormat || t.gameType || "Standard";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      whileHover={{ y: -2 }}
      onClick={onClick}
      className="group relative cursor-pointer rounded-2xl bg-white/[0.025] ring-1 ring-inset ring-white/8 hover:ring-purple-400/40 overflow-hidden transition-all"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      <div className="absolute inset-y-0 -left-2 w-1 bg-gradient-to-b from-purple-500/0 via-purple-500/0 to-purple-500/0 group-hover:from-purple-500/80 group-hover:via-fuchsia-500/80 group-hover:to-purple-500/80 transition-all" />

      {/* DESKTOP: 6-column grid · MOBILE: stacked card */}
      <div className="hidden lg:grid grid-cols-[1.4fr_0.7fr_0.7fr_0.7fr_0.8fr_0.6fr] gap-3 p-3 items-center">
        {/* TOURNAMENT (image + name + format) */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative w-20 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-[#1a0f2e] ring-1 ring-inset ring-white/10">
            {banner ? (
              <img src={getImageUrl(banner)} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Gamepad2 className="w-5 h-5 text-purple-300/60" />
              </div>
            )}
            {isLive && (
              <span className="absolute top-1 left-1 inline-flex items-center gap-0.5 px-1 py-0.5 rounded text-[8px] font-black bg-red-500/95 text-white tracking-widest">
                <span className="w-1 h-1 rounded-full bg-white animate-pulse" /> LIVE
              </span>
            )}
          </div>
          <div className="min-w-0">
            <div className="text-[14px] font-black text-white tracking-tight truncate group-hover:text-purple-200 transition-colors">
              {t.tournamentName}
            </div>
            <div className="text-[11px] text-gray-500 truncate">{fmt} · {(t.maxTeams || 0) || "Open"} Teams</div>
          </div>
        </div>

        {/* GAME */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-purple-500/30 to-fuchsia-500/30 ring-1 ring-inset ring-white/10 flex items-center justify-center flex-shrink-0">
            <Gamepad2 className="w-3.5 h-3.5 text-purple-200" />
          </div>
          <span className="text-[12px] font-bold text-white truncate">{t.game?.name || "Game"}</span>
        </div>

        {/* PRIZE POOL */}
        <div className="hidden lg:block">
          <div className="text-[14px] font-black text-white tabular-nums">${(t.prizePool || 0).toLocaleString()}</div>
          <div className="text-[10px] text-gray-500 uppercase tracking-wider">Prize Pool</div>
        </div>

        {/* PARTICIPANTS */}
        <div className="hidden lg:block">
          <div className="text-[14px] font-black text-white tabular-nums">
            {t.registeredNumber ?? t.teamsRegistered?.length ?? 0}
            <span className="text-gray-500 font-normal">/{t.maxTeams || 0}</span>
          </div>
          <div className="text-[10px] text-gray-500 uppercase tracking-wider">Teams</div>
        </div>

        {/* STARTS IN */}
        <div className="hidden lg:block">
          <div className="text-[13px] font-black text-white tabular-nums truncate">{startsIn}</div>
          <div className="text-[10px] text-gray-500 uppercase tracking-wider">
            {isLive ? "Live now" : t.tournamentStartDate ? new Date(t.tournamentStartDate).toLocaleDateString() : ""}
          </div>
        </div>

        {/* STATUS BADGE */}
        <div className="flex lg:justify-end">
          <StatusBadge status={status} />
        </div>
      </div>

      {/* MOBILE: stacked card */}
      <div className="lg:hidden p-3">
        <div className="flex items-start gap-3 mb-3">
          <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-[#1a0f2e] ring-1 ring-inset ring-white/10">
            {banner ? (
              <img src={getImageUrl(banner)} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Gamepad2 className="w-5 h-5 text-purple-300/60" />
              </div>
            )}
            {isLive && (
              <span className="absolute top-1 left-1 inline-flex items-center gap-0.5 px-1 py-0.5 rounded text-[7px] font-black bg-red-500/95 text-white tracking-widest">
                <span className="w-1 h-1 rounded-full bg-white animate-pulse" /> LIVE
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-2 justify-between">
              <div className="min-w-0 flex-1">
                <div className="text-[13.5px] font-black text-white tracking-tight leading-tight mb-0.5">
                  {t.tournamentName}
                </div>
                <div className="text-[11px] text-gray-500 truncate">
                  {t.game?.name || "Game"} · {fmt}
                </div>
              </div>
              <StatusBadge status={status} />
            </div>
          </div>
        </div>

        {/* mobile chip strip */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/8">
          <MobileStat
            label="Prize"
            value={`$${(t.prizePool || 0).toLocaleString()}`}
          />
          <MobileStat
            label="Teams"
            value={`${t.registeredNumber ?? t.teamsRegistered?.length ?? 0}/${t.maxTeams || 0}`}
          />
          <MobileStat
            label={isLive ? "Live now" : "Starts in"}
            value={startsIn}
          />
        </div>
      </div>
    </motion.div>
  );
}

function MobileStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-0.5">{label}</div>
      <div className="text-[12px] font-black text-white tabular-nums truncate">{value}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const live = ["ongoing", "in_progress", "registration_open"].includes(status);
  if (live) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-500/15 text-red-300 ring-1 ring-inset ring-red-400/40 text-[10px] font-black tracking-widest uppercase">
        <span className="relative inline-flex w-1.5 h-1.5">
          <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-75" />
          <span className="relative inline-block w-1.5 h-1.5 rounded-full bg-red-400" />
        </span>
        Live
      </span>
    );
  }
  if (status === "completed") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-500/15 text-gray-300 ring-1 ring-inset ring-gray-400/30 text-[10px] font-black tracking-widest uppercase">
        Completed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-500/15 text-purple-300 ring-1 ring-inset ring-purple-400/40 text-[10px] font-black tracking-widest uppercase">
      Upcoming
    </span>
  );
}

/* ============================================================================
 *  SIDEBAR
 * ========================================================================= */
function SidebarSection({
  title,
  count,
  accent,
  children,
}: {
  title: string;
  count?: number;
  accent?: "red";
  children: React.ReactNode;
}) {
  return (
    <div className="relative rounded-2xl bg-white/[0.03] ring-1 ring-inset ring-white/8 overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          {accent === "red" && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
          <h4 className="text-[13px] font-black text-white tracking-tight">{title}</h4>
        </div>
        {count !== undefined && (
          <span className="text-[10px] font-black text-purple-300 tabular-nums">{count}</span>
        )}
      </div>
      <div className="px-2 pb-3 space-y-0.5">{children}</div>
    </div>
  );
}

function SidebarRow({ label, count, onClick }: { label: string; count: number; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg hover:bg-white/[0.04] transition-colors text-left"
    >
      <span className="text-[12px] text-gray-300 group-hover:text-white truncate">{label}</span>
      <span className="text-[11px] font-black text-purple-300 tabular-nums">{count}</span>
    </button>
  );
}

function EmptySide({ label }: { label: string }) {
  return <p className="px-3 py-2 text-[11px] text-gray-500 italic">{label}</p>;
}

const TOP_ORGANIZERS: { name: string; tournaments: number; icon: any }[] = [
  { name: "Toornify Esports",  tournaments: 12, icon: Trophy },
  { name: "Skyline Gaming",    tournaments: 8,  icon: Flame },
  { name: "Revenant Esports",  tournaments: 6,  icon: ShieldCheck },
  { name: "Wolves Esports",    tournaments: 5,  icon: Gamepad2 },
  { name: "Apex Esports",      tournaments: 4,  icon: Users },
];

/* ============================================================================
 *  PAGINATION
 * ========================================================================= */
function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void }) {
  const pages = pageNumbers(page, totalPages);
  return (
    <div className="mt-8 flex items-center justify-center gap-1">
      <PageButton
        disabled={page === 1}
        onClick={() => onChange(Math.max(1, page - 1))}
        ariaLabel="Previous"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
      </PageButton>
      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`dots-${i}`} className="px-2 text-gray-500 text-sm">…</span>
        ) : (
          <PageButton key={p} active={p === page} onClick={() => onChange(p as number)}>
            {p}
          </PageButton>
        )
      )}
      <PageButton
        disabled={page === totalPages}
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        ariaLabel="Next"
      >
        <ChevronRight className="w-3.5 h-3.5" />
      </PageButton>
    </div>
  );
}

function PageButton({
  children, onClick, disabled, active, ariaLabel,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
  ariaLabel?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`min-w-[34px] h-[34px] px-2 rounded-lg text-[12px] font-bold flex items-center justify-center transition-all ${
        active
          ? "bg-gradient-to-b from-[#7c3aed] to-[#5b21b6] text-white ring-1 ring-inset ring-purple-300/30 shadow-md shadow-purple-900/40"
          : "bg-white/[0.04] hover:bg-white/[0.08] ring-1 ring-inset ring-white/8 text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed"
      }`}
    >
      {children}
    </button>
  );
}

function pageNumbers(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const set: (number | "…")[] = [1];
  if (current > 3) set.push("…");
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) set.push(i);
  if (current < total - 2) set.push("…");
  set.push(total);
  return set;
}

/* ============================================================================
 *  FILTER DROPDOWN + SORT
 * ========================================================================= */
function FilterDropdown({
  label, value, onChange, options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] ring-1 ring-inset ring-white/8 text-sm text-white font-medium transition-colors"
      >
        <span>{selected?.value ? selected.label : label}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.15 }}
              className="absolute z-40 mt-2 min-w-[180px] rounded-xl bg-[#0d0620] ring-1 ring-inset ring-white/12 shadow-2xl shadow-black/50 p-1 backdrop-blur-md"
            >
              {options.map((o) => (
                <button
                  key={o.value}
                  onClick={() => { onChange(o.value); setOpen(false); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    value === o.value
                      ? "bg-purple-500/20 text-purple-200 font-bold"
                      : "text-gray-300 hover:bg-white/[0.04]"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function SortBy({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="hidden md:flex items-center gap-2 text-sm">
      <span className="text-gray-500 text-[12px] font-medium">Sort by:</span>
      <FilterDropdown
        label="Newest"
        value={value}
        onChange={onChange}
        options={[
          { value: "newest", label: "Newest" },
          { value: "oldest", label: "Oldest" },
          { value: "prize", label: "Prize Pool" },
          { value: "participants", label: "Participants" },
        ]}
      />
    </div>
  );
}

/* ============================================================================
 *  EMPTY STATE
 * ========================================================================= */
function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="rounded-2xl bg-white/[0.03] ring-1 ring-inset ring-white/8 p-10 text-center">
      <div className="relative inline-flex items-center justify-center mb-4">
        <div className="absolute inset-0 bg-purple-500/30 blur-2xl rounded-full" />
        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-fuchsia-500/20 ring-1 ring-inset ring-purple-400/30 flex items-center justify-center">
          <Trophy className="w-7 h-7 text-purple-300" />
        </div>
      </div>
      <h3 className="text-xl font-black text-white mb-2">No tournaments found</h3>
      <p className="text-gray-400 text-sm mb-5">Try adjusting your filters or check back later.</p>
      <button
        onClick={onClear}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#a855f7] text-white font-bold text-sm shadow-lg shadow-purple-900/40 hover:scale-[1.02] transition-all"
      >
        Clear Filters
      </button>
    </div>
  );
}

/* ============================================================================
 *  HELPERS
 * ========================================================================= */
function groupByGame(arr: Tournament[], statuses: string[]): { label: string; count: number }[] {
  const filtered = arr.filter((t) => statuses.includes(t.status || ""));
  const map = new Map<string, number>();
  filtered.forEach((t) => {
    const name = t.game?.name || t.gameType || "Other";
    map.set(name, (map.get(name) || 0) + 1);
  });
  return Array.from(map.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
}

function formatStartsIn(start?: string | Date | null): string {
  if (!start) return "—";
  const target = new Date(start).getTime();
  if (Number.isNaN(target)) return "—";
  const diff = target - Date.now();
  if (diff <= 0) return "Now";
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  if (days > 0) return `${days}D ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}
