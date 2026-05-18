import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import TiltCard from "./tournament/TiltCard";
// AI-rendered phone illustration sits in /public.
const PHONE_HERO_SRC = "/phone-hero.png";

interface TourCard {
  title: string;
  game: string;
  format: string;
  prize: string;
  joined: string;
  status: "LIVE" | "UPCOMING";
  accent: string;
  /** image to fill the top banner — replace with real game art */
  image?: string;
}

const tournaments: TourCard[] = [
  { title: "Valorant Night Cup", game: "5v5", format: "Single Elimination", prize: "$500 Prize Pool", joined: "32/64 Joined", status: "LIVE", accent: "from-red-500 to-pink-500", image: "" },
  { title: "BGMI Pro Scrims", game: "Squad", format: "Round Robin", prize: "$1,100 Prize Pool", joined: "19/64 Joined", status: "UPCOMING", accent: "from-purple-500 to-blue-500", image: "" },
  { title: "CS2 Weekly Cup", game: "5v5", format: "Single Elimination", prize: "$1,000 Prize Pool", joined: "41/64 Joined", status: "LIVE", accent: "from-amber-500 to-red-500", image: "" },
  { title: "Free Fire Clash", game: "Squad", format: "Single Elimination", prize: "$200 Prize Pool", joined: "19/64 Joined", status: "UPCOMING", accent: "from-emerald-500 to-cyan-500", image: "" },
];

export default function LiveTournaments() {
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

        {/* CARDS + PHONE — two-column layout
             - Left half:  4 tournament cards arranged as a 2×2 SQUARE grid.
             - Right half: phone PNG, large, with its right edge intentionally
                           bleeding off-viewport for a hero-marketing feel.
             - Mobile (<lg): cards stack as a 2×2 above, phone shows below
                             (still partially cut on the right). */}
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
          {/* LEFT — 2×2 SQUARE grid of tournament cards */}
          <div className="relative z-10 grid grid-cols-2 gap-4 lg:gap-5">
            {tournaments.map((t, i) => (
              <motion.div
                key={t.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <TiltCard
                  innerClassName="overflow-hidden border border-white/10 bg-[#100820]/85 backdrop-blur-md hover:border-purple-500/40 transition-colors"
                >
                  {/* image banner placeholder — replace with real game art */}
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
                    <button className="w-full py-2 rounded-lg bg-gradient-to-r from-[#7c3aed] to-[#a855f7] text-white text-xs font-bold hover:scale-[1.02] transition-transform">
                      Join Now
                    </button>
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </div>

          {/* RIGHT — phone PNG. Tall portrait visual, bleeds off the right
              edge of the section. The container itself is `overflow-hidden`
              at the section level so the cut-off feel is consistent. */}
          <div className="relative h-[420px] sm:h-[560px] lg:h-[640px] xl:h-[700px]">
            {/* Soft purple bloom backdrop so the cut-out illustration sits on
                a halo instead of floating against the dark video. */}
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
                // anchor near the top of its column so the trophy + phone
                // sit roughly aligned with the top of the card grid rather
                // than running off the bottom of the section.
                "top-0 -translate-y-[8%] sm:-translate-y-[10%] lg:-translate-y-[12%]",
                // mobile: shift right so a strip cuts off the viewport edge.
                // lg+: bleed further right for the dramatic hero crop.
                // Moved 10% left per user request (reduced negative offsets).
                "right-[-12%] sm:right-[-8%] lg:right-[-2%] xl:right-[2%]",
                // image is sized by HEIGHT (full column height) so the natural
                // ~2:3 aspect of the source PNG is preserved without stretch.
                // Scaled 50% larger per user request.
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
