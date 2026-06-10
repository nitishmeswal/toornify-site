import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Trophy, Users, GitBranch, Plus, Zap, ShieldCheck, Wallet, Heart,
  ArrowRight, Sparkles, Check,
} from "lucide-react";
import SEO from "@/components/SEO";

const STEPS = [
  {
    n: 1, title: "Create",
    sub: "Your Tournament",
    desc: "Set up your tournament in minutes. Choose game, format, date and prize pool.",
    icon: Plus,
    accent: "from-purple-500 to-fuchsia-500",
  },
  {
    n: 2, title: "Invite",
    sub: "Players & Teams",
    desc: "Share your tournament link and invite players or teams to join.",
    icon: Users,
    accent: "from-fuchsia-500 to-pink-500",
  },
  {
    n: 3, title: "Run",
    sub: "Your Matches",
    desc: "We handle the brackets, match scheduling, and updates in real-time.",
    icon: GitBranch,
    accent: "from-violet-500 to-purple-600",
  },
  {
    n: 4, title: "Reward",
    sub: "Your Champions",
    desc: "Announce winners and distribute prizes automatically and securely.",
    icon: Trophy,
    accent: "from-amber-500 to-orange-500",
  },
];

const FEATURES = [
  { icon: Zap,         title: "Real-time Updates", desc: "Live brackets and scores, always up to date" },
  { icon: GitBranch,   title: "Automated Brackets", desc: "Smart seeding and auto advancement" },
  { icon: ShieldCheck, title: "Secure Payments",   desc: "Safe prize distribution and payouts" },
  { icon: Heart,       title: "Built for Everyone", desc: "For organizers, players and communities" },
];

export default function HowItWorks() {
  return (
    <>
      <SEO />

      <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          {/* HERO */}
          <div className="relative grid lg:grid-cols-[1.05fr_1fr] gap-10 items-center mb-16">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 backdrop-blur-sm mb-5"
              >
                <Sparkles className="w-3 h-3 text-purple-300" />
                <span className="text-xs font-bold uppercase tracking-[0.22em] text-purple-200">
                  Easy. Fast. Powerful.
                </span>
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-[3.6rem] font-black tracking-tight leading-[1.05] mb-4"
              >
                Run tournaments
                <br />
                in{" "}
                <span className="bg-gradient-to-r from-[#a855f7] via-[#c084fc] to-[#7c3aed] bg-clip-text text-transparent">
                  4 simple steps
                </span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.25 }}
                className="text-gray-400 text-base max-w-md"
              >
                Whether you're an organizer or a player, Toornify makes esports effortless.
              </motion.p>
            </div>

            {/* trophy graphic */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="relative h-[300px] lg:h-[360px]"
            >
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_70%_at_50%_50%,rgba(168,85,247,0.35),transparent_70%)]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="relative"
                >
                  <div className="absolute -inset-12 bg-gradient-to-br from-amber-400/30 via-orange-500/30 to-purple-500/30 blur-3xl rounded-full" />
                  <div className="relative w-44 h-44 lg:w-56 lg:h-56 rounded-[40px] bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 flex items-center justify-center ring-2 ring-white/20 shadow-2xl shadow-amber-900/50">
                    <Trophy className="w-24 h-24 text-white drop-shadow-[0_0_20px_rgba(251,191,36,0.85)]" />
                  </div>
                </motion.div>
              </div>
              {/* sparkle dots */}
              {[...Array(10)].map((_, i) => (
                <motion.span
                  key={i}
                  className="absolute w-1 h-1 rounded-full bg-purple-300"
                  style={{
                    left: `${(i * 47) % 100}%`,
                    top: `${(i * 67) % 100}%`,
                    boxShadow: "0 0 6px rgba(168,85,247,0.8)",
                  }}
                  animate={{ y: [0, -16, 0], opacity: [0.2, 1, 0.2] }}
                  transition={{ duration: 3 + (i % 3), repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </motion.div>
          </div>

          {/* 4 STEPS */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {STEPS.map((s, i) => (
              <StepCard key={s.n} step={s} index={i} />
            ))}
          </div>

          {/* FEATURES STRIP */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-12">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.06 }}
                whileHover={{ y: -3 }}
                className="relative rounded-2xl bg-white/[0.03] ring-1 ring-inset ring-white/8 hover:ring-purple-400/30 p-4 flex items-start gap-3 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 ring-1 ring-inset ring-purple-400/40 flex items-center justify-center flex-shrink-0">
                  <f.icon className="w-4 h-4 text-purple-300" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-[13px] font-bold text-white tracking-tight mb-1">{f.title}</h4>
                  <p className="text-[11.5px] text-gray-400 leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA BANNER */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#1a0f2e] via-[#140a26] to-[#0a0414] ring-1 ring-inset ring-white/10">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_15%_50%,rgba(168,85,247,0.25),transparent_60%)]" />
            <div className="absolute -right-10 -top-10 w-72 h-72 rounded-full bg-fuchsia-500/15 blur-3xl pointer-events-none" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            <div className="relative grid md:grid-cols-[1fr_auto_auto] gap-5 items-center p-7 lg:p-9">
              <div className="flex items-center gap-5">
                <motion.div
                  animate={{ y: [0, -6, 0], rotate: [-2, 2, -2] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="relative flex-shrink-0"
                >
                  <div className="absolute -inset-3 bg-purple-500/30 blur-2xl rounded-full" />
                  <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center ring-1 ring-white/15">
                    <Trophy className="w-7 h-7 text-white" />
                  </div>
                </motion.div>
                <div>
                  <h3 className="text-xl lg:text-2xl font-black text-white tracking-tight mb-1">
                    Ready to create your first tournament?
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Join thousands of organizers and players building the future of esports.
                  </p>
                </div>
              </div>
              <Link
                to="/tournaments/create"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#a855f7] text-white font-bold text-sm shadow-lg shadow-purple-900/50 hover:shadow-purple-700/70 hover:scale-[1.02] transition-all whitespace-nowrap"
              >
                Create Tournament <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

/* ============================================================================
 *  STEP CARD with mini visualization
 * ========================================================================= */
function StepCard({ step, index }: { step: (typeof STEPS)[number]; index: number }) {
  const Icon = step.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.55, delay: index * 0.08 }}
      whileHover={{ y: -4 }}
      className="group relative rounded-3xl overflow-hidden bg-gradient-to-b from-white/[0.04] to-white/[0.01] ring-1 ring-inset ring-white/8 hover:ring-purple-400/40 p-5 transition-all"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-purple-500/0 group-hover:bg-purple-500/25 blur-3xl transition-colors duration-500" />

      {/* number + icon */}
      <div className="relative flex items-start justify-between mb-4">
        <span className="text-5xl font-black bg-gradient-to-br from-white/30 to-white/5 bg-clip-text text-transparent leading-none">
          {step.n}
        </span>
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${step.accent} ring-1 ring-white/15 flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>

      <h3 className="text-base font-black text-white tracking-tight">{step.title}</h3>
      <p className="text-sm font-bold text-purple-200/80 mb-2">{step.sub}</p>
      <p className="text-[12px] text-gray-400 leading-relaxed mb-4">{step.desc}</p>

      {/* mini visual per step */}
      <div className="relative rounded-xl bg-[#0c0618] ring-1 ring-inset ring-white/10 p-3 min-h-[160px]">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        {step.n === 1 && <CreateVisual />}
        {step.n === 2 && <InviteVisual />}
        {step.n === 3 && <BracketVisual />}
        {step.n === 4 && <ChampionVisual />}
      </div>
    </motion.div>
  );
}

function CreateVisual() {
  return (
    <div className="text-[10px] space-y-2">
      <p className="text-purple-300 font-bold uppercase tracking-widest text-[8.5px]">Create Tournament</p>
      <Field label="Game" value="Valorant" />
      <Field label="Format" value="Single Elimination" />
      <Field label="Date" value="May 20, 2025" />
      <Field label="Prize Pool" value="$5,000" />
      <button className="w-full mt-1 rounded-md bg-gradient-to-r from-[#7c3aed] to-[#a855f7] text-white text-[10px] font-bold py-1.5 shadow shadow-purple-900/50">
        Create Tournament
      </button>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-md bg-white/[0.04] ring-1 ring-inset ring-white/8 px-2 py-1.5">
      <span className="text-gray-500 text-[9.5px]">{label}</span>
      <span className="text-white text-[10px] font-bold">{value}</span>
    </div>
  );
}

function InviteVisual() {
  const players = [
    { name: "Arjun",   c: "from-purple-500 to-fuchsia-500" },
    { name: "Phoenix", c: "from-rose-500 to-red-500" },
    { name: "Reken",   c: "from-amber-500 to-orange-500" },
    { name: "Shadow",  c: "from-cyan-500 to-blue-500" },
  ];
  return (
    <div className="space-y-1.5">
      <p className="text-purple-300 font-bold uppercase tracking-widest text-[8.5px] mb-1.5">Invite Players</p>
      {players.map((p) => (
        <div key={p.name} className="flex items-center gap-2 rounded-md bg-white/[0.04] ring-1 ring-inset ring-white/8 px-2 py-1">
          <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${p.c} flex items-center justify-center ring-1 ring-white/15`}>
            <span className="text-[8px] font-black text-white">{p.name[0]}</span>
          </div>
          <span className="text-white text-[10px] font-bold flex-1 truncate">{p.name}</span>
          <span className="text-purple-300 text-[9px] font-bold">Invite</span>
        </div>
      ))}
      <div className="rounded-md bg-purple-500/10 ring-1 ring-inset ring-purple-400/30 px-2 py-1 text-center">
        <span className="text-[8.5px] text-purple-200 font-bold">Tournament Link Copied</span>
      </div>
    </div>
  );
}

function BracketVisual() {
  return (
    <div className="space-y-2">
      <p className="text-purple-300 font-bold uppercase tracking-widest text-[8.5px]">Live Bracket</p>
      <div className="grid grid-cols-3 gap-1.5 text-[9px] items-center">
        <div className="space-y-1">
          {["Team Alpha", "Team Beta", "Team Delta", "Team Nova"].map((t) => (
            <div key={t} className="rounded bg-white/[0.04] ring-1 ring-inset ring-white/8 px-1.5 py-1 text-white font-bold truncate">
              {t}
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-3 items-center">
          <div className="w-full rounded bg-purple-500/15 ring-1 ring-inset ring-purple-400/30 px-1.5 py-1 text-purple-200 font-bold text-center">Alpha</div>
          <div className="w-full rounded bg-white/[0.04] ring-1 ring-inset ring-white/8 px-1.5 py-1 text-gray-300 font-bold text-center">Delta</div>
        </div>
        <div className="flex items-center justify-center">
          <div className="rounded bg-gradient-to-br from-amber-500/20 to-orange-500/20 ring-1 ring-amber-400/40 px-1.5 py-2 text-center w-full">
            <Trophy className="w-3 h-3 text-amber-300 mx-auto mb-0.5" />
            <span className="text-amber-300 font-black text-[8px]">FINAL</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChampionVisual() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center pt-1">
      <p className="text-purple-300 font-bold uppercase tracking-widest text-[8.5px] mb-2">
        Tournament Completed
      </p>
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        className="relative mb-2"
      >
        <div className="absolute -inset-3 bg-amber-500/30 blur-xl rounded-full" />
        <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center ring-1 ring-white/15">
          <Trophy className="w-6 h-6 text-white" />
        </div>
      </motion.div>
      <span className="text-[8.5px] text-gray-500 font-bold uppercase tracking-widest">Champion</span>
      <span className="text-[12px] font-black text-white">Team Alpha</span>
      <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/15 ring-1 ring-inset ring-emerald-400/40 text-[9px] font-bold text-emerald-300">
        <Wallet className="w-2.5 h-2.5" /> $5,000 Paid
      </div>
      <div className="mt-1.5 inline-flex items-center gap-1 text-[8.5px] text-gray-500">
        <Check className="w-2.5 h-2.5 text-emerald-400" /> Payout completed
      </div>
    </div>
  );
}
