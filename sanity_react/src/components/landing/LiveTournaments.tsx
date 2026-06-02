import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import TiltCard from "./tournament/TiltCard";
import { tournamentService } from "@/lib/services";
import type { Tournament } from "@/lib/services/tournament.service";
import { getImageUrl } from "@/lib/utils";

const PHONE_HERO_SRC = "/phone-hero.png";

const ACCENT_GRADIENTS = [
  "from-red-500 to-pink-500",
  "from-purple-500 to-blue-500",
  "from-amber-500 to-red-500",
  "from-emerald-500 to-cyan-500",
  "from-fuchsia-500 to-purple-500",
  "from-blue-500 to-indigo-500",
];

interface TourCard {
  id: string;
  title: string;
  game: string;
  format: string;
  prize: string;
  joined: string;
  status: "LIVE" | "UPCOMING";
  accent: string;
  image?: string;
}

function deriveTournamentStatus(tournament: Tournament): "LIVE" | "UPCOMING" {
  const now = new Date();
  const start = tournament.tournamentStartDate ? new Date(tournament.tournamentStartDate) : null;
  const end = tournament.tournamentEndDate ? new Date(tournament.tournamentEndDate) : null;

  if (start && end && now >= start && now <= end) return "LIVE";
  if (start && now < start) return "UPCOMING";
  if (tournament.status === 'ongoing') return "LIVE";
  return "UPCOMING";
}

function mapToCard(t: Tournament, index: number): TourCard {
  const status = deriveTournamentStatus(t);
  const registered = t.registeredNumber || t.teamsRegistered?.length || t.currentPlayers || 0;
  const max = t.maxTeams || t.maxPlayers || 64;

  return {
    id: t._id,
    title: t.tournamentName || t.title || "Tournament",
    game: t.gameType || "Team",
    format: t.tournamentFormat || "Single Elimination",
    prize: t.prizeConfig?.length
      ? `$${t.prizeConfig.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0)} Prize Pool`
      : t.prizePool
        ? `$${t.prizePool.toLocaleString()} Prize Pool`
        : "Prize TBD",
    joined: `${registered}/${max} Joined`,
    status,
    accent: ACCENT_GRADIENTS[index % ACCENT_GRADIENTS.length],
    image: getImageUrl(t.tournamentBanner || t.gameBannerPhoto || "") || "",
  };
}

export default function LiveTournaments() {
  const navigate = useNavigate();
  const [cards, setCards] = useState<TourCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let stale = false;

    async function fetchTournaments() {
      try {
        setIsLoading(true);
        const response = await tournamentService.getAll({ limit: 4 });
        if (stale) return;
        const data = response.data || [];
        setCards(data.slice(0, 4).map(mapToCard));
      } catch (err) {
        console.error("Failed to fetch tournaments for landing:", err);
        if (!stale) setCards([]);
      } finally {
        if (!stale) setIsLoading(false);
      }
    }

    fetchTournaments();
    return () => { stale = true; };
  }, []);

  return (
    <section className="relative py-20 overflow-hidden">
      <div className="max-w-[1480px] mx-auto px-5 sm:px-6 lg:px-10">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-purple-300 mb-2">
              Live & Upcoming Tournaments
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Jump into the action</h2>
          </div>
          <Link to="/tournaments" className="text-sm text-purple-300 hover:text-white inline-flex items-center gap-1">
            View All Tournaments <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
          {/* LEFT — 2×2 SQUARE grid of tournament cards */}
          <div className="relative z-10 grid grid-cols-2 gap-4 lg:gap-5">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-white/10 bg-[#100820]/85 h-[260px] animate-pulse"
                />
              ))
            ) : cards.length === 0 ? (
              <div className="col-span-2 text-center py-12">
                <p className="text-gray-400">No tournaments available yet</p>
                <Link to="/tournaments" className="text-purple-300 hover:text-white text-sm mt-2 inline-block">
                  Browse all tournaments
                </Link>
              </div>
            ) : (
              cards.map((t, i) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                >
                  <TiltCard
                    innerClassName="overflow-hidden border border-white/10 bg-[#100820]/85 backdrop-blur-md hover:border-purple-500/40 transition-colors"
                  >
                    <div className={`relative h-32 bg-gradient-to-br ${t.accent} overflow-hidden`}>
                      {t.image ? (
                        <img src={t.image} alt={t.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.6)_100%)]" />
                      )}
                      <span
                        className={`absolute top-3 left-3 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${
                          t.status === "LIVE" ? "bg-red-500 text-white" : "bg-purple-500 text-white"
                        }`}
                      >
                        {t.status === "LIVE" && <span className="inline-block w-1.5 h-1.5 rounded-full bg-white mr-1 animate-pulse" />}
                        {t.status}
                      </span>
                    </div>

                    <div className="p-4">
                      <h3 className="text-base font-bold text-white mb-1.5 line-clamp-1">{t.title}</h3>
                      <p className="text-[11px] text-gray-500 mb-3">
                        {t.game} · {t.format}
                      </p>
                      <p className="text-sm font-semibold text-purple-300 mb-1">{t.prize}</p>
                      <p className="text-[11px] text-gray-500 mb-4">{t.joined}</p>
                      <button
                        onClick={() => navigate(`/tournaments/${t.id}`)}
                        className="w-full py-2 rounded-lg bg-gradient-to-r from-[#7c3aed] to-[#a855f7] text-white text-xs font-bold hover:scale-[1.02] transition-transform"
                      >
                        View Details
                      </button>
                    </div>
                  </TiltCard>
                </motion.div>
              ))
            )}
          </div>

          {/* RIGHT — phone PNG */}
          <div className="relative h-[420px] sm:h-[560px] lg:h-[640px] xl:h-[700px]">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_70%_at_50%_50%,rgba(124,58,237,0.34),transparent_70%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_45%_50%_at_55%_50%,rgba(168,85,247,0.22),transparent_75%)]" />
            </div>

            <motion.img
              src={PHONE_HERO_SRC}
              alt="Toornify mobile app"
              draggable={false}
              initial={{ opacity: 0, scale: 0.94, x: 24 }}
              whileInView={{ opacity: 1, scale: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className={[
                "pointer-events-none select-none absolute z-10",
                "top-0 -translate-y-[8%] sm:-translate-y-[10%] lg:-translate-y-[12%]",
                "right-[-12%] sm:right-[-8%] lg:right-[-2%] xl:right-[2%]",
                "h-full w-auto max-w-none object-contain scale-150",
                "drop-shadow-[0_30px_80px_rgba(124,58,237,0.55)]",
              ].join(" ")}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
