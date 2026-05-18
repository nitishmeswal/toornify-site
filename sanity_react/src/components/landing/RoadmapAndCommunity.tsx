import { motion } from "framer-motion";
import { Star, ThumbsUp, ShieldCheck, Flame, Sparkles, Crown, Swords, Zap } from "lucide-react";

const PHASES = [
  {
    label: "Phase 1",
    title: "Tournament Core",
    desc: "Powerful tournament creation, brackets, and live match tracking.",
    status: "COMPLETED",
    statusColor: "bg-emerald-500/15 text-emerald-300 ring-emerald-400/40",
    dotColor: "bg-emerald-500",
    expand: true,
  },
  {
    label: "Phase 2",
    title: "Squad & Teams",
    desc: "Advanced team management, chat and community features.",
    status: "IN PROGRESS",
    statusColor: "bg-amber-500/15 text-amber-300 ring-amber-400/40",
    dotColor: "bg-amber-500",
    expand: true,
  },
  {
    label: "Phase 3",
    title: "Monetization",
    desc: "Subscriptions, sponsorships and creator earnings.",
    status: "UP NEXT",
    statusColor: "bg-purple-500/15 text-purple-300 ring-purple-400/40",
    dotColor: "bg-[#1a0f2e] ring-purple-500/50",
    expand: false,
  },
  {
    label: "Phase 4",
    title: "Global Expansion",
    desc: "More games, more regions, more possibilities.",
    status: "UP NEXT",
    statusColor: "bg-purple-500/15 text-purple-300 ring-purple-400/40",
    dotColor: "bg-[#1a0f2e] ring-purple-500/50",
    expand: false,
  },
];

const TESTIMONIALS = [
  {
    quote:
      "Toornify made organizing my tournament so easy. Everything just works!",
    name: "Karan Singh",
    role: "Tournament Organizer",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=karan",
  },
  {
    quote:
      "Great platform for competitive players. The matches run smooth and the UI is slick.",
    name: "Jason Miller",
    role: "Esports Player",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jason",
  },
  {
    quote:
      "I never miss a match now. The live experience is incredible!",
    name: "Maya Patel",
    role: "Esports Fan",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=maya",
  },
];

const ORGS = [
  { name: "Team Insane",     icon: Swords },
  { name: "Gods Reborn",     icon: Crown },
  { name: "Skylight Gaming", icon: Sparkles },
  { name: "Wolves Esports",  icon: Flame },
  { name: "Ruthless Army",   icon: ShieldCheck },
];

export default function RoadmapAndCommunity() {
  return (
    <section className="relative py-24">
      <div className="max-w-[1480px] mx-auto px-5 sm:px-6 lg:px-10">
        <div className="grid md:grid-cols-[0.95fr_1.05fr] gap-6 lg:gap-8">
          {/* ROADMAP card */}
          <div className="relative rounded-3xl bg-white/[0.03] ring-1 ring-inset ring-white/8 p-6 lg:p-7 overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
            <div className="flex items-center gap-2 mb-7">
              <Zap className="w-4 h-4 text-purple-300" />
              <h3 className="text-lg font-black text-white tracking-tight">Our Roadmap</h3>
            </div>

            <div className="relative">
              {/* vertical rail */}
              <div className="absolute left-[15px] top-3 bottom-3 w-px bg-gradient-to-b from-emerald-500/70 via-amber-500/50 via-50% to-purple-500/30" />
              <div className="space-y-5">
                {PHASES.map((p, i) => (
                  <PhaseRow key={p.label} phase={p} index={i} />
                ))}
              </div>
            </div>
          </div>

          {/* COMMUNITY card */}
          <div className="relative rounded-3xl bg-white/[0.03] ring-1 ring-inset ring-white/8 p-6 lg:p-7 overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
            <div className="flex items-center gap-2 mb-5">
              <ThumbsUp className="w-4 h-4 text-purple-300" />
              <h3 className="text-lg font-black text-white tracking-tight">Loved by the community</h3>
            </div>

            {/* rating */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl font-black text-white tabular-nums">4.8</span>
              <div className="flex items-center gap-0.5">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-xs text-gray-400">From 2k+ reviews</span>
            </div>

            {/* testimonials */}
            <div className="grid sm:grid-cols-3 gap-2.5 mb-7">
              {TESTIMONIALS.map((t, i) => (
                <motion.div
                  key={t.name}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-10%" }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  whileHover={{ y: -2 }}
                  className="relative rounded-2xl bg-white/[0.04] ring-1 ring-inset ring-white/8 hover:ring-purple-400/30 p-3.5 transition-all flex flex-col"
                >
                  <div className="flex items-center gap-0.5 mb-2">
                    {[0, 1, 2, 3, 4].map((s) => (
                      <Star key={s} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-[11.5px] text-gray-200 leading-relaxed mb-3 flex-1">
                    "{t.quote}"
                  </p>
                  <div className="flex items-center gap-2 pt-2.5 border-t border-white/5">
                    <img
                      src={t.avatar}
                      alt={t.name}
                      className="w-7 h-7 rounded-full bg-purple-500/20 ring-1 ring-white/10"
                    />
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold text-white truncate">{t.name}</div>
                      <div className="text-[9.5px] text-gray-500 truncate">{t.role}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* trusted by */}
            <div className="border-t border-white/8 pt-5">
              <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-500 mb-3">
                Trusted by top organizations
              </p>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5">
                {ORGS.map((o) => (
                  <div
                    key={o.name}
                    className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors cursor-default"
                  >
                    <o.icon className="w-3.5 h-3.5 text-purple-300/80" />
                    <span className="text-[11px] font-bold tracking-wide">{o.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PhaseRow({ phase, index }: { phase: (typeof PHASES)[number]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -14 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="relative pl-11"
    >
      {/* dot on rail */}
      <span
        className={`absolute left-0 top-0.5 w-[30px] h-[30px] rounded-full flex items-center justify-center text-[10px] font-black text-white ring-[3px] ring-[#070310] ${
          phase.status === "COMPLETED"
            ? "bg-emerald-500"
            : phase.status === "IN PROGRESS"
            ? "bg-amber-500"
            : "bg-[#1a0f2e] ring-purple-500/40"
        }`}
      >
        {index + 1}
      </span>

      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-[0.22em] font-bold text-gray-500">
            {phase.label}
          </span>
          <span className="text-[13px] font-black text-white">{phase.title}</span>
        </div>
        <span
          className={`px-1.5 py-0.5 rounded text-[9px] font-black ring-1 ring-inset tracking-wider ${phase.statusColor}`}
        >
          {phase.status}
        </span>
      </div>

      {phase.expand && (
        <p className="text-[11.5px] text-gray-400 leading-relaxed">{phase.desc}</p>
      )}
      {!phase.expand && (
        <p className="text-[11px] text-gray-500 leading-relaxed">{phase.desc}</p>
      )}
    </motion.div>
  );
}
