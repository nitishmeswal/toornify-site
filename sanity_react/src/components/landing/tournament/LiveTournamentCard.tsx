import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import { useRef, useState, type MouseEvent } from "react";
import { Link } from "react-router-dom";
import { LayoutGrid, Clock, ExternalLink, Play, Flame, Trophy } from "lucide-react";

/* ============================================================================
 *  TYPES + DATA
 * ========================================================================= */
interface Player {
  name: string;
  role: string;
  gradient: string;
}
interface Team {
  key: string;
  name: string;
  short: string;
  score: number;
  winner: boolean;
  gradient: string;
  region: string;
  winRate: number;
  rank: number;
  players: Player[];
}

const TEAMS: Record<string, Team> = {
  alpha: {
    key: "alpha",
    name: "Team Alpha",
    short: "TA",
    score: 2,
    winner: true,
    gradient: "from-purple-400 to-fuchsia-500",
    region: "NA East",
    winRate: 78,
    rank: 1,
    players: [
      { name: "Phantom", role: "IGL",     gradient: "from-purple-500 to-pink-500" },
      { name: "Viper",   role: "Entry",   gradient: "from-fuchsia-500 to-rose-500" },
      { name: "Echo",    role: "Support", gradient: "from-violet-500 to-purple-600" },
      { name: "Frost",   role: "AWP",     gradient: "from-indigo-500 to-blue-500" },
    ],
  },
  omega: {
    key: "omega", name: "Team Omega", short: "TO", score: 1, winner: false,
    gradient: "from-slate-400 to-slate-600", region: "EU West", winRate: 64, rank: 8,
    players: [
      { name: "Orion",  role: "IGL",     gradient: "from-slate-400 to-zinc-600" },
      { name: "Storm",  role: "Entry",   gradient: "from-gray-400 to-slate-600" },
      { name: "Raven",  role: "Support", gradient: "from-zinc-400 to-gray-600" },
      { name: "Blaze",  role: "AWP",     gradient: "from-stone-400 to-slate-600" },
    ],
  },
  zeta: {
    key: "zeta", name: "Team Zeta", short: "TZ", score: 2, winner: true,
    gradient: "from-rose-400 to-red-500", region: "APAC", winRate: 81, rank: 2,
    players: [
      { name: "Kira",   role: "IGL",     gradient: "from-rose-500 to-red-500" },
      { name: "Reaper", role: "Entry",   gradient: "from-red-500 to-orange-500" },
      { name: "Nyx",    role: "Support", gradient: "from-pink-500 to-rose-500" },
      { name: "Onyx",   role: "AWP",     gradient: "from-rose-600 to-red-700" },
    ],
  },
  delta: {
    key: "delta", name: "Team Delta", short: "TD", score: 0, winner: false,
    gradient: "from-cyan-400 to-blue-500", region: "SA", winRate: 52, rank: 14,
    players: [
      { name: "Wave",  role: "IGL",     gradient: "from-cyan-500 to-blue-500" },
      { name: "Tide",  role: "Entry",   gradient: "from-sky-500 to-cyan-500" },
      { name: "Surge", role: "Support", gradient: "from-blue-500 to-indigo-500" },
      { name: "Reef",  role: "AWP",     gradient: "from-teal-500 to-cyan-600" },
    ],
  },
  nova: {
    key: "nova", name: "Team Nova", short: "TN", score: 2, winner: true,
    gradient: "from-amber-400 to-orange-500", region: "NA West", winRate: 74, rank: 4,
    players: [
      { name: "Solar", role: "IGL",     gradient: "from-amber-400 to-orange-500" },
      { name: "Flare", role: "Entry",   gradient: "from-orange-500 to-red-500" },
      { name: "Ember", role: "Support", gradient: "from-yellow-500 to-amber-500" },
      { name: "Dusk",  role: "AWP",     gradient: "from-orange-400 to-rose-500" },
    ],
  },
  onyx: {
    key: "onyx", name: "Team Onyx", short: "TX", score: 1, winner: false,
    gradient: "from-zinc-400 to-zinc-600", region: "EU East", winRate: 58, rank: 11,
    players: [
      { name: "Shade", role: "IGL",     gradient: "from-zinc-500 to-stone-600" },
      { name: "Coal",  role: "Entry",   gradient: "from-neutral-500 to-zinc-700" },
      { name: "Dust",  role: "Support", gradient: "from-stone-500 to-neutral-600" },
      { name: "Flint", role: "AWP",     gradient: "from-gray-500 to-zinc-700" },
    ],
  },
  lynx: {
    key: "lynx", name: "Team Lynx", short: "TL", score: 0, winner: false,
    gradient: "from-emerald-400 to-teal-500", region: "OCE", winRate: 49, rank: 18,
    players: [
      { name: "Ivy",   role: "IGL",     gradient: "from-emerald-500 to-teal-500" },
      { name: "Fern",  role: "Entry",   gradient: "from-green-500 to-emerald-500" },
      { name: "Moss",  role: "Support", gradient: "from-teal-500 to-cyan-600" },
      { name: "Birch", role: "AWP",     gradient: "from-lime-500 to-emerald-500" },
    ],
  },
  vex: {
    key: "vex", name: "Team Vex", short: "TV", score: 2, winner: true,
    gradient: "from-pink-400 to-rose-500", region: "ME", winRate: 71, rank: 6,
    players: [
      { name: "Hex",   role: "IGL",     gradient: "from-pink-500 to-fuchsia-500" },
      { name: "Pulse", role: "Entry",   gradient: "from-rose-500 to-pink-500" },
      { name: "Riot",  role: "Support", gradient: "from-fuchsia-500 to-purple-500" },
      { name: "Cipher",role: "AWP",     gradient: "from-pink-600 to-rose-600" },
    ],
  },
};

const QUARTER_PAIRS: [string, string][] = [
  ["alpha", "omega"],
  ["zeta", "delta"],
  ["nova", "onyx"],
  ["lynx", "vex"],
];

/* ============================================================================
 *  ROOT — LIVE TOURNAMENT CARD
 *  - 3D mouse tilt with weighted spring
 *  - Mouse-tracked obsidian-purple illumination
 *  - Apple liquid glass
 * ========================================================================= */
export default function LiveTournamentCard() {
  const cardRef = useRef<HTMLDivElement | null>(null);

  // weighted 3D tilt
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  // More expressive tilt — wider angular range, snappier spring so the
  // card visibly leans into the cursor on the slightest hover.
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [14, -14]), {
    stiffness: 180,
    damping: 18,
    mass: 0.7,
  });
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-14, 14]), {
    stiffness: 180,
    damping: 18,
    mass: 0.7,
  });

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    mx.set(px - 0.5);
    my.set(py - 0.5);
    el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    el.style.setProperty("--my", `${e.clientY - rect.top}px`);
  }
  function handleMouseLeave() {
    mx.set(0);
    my.set(0);
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 60, y: 20 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.9, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
      style={{ perspective: 1500 }}
      // Responsive wrapper:
      //  - mobile: relative, full-width inside the hero column
      //  - md+:    absolute pinned to the right rail at fixed wide width
      className="relative w-full md:absolute md:right-0 md:top-2 md:w-[820px] xl:w-[880px]"
    >
      {/* outer glow halo
          mobile: tight -inset-2 so it cannot push the page wider than the
                  viewport (was -inset-10 which caused horizontal overflow).
          md+:    full -inset-10 bloom around the desktop bracket card. */}
      <div className="absolute -inset-2 md:-inset-10 bg-gradient-to-br from-purple-600/40 via-fuchsia-500/25 to-blue-600/25 blur-[40px] md:blur-[70px] rounded-[44px] pointer-events-none" />

      {/* MOBILE-ONLY compact unique variant. Hidden md+. */}
      <div className="md:hidden">
        <LiveTournamentMobile />
      </div>

      {/* DESKTOP / TABLET tilted bracket card. Hidden on mobile. */}
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
          ["--mx" as any]: "50%",
          ["--my" as any]: "50%",
        }}
        className="group relative rounded-[28px] hidden md:block"
      >
        {/* CLIPPED GLASS LAYER (does not clip popups) */}
        <div className="absolute inset-0 rounded-[28px] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.06] via-white/[0.02] to-white/[0.04]" />
          <div className="absolute inset-0 backdrop-blur-xl backdrop-saturate-125" />
          <div className="absolute inset-0 bg-[#0d0620]/92" />
          {/* mouse-tracked obsidian-purple illumination */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none mix-blend-screen"
            style={{
              background:
                "radial-gradient(520px circle at var(--mx) var(--my), rgba(168,85,247,0.35), rgba(124,58,237,0.14) 35%, transparent 65%)",
            }}
          />
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{
              background:
                "radial-gradient(220px circle at var(--mx) var(--my), rgba(255,255,255,0.07), transparent 70%)",
            }}
          />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
          <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -left-24 w-80 h-80 rounded-full bg-blue-500/15 blur-3xl pointer-events-none" />
        </div>
        {/* etched ring (sits above clipper) */}
        <div className="absolute inset-0 rounded-[28px] ring-1 ring-inset ring-white/10 pointer-events-none" />

        {/* CONTENT */}
        <div className="relative p-7 lg:p-8" style={{ transform: "translateZ(40px)" }}>
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="relative flex w-2.5 h-2.5">
                <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75" />
                <span className="relative rounded-full w-2.5 h-2.5 bg-red-500" />
              </span>
              <span className="text-xs font-bold uppercase tracking-[0.22em] text-red-400">
                Live Tournament
              </span>
            </div>
            <span className="text-xs text-gray-400 font-medium">Quarter Finals</span>
          </div>

          {/* BRACKET
              NOTE: We intentionally DO NOT set transformStyle: "preserve-3d" on the bracket
              wrapper or its descendants along the popup-ancestor chain. preserve-3d creates a
              new 3D rendering context that traps z-index. The bracket gets a plain flat
              stacking context with isolation:isolate so popups can use high z within it. */}
          <div className="relative" style={{ zIndex: 50, isolation: "isolate" }}>
            <Bracket3Stage />
          </div>

          {/* Live match strip */}
          <div className="relative mt-6 rounded-2xl overflow-hidden" style={{ zIndex: 1 }}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent backdrop-blur-xl" />
            <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-2xl" />
            <div className="relative flex items-center justify-between p-4">
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-1 font-semibold">
                  Live Match
                </div>
                <div className="text-sm font-bold text-white">
                  Team Alpha
                  <span className="mx-2 text-[10px] tracking-widest text-gray-500">VS</span>
                  Team Zeta
                </div>
              </div>
              <Link
                to="/tournaments/live"
                className="relative px-4 py-2 rounded-xl bg-gradient-to-b from-[#9d4dff] to-[#6d28d9] text-white text-xs font-bold shadow-lg shadow-purple-900/60 hover:scale-105 transition-transform overflow-hidden"
              >
                <span className="absolute inset-x-0 top-0 h-px bg-white/50" />
                Watch Live
              </Link>
            </div>
          </div>

          {/* Footer stats */}
          <div className="mt-5 flex items-center gap-5 text-[11px] text-gray-300">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.9)]" />
              Live Updates
            </span>
            <span className="flex items-center gap-1.5">
              <LayoutGrid className="w-3 h-3 text-purple-300" />
              32 Teams
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-purple-300" />
              64 Matches Live
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ============================================================================
 *  3-STAGE BRACKET
 *  KEY FIX: each grid column gets its own `position:relative` + isolation so we
 *  can layer popups predictably without preserve-3d trapping them.
 * ========================================================================= */
function Bracket3Stage() {
  return (
    // No `isolation: isolate` on columns — that traps popups in their column.
    // Plain stacking context at the grid level lets popups win with high z.
    <div className="relative grid grid-cols-[1.2fr_56px_1fr_56px_1fr] gap-0 items-stretch">
      {/* QUARTERS column */}
      <div className="relative space-y-2">
        {QUARTER_PAIRS.map(([a, b]) => (
          <MatchGroup key={a + b} teamA={TEAMS[a]} teamB={TEAMS[b]} />
        ))}
      </div>

      {/* connector quarters → semis (neon) — sits behind everything */}
      <div className="relative" style={{ zIndex: 0 }}>
        <NeonConnector
          viewBox="0 0 56 360"
          paths={[
            "M-2 38 H28 V112",
            "M-2 130 H28 V112",
            "M28 112 H58",
            "M-2 230 H28 V304",
            "M-2 322 H28 V304",
            "M28 304 H58",
          ]}
        />
      </div>

      {/* SEMIS column */}
      <div className="relative grid grid-rows-2 gap-2">
        <div className="flex items-center">
          <SemiCard
            id="semi-top"
            teamA={TEAMS.alpha}
            teamB={TEAMS.zeta}
            score="2 — 1"
          />
        </div>
        <div className="flex items-center">
          <SemiCard
            id="semi-bot"
            teamA={TEAMS.nova}
            teamB={TEAMS.vex}
            score="2 — 0"
          />
        </div>
      </div>

      {/* connector semis → final (fire) — sits behind everything */}
      <div className="relative" style={{ zIndex: 0 }}>
        <FireConnector />
      </div>

      {/* FINAL column */}
      <div className="relative flex items-center">
        <FinalCard teamA={TEAMS.alpha} teamB={TEAMS.zeta} />
      </div>
    </div>
  );
}

/* ============================================================================
 *  MATCH GROUP (quarter — two team rows)
 * ========================================================================= */
function MatchGroup({ teamA, teamB }: { teamA: Team; teamB: Team }) {
  // hover lifts the whole match-group above its siblings inside the column
  const [hover, setHover] = useState(false);
  return (
    <div
      className="relative rounded-xl"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ zIndex: hover ? 100 : 1 }}
    >
      <div className="absolute inset-0 rounded-xl bg-[#1a0f2e]" />
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/[0.05] to-transparent" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent rounded-xl" />
      <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/15 pointer-events-none" />
      <div className="relative divide-y divide-white/5">
        <TeamRow team={teamA} />
        <TeamRow team={teamB} />
      </div>
    </div>
  );
}

function TeamRow({ team }: { team: Team }) {
  const [hover, setHover] = useState(false);

  return (
    <motion.div
      onHoverStart={() => setHover(true)}
      onHoverEnd={() => setHover(false)}
      animate={
        hover
          ? {
              scale: 1.08,
              y: -2,
              boxShadow:
                "0 14px 30px -10px rgba(168,85,247,0.55), 0 0 0 1px rgba(168,85,247,0.55) inset",
              backgroundColor: "#241338",
            }
          : {
              scale: 1,
              y: 0,
              boxShadow: "0 0 0 0 rgba(0,0,0,0)",
              backgroundColor: "rgba(0,0,0,0)",
            }
      }
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
      className="relative flex items-center justify-between px-3 py-2.5 cursor-pointer rounded-lg"
      style={{
        transformOrigin: "center",
        zIndex: hover ? 200 : 1,
      }}
    >
      <div className="relative flex items-center gap-2.5 z-10">
        <div
          className={`w-7 h-7 rounded-full bg-gradient-to-br ${team.gradient} flex items-center justify-center shadow-inner ring-1 ring-white/15`}
        >
          <span className="text-[9px] font-black text-white drop-shadow">{team.short}</span>
        </div>
        <span className="text-[12.5px] font-bold text-white tracking-tight">{team.name}</span>
      </div>
      <span
        className={`relative z-10 text-sm font-extrabold tabular-nums ${
          team.winner ? "text-white" : "text-gray-500"
        }`}
      >
        {team.score}
      </span>

      {/* TEAM POPUP */}
      <AnimatePresence>{hover && <TeamDetailPopup team={team} />}</AnimatePresence>
    </motion.div>
  );
}

/* ============================================================================
 *  TEAM DETAIL POPUP — appears on TeamRow hover
 *  No translateZ on this popup (we removed preserve-3d ancestors), so plain
 *  z-index works reliably.
 * ========================================================================= */
function TeamDetailPopup({ team }: { team: Team }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -16, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -10, scale: 0.96 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="absolute left-full top-0 ml-3 w-[260px] pointer-events-auto"
      style={{ zIndex: 9999 }}
    >
      {/* halo */}
      <div className={`absolute -inset-3 bg-gradient-to-br ${team.gradient} opacity-30 blur-2xl rounded-3xl pointer-events-none`} />
      <div className="relative rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-[#0c0618]" />
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent" />
        <div className="absolute inset-0 ring-1 ring-inset ring-white/15 rounded-2xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

        <div className="relative p-4">
          {/* header */}
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${team.gradient} flex items-center justify-center ring-1 ring-white/20 shadow-lg`}>
              <span className="text-sm font-black text-white">{team.short}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-white truncate">{team.name}</div>
              <div className="text-[10px] text-gray-400 flex items-center gap-1.5">
                <span>{team.region}</span>
                <span className="text-gray-600">•</span>
                <span className="text-purple-300 font-semibold">Rank #{team.rank}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[9px] text-gray-500 uppercase tracking-wider">Win</div>
              <div className="text-sm font-black text-emerald-400">{team.winRate}%</div>
            </div>
          </div>

          <div className="my-3 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          <div className="text-[9px] uppercase tracking-[0.2em] text-gray-500 font-bold mb-2">Roster</div>
          <div className="grid grid-cols-2 gap-1.5">
            {team.players.map((p) => (
              <div
                key={p.name}
                className="flex items-center gap-2 rounded-lg p-1.5 bg-white/[0.03] ring-1 ring-inset ring-white/5"
              >
                <div className={`w-7 h-7 rounded-md bg-gradient-to-br ${p.gradient} flex items-center justify-center ring-1 ring-white/10`}>
                  <span className="text-[9px] font-black text-white">{p.name[0]}</span>
                </div>
                <div className="min-w-0">
                  <div className="text-[10.5px] font-bold text-white truncate leading-tight">{p.name}</div>
                  <div className="text-[8.5px] text-purple-300 leading-tight">{p.role}</div>
                </div>
              </div>
            ))}
          </div>

          <Link
            to={`/teams/${team.key}/live`}
            className="mt-3 flex items-center justify-center gap-1.5 w-full px-3 py-2 rounded-lg bg-gradient-to-r from-[#9d4dff] to-[#6d28d9] text-white text-[11px] font-bold shadow-md shadow-purple-900/50 hover:shadow-purple-700/70 transition-all"
          >
            <Play className="w-3 h-3 fill-white" />
            View Live
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

/* ============================================================================
 *  SEMI CARD
 * ========================================================================= */
function SemiCard({
  id,
  teamA,
  teamB,
  score,
}: {
  id: string;
  teamA: Team;
  teamB: Team;
  score: string;
}) {
  const [hover, setHover] = useState(false);

  return (
    <motion.div
      onHoverStart={() => setHover(true)}
      onHoverEnd={() => setHover(false)}
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
      className="relative rounded-xl w-full cursor-pointer"
      style={{ zIndex: hover ? 300 : 1 }}
    >
      <div className="absolute inset-0 rounded-xl overflow-hidden">
        <div className="absolute inset-0 bg-[#1a0f2e]" />
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent" />
      </div>
      <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-purple-400/30 pointer-events-none" />
      {hover && (
        <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-purple-400/60 pointer-events-none shadow-[0_0_20px_rgba(168,85,247,0.4)]" />
      )}

      <div className="relative px-3 py-3 space-y-1.5 text-center">
        <div className="text-[11px] font-bold text-white">{teamA.name}</div>
        <div className="text-[8px] tracking-[0.25em] text-purple-300/60 font-bold">VS</div>
        <div className="text-[11px] font-bold text-white">{teamB.name}</div>
      </div>

      <AnimatePresence>
        {hover && <MatchVsPopup id={id} teamA={teamA} teamB={teamB} score={score} variant="semi" />}
      </AnimatePresence>
    </motion.div>
  );
}

/* ============================================================================
 *  FINAL CARD
 *  KEY FIX: the final card now has a tiny visual "tail" extending leftward so
 *  the fire connector visibly merges into it. The card itself also has a
 *  negative-margin overlap zone where the fire connector punches through.
 * ========================================================================= */
function FinalCard({ teamA, teamB }: { teamA: Team; teamB: Team }) {
  const [hover, setHover] = useState(false);

  return (
    <motion.div
      onHoverStart={() => setHover(true)}
      onHoverEnd={() => setHover(false)}
      whileHover={{ scale: 1.06 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="relative rounded-xl w-full cursor-pointer"
      style={{ zIndex: hover ? 400 : 2 }}
    >
      {/* Incoming fire tail — a short outward extension that merges with the
          connector so the line visibly TOUCHES the final card */}
      <div
        className="absolute right-full top-1/2 -translate-y-1/2 w-6 h-[3px] pointer-events-none"
        style={{
          background:
            "linear-gradient(to right, rgba(251,191,36,0) 0%, rgba(251,146,60,0.9) 40%, rgba(220,38,38,1) 100%)",
          filter: "blur(0.4px) drop-shadow(0 0 6px rgba(251,146,60,0.9))",
          animation: "fireFlicker 1.6s ease-in-out infinite",
        }}
      />
      {/* hot landing glow where the line meets the card edge */}
      <div
        className="absolute -left-1 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(254,243,199,0.95) 0%, rgba(251,146,60,0.7) 40%, rgba(220,38,38,0) 70%)",
          filter: "blur(0.5px)",
          animation: "fireFlicker 1.6s ease-in-out infinite",
        }}
      />

      {/* fire glow halo */}
      <div className="absolute -inset-4 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-t from-orange-500/50 via-red-500/30 to-yellow-400/20 blur-2xl rounded-2xl animate-fire-flicker-slow" />
        <div className="absolute inset-0 bg-gradient-to-t from-red-600/40 via-orange-500/20 to-transparent blur-3xl rounded-2xl animate-fire-flicker" />
      </div>

      <div className="relative rounded-xl overflow-hidden">
        <div className="absolute inset-0 bg-[#231231]" />
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 via-red-500/15 to-purple-700/30" />
        <div className="absolute inset-0 ring-1 ring-inset ring-orange-400/40 rounded-xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-300/80 to-transparent" />

        <FireEmbers />

        <div className="relative px-3 py-4 space-y-2 text-center">
          <div className="flex items-center justify-center gap-1">
            <Flame className="w-3 h-3 text-orange-400" />
            <span className="text-[9px] tracking-[0.3em] text-orange-300 font-black uppercase">Final</span>
            <Flame className="w-3 h-3 text-orange-400" />
          </div>
          <div className="text-xs font-black text-white">{teamA.name}</div>
          <div className="text-[8px] tracking-[0.2em] text-orange-300/70 font-bold">VS</div>
          <div className="text-xs font-black text-white">{teamB.name}</div>
          <div className="pt-1">
            <Trophy className="w-4 h-4 text-yellow-400 mx-auto drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]" />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {hover && <MatchVsPopup id="final" teamA={teamA} teamB={teamB} score="LIVE" variant="final" />}
      </AnimatePresence>
    </motion.div>
  );
}

/* ============================================================================
 *  MATCH VS POPUP
 * ========================================================================= */
function MatchVsPopup({
  id,
  teamA,
  teamB,
  score,
  variant,
}: {
  id: string;
  teamA: Team;
  teamB: Team;
  score: string;
  variant: "semi" | "final";
}) {
  const isFinal = variant === "final";
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.96 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className={`absolute ${
        isFinal
          ? "right-full bottom-0 mr-4"
          : "left-full top-1/2 ml-4"
      } w-[320px] pointer-events-auto`}
      style={{
        transform: isFinal ? undefined : "translateY(-50%)",
        zIndex: 9999,
      }}
      key={id}
    >
      <div
        className={`absolute -inset-3 blur-2xl rounded-3xl pointer-events-none ${
          isFinal
            ? "bg-gradient-to-br from-orange-500/40 via-red-500/30 to-yellow-400/20"
            : "bg-gradient-to-br from-purple-500/35 via-fuchsia-500/25 to-blue-500/20"
        }`}
      />
      <div className="relative rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-[#0a0414]" />
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent" />
        <div
          className={`absolute inset-0 ring-1 ring-inset rounded-2xl ${
            isFinal ? "ring-orange-400/30" : "ring-white/15"
          }`}
        />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

        <MatchPreview teamA={teamA} teamB={teamB} variant={variant} />

        <div className="relative p-3.5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <span className="relative flex w-1.5 h-1.5">
                <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75" />
                <span className="relative w-1.5 h-1.5 rounded-full bg-red-500" />
              </span>
              <span className="text-[9px] uppercase tracking-[0.22em] font-black text-red-400">
                {isFinal ? "Grand Final" : "Semi Final"}
              </span>
            </div>
            <span className="text-[10px] font-bold text-white tabular-nums">{score}</span>
          </div>

          <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center">
            <TeamFace team={teamA} side="left" />
            <div className={`text-[10px] font-black tracking-[0.3em] ${isFinal ? "text-orange-300" : "text-purple-300"}`}>VS</div>
            <TeamFace team={teamB} side="right" />
          </div>

          <Link
            to={`/tournaments/${id}/live`}
            className={`mt-3 flex items-center justify-center gap-1.5 w-full px-3 py-2 rounded-lg text-white text-[11px] font-bold shadow-md transition-all ${
              isFinal
                ? "bg-gradient-to-r from-orange-500 to-red-500 shadow-orange-900/50 hover:shadow-orange-700/70"
                : "bg-gradient-to-r from-[#9d4dff] to-[#6d28d9] shadow-purple-900/50 hover:shadow-purple-700/70"
            }`}
          >
            <Play className="w-3 h-3 fill-white" />
            View Live
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

function TeamFace({ team, side }: { team: Team; side: "left" | "right" }) {
  return (
    <div className={`flex flex-col items-center ${side === "right" ? "" : ""}`}>
      <div className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${team.gradient} flex items-center justify-center ring-2 ring-white/15 shadow-lg`}>
        <span className="text-sm font-black text-white drop-shadow">{team.short}</span>
        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-md bg-[#0a0414] ring-1 ring-white/10 flex items-center justify-center">
          <span className="text-[8px] font-black text-purple-300">#{team.rank}</span>
        </div>
      </div>
      <div className="text-[10.5px] font-bold text-white mt-1.5 text-center leading-tight">
        {team.name}
      </div>
      <div className="text-[8.5px] text-gray-400">{team.region}</div>
    </div>
  );
}

/* ============================================================================
 *  MATCH PREVIEW — looping "video" preview
 * ========================================================================= */
function MatchPreview({
  teamA,
  teamB,
  variant,
}: {
  teamA: Team;
  teamB: Team;
  variant: "semi" | "final";
}) {
  const isFinal = variant === "final";
  return (
    <div className="relative h-[120px] overflow-hidden">
      <div
        className={`absolute inset-0 ${
          isFinal
            ? "bg-[conic-gradient(from_0deg_at_50%_50%,rgba(251,146,60,0.5),rgba(239,68,68,0.5),rgba(250,204,21,0.4),rgba(251,146,60,0.5))]"
            : "bg-[conic-gradient(from_0deg_at_50%_50%,rgba(168,85,247,0.5),rgba(236,72,153,0.4),rgba(59,130,246,0.4),rgba(168,85,247,0.5))]"
        } animate-spin-slow`}
      />
      <div className="absolute inset-0 backdrop-blur-2xl" />
      <div className="absolute inset-0 bg-black/40" />

      <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(255,255,255,0.03)_50%)] bg-[length:100%_3px]" />
      <div className="absolute inset-0 animate-scan-line opacity-40 pointer-events-none" />

      <div className="absolute inset-0 flex items-center justify-between px-6">
        <motion.div
          animate={{ x: [0, 4, 0], y: [0, -2, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${teamA.gradient} flex items-center justify-center ring-2 ring-white/30 shadow-2xl`}
        >
          <span className="text-base font-black text-white drop-shadow">{teamA.short}</span>
        </motion.div>

        <motion.div
          animate={{ scale: [1, 1.15, 1], rotate: [0, 4, -4, 0] }}
          transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
          className={`text-2xl font-black tracking-tight ${
            isFinal ? "text-orange-300" : "text-white"
          } drop-shadow-[0_0_12px_rgba(168,85,247,0.8)]`}
        >
          VS
        </motion.div>

        <motion.div
          animate={{ x: [0, -4, 0], y: [0, 2, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", delay: 0.4 }}
          className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${teamB.gradient} flex items-center justify-center ring-2 ring-white/30 shadow-2xl`}
        >
          <span className="text-base font-black text-white drop-shadow">{teamB.short}</span>
        </motion.div>
      </div>

      <div className="absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-500/90 backdrop-blur ring-1 ring-white/20">
        <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
        <span className="text-[8px] font-black text-white tracking-widest uppercase">Live</span>
      </div>

      <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur ring-1 ring-white/10">
        <span className="text-[8px] font-mono font-bold text-white/90">
          {isFinal ? "GRAND FINAL • LIVE" : "SEMI • LIVE"}
        </span>
      </div>

      {isFinal && (
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-orange-500/40 via-red-500/20 to-transparent animate-fire-flicker pointer-events-none" />
      )}
    </div>
  );
}

/* ============================================================================
 *  NEON CONNECTOR — quarters → semis
 * ========================================================================= */
function NeonConnector({ viewBox, paths }: { viewBox: string; paths: string[] }) {
  const id = `nc-${paths.length}`;
  return (
    <svg viewBox={viewBox} preserveAspectRatio="none" className="h-full w-full overflow-visible">
      <defs>
        <filter id={id} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#d8b4fe" />
        </linearGradient>
      </defs>
      {paths.map((d, i) => (
        <path key={`b${i}`} d={d} fill="none" stroke="#a855f7" strokeOpacity="0.25" strokeWidth="1.2" />
      ))}
      {paths.map((d, i) => (
        <path key={`g${i}`} d={d} fill="none" stroke={`url(#${id}-g)`} strokeWidth="1.4" filter={`url(#${id})`} />
      ))}
      {paths.map((d, i) => (
        <path
          key={`t${i}`}
          d={d}
          fill="none"
          stroke="#f0abfc"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="14 120"
          filter={`url(#${id})`}
          style={{ animation: `bracketTrail 3s linear infinite`, animationDelay: `${i * 0.25}s` }}
        />
      ))}
    </svg>
  );
}

/* ============================================================================
 *  FIRE CONNECTOR — semis → final
 *  FIX: viewBox widened on the right side so paths extend INTO the final card.
 *  We use overflow-visible AND a negative right margin so the SVG visually
 *  overlaps the final card column. The paths now terminate well inside the
 *  final card's bounds, and the FinalCard renders an incoming "fire tail"
 *  that overlaps the connector — together they form a continuous line.
 * ========================================================================= */
function FireConnector() {
  // viewBox is 80 wide (column is 56px) — paths can now reach x=78 which,
  // combined with overflow-visible, extends visibly past the column into the
  // final card.
  const paths = ["M-2 90 H28 V180", "M-2 270 H28 V180", "M28 180 H78"];
  return (
    <svg
      viewBox="0 0 80 360"
      preserveAspectRatio="none"
      className="h-full w-full overflow-visible"
      // negative right margin lets the SVG visually bleed into the next column
      style={{ marginRight: -16 }}
    >
      <defs>
        <filter id="fire-blur" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="3.2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="fire-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="40%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#dc2626" />
        </linearGradient>
        <linearGradient id="fire-trail" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#fb923c" />
          <stop offset="100%" stopColor="#ef4444" />
        </linearGradient>
      </defs>

      {/* outer wide hot glow */}
      {paths.map((d, i) => (
        <path
          key={`o${i}`}
          d={d}
          fill="none"
          stroke="url(#fire-grad)"
          strokeWidth="6"
          strokeLinecap="round"
          opacity="0.35"
          filter="url(#fire-blur)"
          style={{ animation: "fireFlicker 1.6s ease-in-out infinite", animationDelay: `${i * 0.15}s` }}
        />
      ))}

      {/* bright core */}
      {paths.map((d, i) => (
        <path
          key={`c${i}`}
          d={d}
          fill="none"
          stroke="url(#fire-grad)"
          strokeWidth="2.2"
          strokeLinecap="round"
          filter="url(#fire-blur)"
        />
      ))}

      {/* steady inner highlight */}
      {paths.map((d, i) => (
        <path
          key={`h${i}`}
          d={d}
          fill="none"
          stroke="#fef3c7"
          strokeWidth="0.9"
          strokeLinecap="round"
          opacity="0.85"
          filter="url(#fire-blur)"
        />
      ))}

      {/* bright impact flare where the line enters the final card */}
      <circle
        cx={78}
        cy={180}
        r={4}
        fill="#fef3c7"
        filter="url(#fire-blur)"
        opacity="0.9"
        style={{ animation: "fireFlicker 1.6s ease-in-out infinite" }}
      />
      <circle
        cx={78}
        cy={180}
        r={2}
        fill="#ffffff"
        opacity="0.95"
      />

      {/* rising embers near the merge point */}
      {[...Array(8)].map((_, i) => (
        <circle
          key={`e${i}`}
          cx={56 + (i % 3) * 6}
          cy={180}
          r={1.2 + (i % 3) * 0.4}
          fill="#fde68a"
          filter="url(#fire-blur)"
          style={{
            animation: `emberRise ${2.4 + i * 0.3}s ease-out infinite`,
            animationDelay: `${i * 0.35}s`,
          }}
        />
      ))}
    </svg>
  );
}

/* ============================================================================
 *  FIRE EMBERS — small floating sparks inside the final card
 * ========================================================================= */
function FireEmbers() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
      {[...Array(8)].map((_, i) => (
        <span
          key={i}
          className="absolute w-1 h-1 rounded-full bg-orange-300 shadow-[0_0_6px_rgba(251,146,60,0.9)]"
          style={{
            left: `${10 + (i * 11) % 80}%`,
            bottom: "-4px",
            animation: `cardEmber ${2.4 + (i % 4) * 0.5}s ease-out infinite`,
            animationDelay: `${i * 0.3}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ============================================================================
 *  MOBILE LIVE TOURNAMENT CARD
 *  --------------------------
 *  A unique vertical "live match hub" designed for narrow viewports. No tilt
 *  (touch devices don't have a hovering cursor) — instead we lean on:
 *    - a stage progression rail (QF → SF → Final) with the current stage
 *      animated as a glowing pip,
 *    - a hero matchup card with circular team avatars, animated VS spark,
 *      and a per-team score progress bar,
 *    - a horizontally swipeable "Up Next" rail of upcoming matches,
 *    - a single primary CTA + compact stats footer.
 *
 *  Reuses the TEAMS dataset defined at the top of this file.
 * ========================================================================= */
function LiveTournamentMobile() {
  // current featured match (semis: Alpha vs Zeta — winners advance)
  const a = TEAMS.alpha;
  const b = TEAMS.zeta;
  const stages = ["QF", "SF", "Final"];
  const currentStageIdx = 1; // SF

  // upcoming matches strip
  const upcoming: { left: Team; right: Team; when: string }[] = [
    { left: TEAMS.nova, right: TEAMS.vex,   when: "In 12m" },
    { left: TEAMS.delta, right: TEAMS.onyx, when: "In 38m" },
    { left: TEAMS.lynx,  right: TEAMS.omega, when: "In 1h" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="relative rounded-[24px] overflow-hidden"
    >
      {/* glass + glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.06] via-white/[0.02] to-white/[0.04]" />
      <div className="absolute inset-0 backdrop-blur-xl backdrop-saturate-125" />
      <div className="absolute inset-0 bg-[#0d0620]/92" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
      <div className="absolute -top-20 -right-12 w-56 h-56 rounded-full bg-purple-500/25 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-12 w-56 h-56 rounded-full bg-blue-500/15 blur-3xl pointer-events-none" />
      <div className="absolute inset-0 rounded-[24px] ring-1 ring-inset ring-white/10 pointer-events-none" />

      <div className="relative p-5">
        {/* Header — LIVE pill + stage rail */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="relative flex w-2.5 h-2.5">
              <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75" />
              <span className="relative rounded-full w-2.5 h-2.5 bg-red-500" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-red-400">
              Live Tournament
            </span>
          </div>

          {/* Stage progression: QF · SF · Final */}
          <div className="flex items-center gap-1.5">
            {stages.map((s, i) => {
              const active = i === currentStageIdx;
              const done = i < currentStageIdx;
              return (
                <div key={s} className="flex items-center gap-1.5">
                  <div className="flex items-center gap-1">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        active
                          ? "bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.9)] animate-pulse"
                          : done
                          ? "bg-purple-400/60"
                          : "bg-white/15"
                      }`}
                    />
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider ${
                        active ? "text-purple-200" : done ? "text-purple-300/70" : "text-gray-500"
                      }`}
                    >
                      {s}
                    </span>
                  </div>
                  {i < stages.length - 1 && (
                    <span className={`w-2 h-px ${done ? "bg-purple-400/60" : "bg-white/10"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* HERO MATCHUP */}
        <div className="relative rounded-2xl overflow-hidden mb-4">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-[#1a0f2e] to-fuchsia-900/20" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_50%_50%,rgba(168,85,247,0.18),transparent_70%)]" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-2xl" />

          <div className="relative p-4">
            <div className="flex items-center justify-between">
              {/* team A */}
              <MobileTeamFace team={a} />

              {/* VS pulse */}
              <div className="flex flex-col items-center px-2">
                <motion.div
                  animate={{ scale: [1, 1.12, 1], rotate: [0, 4, -4, 0] }}
                  transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
                  className="relative"
                >
                  <div className="absolute inset-0 -m-2 bg-purple-500/40 blur-xl rounded-full" />
                  <span className="relative text-[11px] font-black tracking-[0.3em] text-white">VS</span>
                </motion.div>
                <span className="mt-1 text-[8.5px] font-bold tracking-wider text-purple-300/80 uppercase">
                  Best of 3
                </span>
              </div>

              {/* team B */}
              <MobileTeamFace team={b} align="right" />
            </div>

            {/* score row with twin progress bars */}
            <div className="mt-4 grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
              <ScoreBar value={a.score} total={3} side="left" winner={a.winner} />
              <div className="text-sm font-black text-white tabular-nums">
                {a.score}<span className="text-gray-600 mx-1">—</span>{b.score}
              </div>
              <ScoreBar value={b.score} total={3} side="right" winner={b.winner} />
            </div>
          </div>
        </div>

        {/* UP NEXT — horizontally swipeable mini cards */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-400">
              Up Next
            </h4>
            <span className="text-[10px] text-gray-500">swipe →</span>
          </div>
          <div className="-mx-5 px-5 flex gap-2 overflow-x-auto snap-x snap-mandatory pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {upcoming.map((m, i) => (
              <div
                key={i}
                className="snap-start shrink-0 w-[56%] relative rounded-xl bg-white/[0.04] ring-1 ring-inset ring-white/10 p-3"
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent rounded-xl" />
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-purple-300">
                    {m.when}
                  </span>
                  <span className="text-[9px] text-gray-500">BO3</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <MiniTeamChip team={m.left} />
                  <span className="text-[9px] tracking-widest text-gray-500 font-bold">vs</span>
                  <MiniTeamChip team={m.right} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <Link
          to="/tournaments/live"
          className="relative flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-b from-[#9d4dff] to-[#6d28d9] text-white text-sm font-bold shadow-lg shadow-purple-900/60 overflow-hidden active:scale-[0.98] transition-transform"
        >
          <span className="absolute inset-x-0 top-0 h-px bg-white/50" />
          <Play className="w-3.5 h-3.5 fill-white" />
          Watch Live
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>

        {/* footer stats */}
        <div className="mt-4 flex items-center justify-between text-[10.5px] text-gray-300">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.9)]" />
            Live
          </span>
          <span className="flex items-center gap-1.5">
            <LayoutGrid className="w-3 h-3 text-purple-300" />
            32 Teams
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-purple-300" />
            64 Live
          </span>
        </div>
      </div>
    </motion.div>
  );
}

/* ------ mobile sub-pieces ------ */
function MobileTeamFace({ team, align = "left" }: { team: Team; align?: "left" | "right" }) {
  return (
    <div className={`flex flex-col items-center min-w-0 ${align === "right" ? "" : ""}`}>
      <div className="relative">
        <div className={`absolute -inset-2 rounded-full bg-gradient-to-br ${team.gradient} opacity-40 blur-xl`} />
        <div className={`relative w-14 h-14 rounded-full bg-gradient-to-br ${team.gradient} flex items-center justify-center ring-2 ring-white/20 shadow-xl`}>
          <span className="text-sm font-black text-white drop-shadow">{team.short}</span>
        </div>
        {team.winner && (
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 ring-2 ring-[#0d0620] flex items-center justify-center">
            <Trophy className="w-2.5 h-2.5 text-white" />
          </div>
        )}
      </div>
      <div className="mt-2 text-[11.5px] font-bold text-white text-center leading-tight">
        {team.name}
      </div>
      <div className="text-[9px] text-gray-400">
        {team.region} · #{team.rank}
      </div>
    </div>
  );
}

function ScoreBar({
  value,
  total,
  side,
  winner,
}: {
  value: number;
  total: number;
  side: "left" | "right";
  winner: boolean;
}) {
  const pct = Math.min(100, (value / total) * 100);
  const grad = winner
    ? "bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500"
    : "bg-white/15";
  return (
    <div className={`relative h-1.5 rounded-full bg-white/5 overflow-hidden ${side === "right" ? "rotate-180" : ""}`}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 1, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`absolute inset-y-0 left-0 ${grad}`}
      />
    </div>
  );
}

function MiniTeamChip({ team }: { team: Team }) {
  return (
    <div className="flex flex-col items-center min-w-0 flex-1">
      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${team.gradient} flex items-center justify-center ring-1 ring-white/15`}>
        <span className="text-[9px] font-black text-white">{team.short}</span>
      </div>
      <div className="mt-1 text-[9.5px] font-bold text-white truncate max-w-full">
        {team.name}
      </div>
    </div>
  );
}