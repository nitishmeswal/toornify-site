import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Gamepad2, Users, Trophy, Sparkles, ArrowUpRight, AlertCircle, RefreshCw,
} from "lucide-react";
import SEO from "@/components/SEO";
import { Loader } from "@/components/ui/Loader";
import { gameService } from "@/lib/services";
import type { Game as ApiGame } from "@/lib/services/game.service";
import { getImageUrl } from "@/lib/utils";

const ACCENT_GRADIENTS = [
  "from-red-500/40 via-rose-500/20 to-transparent",
  "from-amber-500/40 via-orange-500/20 to-transparent",
  "from-emerald-500/40 via-green-500/20 to-transparent",
  "from-orange-500/40 via-red-500/20 to-transparent",
  "from-blue-500/40 via-cyan-500/20 to-transparent",
  "from-rose-500/40 via-red-500/20 to-transparent",
  "from-fuchsia-500/40 via-purple-500/20 to-transparent",
  "from-violet-500/40 via-purple-500/20 to-transparent",
  "from-cyan-500/40 via-blue-500/20 to-transparent",
  "from-pink-500/40 via-rose-500/20 to-transparent",
];

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=900&q=80";

interface DisplayGame {
  _id: string;
  name: string;
  genre: string;
  playerCount: number;
  image: string;
  accent: string;
}

export default function Games() {
  const [games, setGames] = useState<DisplayGame[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState<string>("All Games");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let stale = false;

    async function fetchGames() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await gameService.getAll();
        if (stale) return;
        const mapped: DisplayGame[] = data.map((g, i: number) => {
          const raw = g as ApiGame & { playerCount?: number; players?: string[] };
          return {
            _id: raw._id || raw.id || '',
            name: raw.name,
            genre: raw.category || raw.platform?.[0] || "General",
            playerCount: raw.playerCount || raw.players?.length || 0,
            image: raw.gameBannerPhoto || raw.image || FALLBACK_IMAGE,
            accent: ACCENT_GRADIENTS[i % ACCENT_GRADIENTS.length],
          };
        });
        setGames(mapped);
      } catch (err: unknown) {
        console.error("Failed to fetch games:", err);
        if (!stale) setError(err instanceof Error ? err.message : "Failed to load games");
      } finally {
        if (!stale) setIsLoading(false);
      }
    }

    fetchGames();
    return () => { stale = true; };
  }, [retryKey]);

  const genres = useMemo(() => {
    const unique = Array.from(new Set(games.map((g) => g.genre))).sort();
    return ["All Games", ...unique];
  }, [games]);

  const filtered = useMemo(
    () => (active === "All Games" ? games : games.filter((g) => g.genre === active)),
    [active, games]
  );

  const stats = useMemo(() => [
    { v: `${games.length}+`, l: "Supported Games", icon: Gamepad2 },
    { v: `${games.reduce((acc, g) => acc + g.playerCount, 0).toLocaleString()}+`, l: "Players Competing", icon: Users },
  ], [games]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 text-purple-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <AlertCircle className="w-12 h-12 text-red-400" />
        <p className="text-gray-300 text-center max-w-md">{error}</p>
        <button
          onClick={() => setRetryKey((k) => k + 1)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <SEO />

      <main className="pt-32 pb-20">
        <div className="max-w-[1480px] mx-auto px-5 sm:px-6 lg:px-10">
          {/* HERO */}
          <div className="relative grid lg:grid-cols-[1fr_1fr] gap-10 items-center mb-12">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 backdrop-blur-sm mb-5"
              >
                <Sparkles className="w-3 h-3 text-purple-300" />
                <span className="text-xs font-bold uppercase tracking-[0.22em] text-purple-200">
                  All Your Favorite Games
                </span>
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-[3.6rem] font-black tracking-tight leading-[1.05] mb-4"
              >
                Compete in the games
                <br />
                <span className="bg-gradient-to-r from-[#a855f7] via-[#c084fc] to-[#7c3aed] bg-clip-text text-transparent">
                  you love
                </span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.25 }}
                className="text-gray-400 text-base max-w-md"
              >
                From FPS to Battle Royale, we support all major esports titles.
              </motion.p>
            </div>

            {/* hero collage */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 }}
              className="relative h-[280px] lg:h-[340px] hidden md:block"
            >
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_70%_at_50%_50%,rgba(168,85,247,0.30),transparent_70%)]" />
              <div className="relative grid grid-cols-3 gap-3 h-full">
                {games.slice(0, 3).map((g, i) => (
                  <motion.div
                    key={g._id}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    style={{ marginTop: i === 1 ? "-20px" : i === 2 ? "20px" : "0" }}
                    className="relative rounded-2xl overflow-hidden ring-1 ring-inset ring-white/10"
                  >
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${getImageUrl(g.image) || FALLBACK_IMAGE})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0414] via-[#0a0414]/40 to-transparent" />
                    <div className="absolute inset-x-0 bottom-2 text-center">
                      <span className="text-[10px] font-black text-white tracking-wider">{g.name}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* STATS BAR */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
            {stats.map((s, i) => (
              <motion.div
                key={s.l}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="relative rounded-2xl bg-white/[0.03] ring-1 ring-inset ring-white/8 p-4 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 ring-1 ring-inset ring-purple-400/40 flex items-center justify-center flex-shrink-0">
                  <s.icon className="w-4 h-4 text-purple-300" />
                </div>
                <div>
                  <div className="text-xl font-black text-white tabular-nums">{s.v}</div>
                  <div className="text-[10.5px] text-gray-400 uppercase tracking-wider">{s.l}</div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* GENRE TABS */}
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-purple-300 mb-1">Browse</p>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">All Games</h2>
            </div>
            <div className="relative inline-flex flex-wrap items-center gap-1 p-1 rounded-2xl bg-white/[0.04] ring-1 ring-inset ring-white/8 backdrop-blur-md max-w-full overflow-x-auto">
              {genres.map((g) => {
                const isActive = active === g;
                return (
                  <button
                    key={g}
                    onClick={() => setActive(g)}
                    className={`relative px-4 py-2 rounded-xl text-[12.5px] font-bold whitespace-nowrap transition-colors ${
                      isActive ? "text-white" : "text-gray-400 hover:text-gray-200"
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="genre-pill"
                        className="absolute inset-0 rounded-xl bg-gradient-to-b from-[#7c3aed] to-[#5b21b6] shadow-lg shadow-purple-900/40 ring-1 ring-inset ring-white/15"
                        transition={{ type: "spring", stiffness: 350, damping: 28 }}
                      />
                    )}
                    <span className="relative">{g}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* GAMES GRID */}
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.35 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
            >
              {filtered.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <Gamepad2 className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No games found in this category</p>
                </div>
              ) : (
                filtered.map((g, i) => (
                  <GameCard key={g._id} game={g} index={i} />
                ))
              )}
            </motion.div>
          </AnimatePresence>

          {/* CTA */}
          <div className="mt-12 flex justify-center">
            <Link
              to="/tournaments"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#a855f7] text-white font-bold text-sm shadow-lg shadow-purple-900/50 hover:shadow-purple-700/70 hover:scale-[1.02] transition-all"
            >
              View All Tournaments <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}

function GameCard({ game, index }: { game: DisplayGame; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
      whileHover={{ y: -6 }}
      className="group relative rounded-3xl overflow-hidden ring-1 ring-inset ring-white/8 hover:ring-purple-400/40 bg-[#0c0618] transition-all"
    >
      {/* image */}
      <div className="relative aspect-[4/5] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center scale-105 group-hover:scale-110 transition-transform duration-[1200ms] ease-out"
          style={{ backgroundImage: `url(${getImageUrl(game.image) || FALLBACK_IMAGE})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0618] via-[#0c0618]/40 to-transparent" />
        <div className={`absolute inset-0 bg-gradient-to-br ${game.accent} mix-blend-screen opacity-50 group-hover:opacity-90 transition-opacity duration-500`} />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

        <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10 backdrop-blur-md ring-1 ring-inset ring-white/15 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <ArrowUpRight className="w-3.5 h-3.5 text-white" />
        </div>

        {/* name overlay */}
        <div className="absolute inset-x-0 bottom-0 p-4">
          <h3 className="text-lg font-black text-white tracking-tight drop-shadow-lg leading-tight">
            {game.name}
          </h3>
        </div>
      </div>

      {/* footer info */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5">
            <Trophy className="w-3 h-3 text-purple-300" />
            <span className="text-white font-black tabular-nums">{game.genre}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-3 h-3 text-purple-300" />
            <span className="text-white font-black tabular-nums">{game.playerCount}</span>
            <span className="text-gray-500">Players</span>
          </div>
        </div>
        <Link
          to={`/tournaments?game=${encodeURIComponent(game.name.toLowerCase())}`}
          className="block w-full text-center rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#a855f7] hover:shadow-purple-700/70 hover:scale-[1.02] text-white text-[12px] font-bold py-2 shadow shadow-purple-900/50 transition-all"
        >
          View Tournaments
        </Link>
      </div>
    </motion.div>
  );
}
