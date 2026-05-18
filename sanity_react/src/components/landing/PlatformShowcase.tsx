import { motion, AnimatePresence } from "framer-motion";
import {
  Smartphone, LayoutDashboard, Globe, Check, Trophy, Crown,
  Users, TrendingUp, Calendar, Radio, Sparkles, Eye,
} from "lucide-react";
import { useState } from "react";

const TABS = [
  { key: "player",    label: "Player App",          icon: Smartphone },
  { key: "organizer", label: "Organizer Dashboard", icon: LayoutDashboard },
  { key: "public",    label: "Public Tournaments",  icon: Globe },
] as const;
type TabKey = (typeof TABS)[number]["key"];

const COPY: Record<TabKey, { heading: string; body: string; bullets: string[]; cta: string }> = {
  player: {
    heading: "Your competitive\nhub. Anytime,\nanywhere.",
    body: "Track matches, climb leaderboards and manage your team — all from the palm of your hand.",
    bullets: [
      "Join tournaments instantly",
      "Track your matches & stats",
      "Manage your team",
      "Climb the leaderboards",
    ],
    cta: "Explore Player App",
  },
  organizer: {
    heading: "Run pro events\nlike the pros do.",
    body: "Everything you need to host and operate tournaments at scale — payouts, brackets, analytics.",
    bullets: [
      "Drag-and-drop bracket builder",
      "Automated payouts & prize pools",
      "Live analytics dashboard",
      "Team & roster management",
    ],
    cta: "Open Dashboard",
  },
  public: {
    heading: "A global stage\nfor every match.",
    body: "Public tournament pages built to thrill fans with live brackets, stats and highlights.",
    bullets: [
      "Shareable tournament pages",
      "Live brackets & scores",
      "Fan engagement tools",
      "Highlight clips & VODs",
    ],
    cta: "Browse Tournaments",
  },
};

export default function PlatformShowcase() {
  const [active, setActive] = useState<TabKey>("player");

  return (
    <section className="relative py-24">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_50%_at_50%_30%,rgba(124,58,237,0.10),transparent_70%)]" />
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
        <h2 className="text-center text-3xl sm:text-4xl lg:text-[2.6rem] font-black tracking-tight text-white mb-3">
          One Platform.{" "}
          <span className="bg-gradient-to-r from-[#a855f7] via-[#c084fc] to-[#7c3aed] bg-clip-text text-transparent">
            Three Powerful Experiences.
          </span>
        </h2>
        <p className="text-center text-gray-400 text-base mb-10">
          Built for every role in esports.
        </p>

        {/* tabs */}
        <div className="flex justify-center mb-10">
          <div className="relative inline-flex items-center gap-1 p-1 rounded-2xl bg-white/[0.04] ring-1 ring-inset ring-white/8">
            {TABS.map((t) => {
              const Icon = t.icon;
              const isActive = active === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setActive(t.key)}
                  className={`relative px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors ${
                    isActive ? "text-white" : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="ps-tab-pill"
                      className="absolute inset-0 rounded-xl bg-gradient-to-b from-[#7c3aed] to-[#5b21b6] shadow-lg shadow-purple-900/40 ring-1 ring-inset ring-white/15"
                      transition={{ type: "spring", stiffness: 350, damping: 28 }}
                    />
                  )}
                  <Icon className="relative w-4 h-4" />
                  <span className="relative">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ONE unified panel: copy + 3 previews */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-white/[0.04] to-white/[0.01] ring-1 ring-inset ring-white/8 p-6 lg:p-8">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-purple-500/15 blur-[100px] pointer-events-none" />

          <div className="relative grid lg:grid-cols-[260px_1fr] gap-6 lg:gap-8 items-stretch">
            {/* copy */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`copy-${active}`}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col justify-center"
              >
                <h3 className="text-2xl lg:text-[1.75rem] font-black text-white leading-[1.1] tracking-tight mb-4 whitespace-pre-line">
                  {COPY[active].heading}
                </h3>
                <ul className="space-y-2.5 mb-6">
                  {COPY[active].bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                      <span className="text-[13px] text-gray-300">{b}</span>
                    </li>
                  ))}
                </ul>
                <button className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#a855f7] text-white font-semibold text-sm shadow-lg shadow-purple-900/50 hover:shadow-purple-700/70 hover:scale-[1.02] transition-all w-fit">
                  {COPY[active].cta}
                </button>
              </motion.div>
            </AnimatePresence>

            {/* 3-card preview row */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`prev-${active}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-3"
              >
                {active === "player" && (
                  <>
                    <PreviewCard title="My Matches"><MyMatches /></PreviewCard>
                    <PreviewCard title="Leaderboard" subtitle="This Season"><Leaderboard /></PreviewCard>
                    <PreviewCard title="My Team"><MyTeam /></PreviewCard>
                  </>
                )}
                {active === "organizer" && (
                  <>
                    <PreviewCard title="Bracket Control"><BracketControl /></PreviewCard>
                    <PreviewCard title="Viewer Trend" subtitle="Last 24h"><ViewerTrend /></PreviewCard>
                    <PreviewCard title="Prize Payouts"><Payouts /></PreviewCard>
                  </>
                )}
                {active === "public" && (
                  <>
                    <PreviewCard title="Live Now" subtitle="3 Active"><LiveNow /></PreviewCard>
                    <PreviewCard title="Live Bracket"><PublicBracket /></PreviewCard>
                    <PreviewCard title="Fan Stats"><FanStats /></PreviewCard>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================================
 *  SHARED PREVIEW CARD WRAPPER
 * ========================================================================= */
function PreviewCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative rounded-2xl bg-[#0c0618] ring-1 ring-inset ring-white/12 overflow-hidden p-4 min-h-[290px] flex flex-col">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-[13px] font-black text-white tracking-tight">{title}</h4>
        {subtitle && (
          <span className="text-[9px] uppercase tracking-widest text-gray-500 font-bold">
            {subtitle}
          </span>
        )}
      </div>
      <div className="flex-1 flex flex-col">{children}</div>
    </div>
  );
}

/* ============================================================================
 *  PLAYER APP previews
 * ========================================================================= */
function MyMatches() {
  return (
    <div className="flex-1 flex flex-col">
      <span className="self-start mb-2 px-1.5 py-0.5 rounded bg-red-500/90 text-[8px] font-black text-white tracking-widest">
        LIVE
      </span>
      <div className="relative flex-1 rounded-lg overflow-hidden bg-[url('https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=70')] bg-cover bg-center mb-3 min-h-[120px]">
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-2.5 flex items-center justify-between">
          <div className="flex flex-col items-center gap-0.5">
            <Avatar gradient="from-purple-500 to-fuchsia-500" letter="TA" />
            <span className="text-[8.5px] font-bold text-white">Team Alpha</span>
          </div>
          <span className="text-[10px] font-black text-white/80">VS</span>
          <div className="flex flex-col items-center gap-0.5">
            <Avatar gradient="from-rose-500 to-red-500" letter="TO" />
            <span className="text-[8.5px] font-bold text-white">Team Omega</span>
          </div>
        </div>
      </div>
      <div className="text-center text-[11px] text-white font-bold mb-1 tabular-nums">40 : 45 : 18</div>
      <div className="text-center text-[8.5px] text-gray-500 tracking-wider mb-3">
        Single Finals Team
      </div>
      <button className="rounded-md bg-white/[0.06] hover:bg-white/[0.12] ring-1 ring-inset ring-white/10 text-[10.5px] font-bold text-white py-1.5 transition-colors">
        Match Details
      </button>
    </div>
  );
}

function Leaderboard() {
  const rows = [
    { name: "Arjun",   pts: 2450, c: "from-purple-500 to-fuchsia-500" },
    { name: "Phoenix", pts: 2120, c: "from-rose-500 to-red-500" },
    { name: "Zoro",    pts: 1980, c: "from-amber-500 to-orange-500" },
    { name: "Shadow",  pts: 1750, c: "from-cyan-500 to-blue-500" },
    { name: "Rekon",   pts: 1530, c: "from-emerald-500 to-teal-500" },
  ];
  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 space-y-1.5">
        {rows.map((r, i) => (
          <div key={r.name} className="flex items-center gap-2 rounded-md bg-white/[0.03] ring-1 ring-inset ring-white/8 px-2 py-1.5">
            <span className={`text-[10px] font-black w-4 ${i < 3 ? "text-purple-300" : "text-gray-500"}`}>
              {i + 1}
            </span>
            <Avatar gradient={r.c} letter={r.name[0]} />
            <span className="text-[11px] font-bold text-white flex-1 truncate">{r.name}</span>
            <span className="text-[10px] font-bold text-purple-200 tabular-nums">
              {r.pts.toLocaleString()} XP
            </span>
          </div>
        ))}
      </div>
      <button className="mt-3 text-[10px] font-bold text-purple-300 hover:text-purple-200 transition-colors">
        View Full Leaderboard →
      </button>
    </div>
  );
}

function MyTeam() {
  const players = [
    { name: "Team Alpha", role: "5/5 Players", c: "from-purple-500 to-fuchsia-500", header: true },
    { name: "Arjun",   role: "Leader",  c: "from-purple-500 to-fuchsia-500" },
    { name: "Phoenix", role: "Captain", c: "from-rose-500 to-red-500" },
    { name: "Zoro",    role: "",        c: "from-amber-500 to-orange-500" },
    { name: "Shadow",  role: "",        c: "from-cyan-500 to-blue-500" },
    { name: "Rekon",   role: "",        c: "from-emerald-500 to-teal-500" },
  ];
  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 space-y-1.5">
        {players.map((p, i) => (
          <div
            key={i}
            className={`flex items-center gap-2 rounded-md px-2 py-1.5 ${
              p.header
                ? "bg-purple-500/15 ring-1 ring-inset ring-purple-400/30"
                : "bg-white/[0.03] ring-1 ring-inset ring-white/8"
            }`}
          >
            <div className={`w-6 h-6 rounded-md bg-gradient-to-br ${p.c} flex items-center justify-center ring-1 ring-white/15`}>
              <span className="text-[9px] font-black text-white">{p.name[0]}</span>
            </div>
            <span className="text-[11px] font-bold text-white flex-1 truncate">{p.name}</span>
            {p.role && (
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                p.role === "Leader"
                  ? "bg-amber-500/15 text-amber-300 ring-1 ring-inset ring-amber-400/30"
                  : p.role === "Captain"
                  ? "bg-blue-500/15 text-blue-300 ring-1 ring-inset ring-blue-400/30"
                  : "text-gray-400"
              }`}>
                {p.role}
              </span>
            )}
          </div>
        ))}
      </div>
      <button className="mt-3 rounded-md bg-gradient-to-r from-[#7c3aed] to-[#a855f7] text-[10.5px] font-bold text-white py-1.5 shadow shadow-purple-900/50 hover:shadow-purple-700/70 transition-all">
        Manage Team
      </button>
    </div>
  );
}

/* ============================================================================
 *  ORGANIZER previews
 * ========================================================================= */
function BracketControl() {
  return (
    <div className="flex-1 flex flex-col">
      <div className="grid grid-cols-3 gap-1.5 mb-2.5">
        {[
          { v: "32", l: "Teams", icon: Users },
          { v: "$25K", l: "Prize", icon: Trophy },
          { v: "+18%", l: "Engage", icon: TrendingUp },
        ].map((k) => (
          <div key={k.l} className="rounded-md bg-white/[0.04] ring-1 ring-inset ring-white/10 p-2">
            <k.icon className="w-3 h-3 text-purple-300 mb-1" />
            <div className="text-[12px] font-black text-white leading-none">{k.v}</div>
            <div className="text-[8.5px] text-gray-400 mt-0.5">{k.l}</div>
          </div>
        ))}
      </div>
      <div className="flex-1 rounded-md bg-white/[0.03] ring-1 ring-inset ring-white/8 p-2.5">
        <div className="text-[8.5px] uppercase tracking-widest text-gray-500 font-bold mb-2">
          Live Matches
        </div>
        {[
          { a: "Alpha", b: "Omega", s: "2 - 1" },
          { a: "Zeta", b: "Delta", s: "1 - 1" },
          { a: "Nova", b: "Vex", s: "0 - 0" },
        ].map((m) => (
          <div key={m.a} className="flex items-center justify-between py-1 text-[10.5px]">
            <span className="text-white font-bold truncate">{m.a} vs {m.b}</span>
            <span className="text-purple-300 font-black tabular-nums">{m.s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ViewerTrend() {
  return (
    <div className="flex-1 flex flex-col">
      <div className="text-[10px] text-gray-400 mb-1">Peak viewers</div>
      <div className="text-2xl font-black text-white mb-1 tabular-nums">12,486</div>
      <div className="flex items-center gap-1 text-[10px] text-emerald-300 font-bold mb-3">
        <TrendingUp className="w-3 h-3" /> +18% vs yesterday
      </div>
      <div className="flex-1 rounded-md bg-white/[0.03] ring-1 ring-inset ring-white/8 p-2.5">
        <svg viewBox="0 0 200 80" className="w-full h-full">
          <defs>
            <linearGradient id="vt-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M0 60 L20 50 L40 55 L60 35 L80 40 L100 25 L120 28 L140 12 L160 18 L180 5 L200 14 L200 80 L0 80 Z" fill="url(#vt-area)" />
          <path d="M0 60 L20 50 L40 55 L60 35 L80 40 L100 25 L120 28 L140 12 L160 18 L180 5 L200 14" fill="none" stroke="#c084fc" strokeWidth="1.5" />
          <circle cx="180" cy="5" r="3" fill="#fff" stroke="#a855f7" strokeWidth="1.5" />
        </svg>
      </div>
    </div>
  );
}

function Payouts() {
  const rows = [
    { team: "Team Alpha", amt: "$12,500", status: "Paid",     c: "emerald" },
    { team: "Team Zeta",  amt: "$7,500",  status: "Paid",     c: "emerald" },
    { team: "Team Nova",  amt: "$3,500",  status: "Pending",  c: "amber" },
    { team: "Team Vex",   amt: "$1,500",  status: "Queued",   c: "purple" },
  ];
  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 space-y-1.5">
        {rows.map((r) => (
          <div key={r.team} className="flex items-center justify-between rounded-md bg-white/[0.03] ring-1 ring-inset ring-white/8 px-2 py-1.5">
            <span className="text-[11px] font-bold text-white truncate flex-1">{r.team}</span>
            <span className="text-[11px] font-black text-white tabular-nums mr-2">{r.amt}</span>
            <span className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded ring-1 ring-inset ${
              r.c === "emerald" ? "bg-emerald-500/15 text-emerald-300 ring-emerald-400/40"
              : r.c === "amber" ? "bg-amber-500/15 text-amber-300 ring-amber-400/40"
              : "bg-purple-500/15 text-purple-300 ring-purple-400/40"
            }`}>{r.status.toUpperCase()}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between text-[10px] pt-2 border-t border-white/8">
        <span className="text-gray-400">Total payout</span>
        <span className="text-white font-black tabular-nums">$25,000</span>
      </div>
    </div>
  );
}

/* ============================================================================
 *  PUBLIC previews
 * ========================================================================= */
function LiveNow() {
  const rows = [
    { name: "Valorant Night Cup", viewers: "8.2K", c: "from-red-500 to-rose-600" },
    { name: "BGMI Pro League",    viewers: "5.6K", c: "from-amber-500 to-orange-500" },
    { name: "CoD Masters",        viewers: "3.1K", c: "from-blue-500 to-cyan-500" },
  ];
  return (
    <div className="flex-1 flex flex-col gap-2">
      {rows.map((r) => (
        <div key={r.name} className="flex items-center gap-2.5 rounded-lg bg-white/[0.04] ring-1 ring-inset ring-white/10 p-2.5">
          <div className={`w-9 h-9 rounded-md bg-gradient-to-br ${r.c} ring-1 ring-white/15 flex items-center justify-center`}>
            <Radio className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-bold text-white truncate">{r.name}</div>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[9px] text-red-400 font-bold tracking-widest uppercase">Live</span>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-[10px] text-white font-bold">
              <Eye className="w-3 h-3 text-gray-400" /> {r.viewers}
            </div>
          </div>
        </div>
      ))}
      <button className="mt-1 text-[10px] font-bold text-purple-300 hover:text-purple-200 transition-colors">
        Watch all live →
      </button>
    </div>
  );
}

function PublicBracket() {
  return (
    <div className="flex-1 flex flex-col gap-2 justify-center">
      {/* mini bracket */}
      <div className="grid grid-cols-3 gap-1.5 items-center">
        <div className="space-y-1.5">
          {["TA", "TO", "TZ", "TD"].map((t, i) => (
            <MiniRow key={t} t={t} active={i === 0} />
          ))}
        </div>
        <div className="flex flex-col gap-3">
          <MiniRow t="TA" active />
          <MiniRow t="TZ" />
        </div>
        <div className="flex items-center justify-center">
          <div className="rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 ring-1 ring-amber-400/40 px-2 py-2.5 text-center">
            <Crown className="w-4 h-4 text-amber-300 mx-auto mb-1" />
            <div className="text-[9px] font-black text-amber-300">FINAL</div>
            <div className="text-[10px] font-bold text-white mt-0.5">TA vs TZ</div>
          </div>
        </div>
      </div>
      <div className="text-center text-[9.5px] text-gray-500 tracking-wider uppercase font-bold mt-1">
        Grand Final · 8:00 PM
      </div>
    </div>
  );
}

function MiniRow({ t, active }: { t: string; active?: boolean }) {
  return (
    <div className={`rounded-md px-1.5 py-1 ring-1 ring-inset text-[10px] font-black text-center ${
      active
        ? "bg-purple-500/20 ring-purple-400/40 text-white"
        : "bg-white/[0.04] ring-white/8 text-gray-400"
    }`}>{t}</div>
  );
}

function FanStats() {
  return (
    <div className="flex-1 flex flex-col">
      <div className="grid grid-cols-2 gap-2 mb-3">
        {[
          { v: "48K",  l: "Watching now", icon: Eye },
          { v: "12K",  l: "Predictions",  icon: Sparkles },
          { v: "2.4K", l: "Chat / min",   icon: Radio },
          { v: "92",   l: "Highlights",   icon: Calendar },
        ].map((s) => (
          <div key={s.l} className="rounded-md bg-white/[0.04] ring-1 ring-inset ring-white/10 p-2.5">
            <s.icon className="w-3 h-3 text-purple-300 mb-1" />
            <div className="text-[13px] font-black text-white leading-none tabular-nums">{s.v}</div>
            <div className="text-[8.5px] text-gray-400 mt-0.5">{s.l}</div>
          </div>
        ))}
      </div>
      <div className="rounded-md bg-white/[0.03] ring-1 ring-inset ring-white/8 p-2.5">
        <div className="text-[8.5px] uppercase tracking-widest text-gray-500 font-bold mb-2">
          Top Reactions
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[
            { e: "🔥", n: 1240 },
            { e: "⚡", n: 820 },
            { e: "🎯", n: 612 },
            { e: "🏆", n: 488 },
          ].map((r) => (
            <span key={r.e} className="inline-flex items-center gap-1 text-[10px] bg-white/[0.05] ring-1 ring-inset ring-white/10 rounded-full px-2 py-0.5">
              <span>{r.e}</span>
              <span className="text-white font-bold tabular-nums">{r.n}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* helper */
function Avatar({ gradient, letter }: { gradient: string; letter: string }) {
  return (
    <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center ring-1 ring-white/15`}>
      <span className="text-[9px] font-black text-white">{letter}</span>
    </div>
  );
}
