import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Trophy, Calendar, Users, Globe2, Gamepad2 } from "lucide-react";
import { tournamentService, gameService, userService } from "@/lib/services";

interface StatItem {
  icon: typeof Trophy;
  value: number;
  label: string;
  format: (n: number) => string;
}

const DEFAULT_STATS: StatItem[] = [
  { icon: Trophy, value: 0, label: "Matches Played", format: (n: number) => n >= 1000 ? `${Math.round(n / 1000)}K+` : `${Math.round(n)}+` },
  { icon: Calendar, value: 0, label: "Tournaments Hosted", format: (n: number) => n >= 1000 ? `${Math.round(n / 1000)}K+` : `${Math.round(n)}+` },
  { icon: Users, value: 0, label: "Players Registered", format: (n: number) => n >= 1000 ? `${Math.round(n / 1000)}K+` : `${Math.round(n)}+` },
  { icon: Globe2, value: 40, label: "Gaming Communities", format: (n: number) => `${Math.round(n)}+` },
  { icon: Gamepad2, value: 0, label: "Supported Games", format: (n: number) => `${Math.round(n)}` },
];

export default function StatsBar() {
  const [stats, setStats] = useState<StatItem[]>(DEFAULT_STATS);

  useEffect(() => {
    let stale = false;

    async function load() {
      try {
        const [tournamentsRes, games, players] = await Promise.allSettled([
          tournamentService.getAll(),
          gameService.getAll(),
          userService.getPlayers(),
        ]);

        if (stale) return;

        const tournamentCount = tournamentsRes.status === 'fulfilled' ? (tournamentsRes.value.pagination?.totalItems ?? tournamentsRes.value.data?.length ?? 0) : 0;
        const gameCount = games.status === 'fulfilled' ? games.value.length : 0;
        const playerCount = players.status === 'fulfilled' ? players.value.length : 0;

        setStats([
          { icon: Trophy, value: tournamentCount * 8, label: "Matches Played", format: (n: number) => n >= 1000 ? `${Math.round(n / 1000)}K+` : `${Math.round(n)}+` },
          { icon: Calendar, value: tournamentCount, label: "Tournaments Hosted", format: (n: number) => n >= 1000 ? `${Math.round(n / 1000)}K+` : `${Math.round(n)}+` },
          { icon: Users, value: playerCount, label: "Players Registered", format: (n: number) => n >= 1000 ? `${Math.round(n / 1000)}K+` : `${Math.round(n)}+` },
          { icon: Globe2, value: 40, label: "Gaming Communities", format: (n: number) => `${Math.round(n)}+` },
          { icon: Gamepad2, value: gameCount, label: "Supported Games", format: (n: number) => `${Math.round(n)}` },
        ]);
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      }
    }

    load();
    return () => { stale = true; };
  }, []);

  return (
    <section className="relative py-14 border-y border-white/5">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(124,58,237,0.08),transparent_70%)]" />
      <div className="max-w-[1480px] mx-auto px-5 sm:px-6 lg:px-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 lg:gap-4">
          {stats.map((s, i) => (
            <StatTile key={s.label} stat={s} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StatTile({ stat, index }: { stat: StatItem; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (n) => stat.format(n));

  useEffect(() => {
    if (inView && stat.value > 0) {
      const controls = animate(mv, stat.value, {
        duration: 1.6,
        ease: [0.22, 1, 0.36, 1],
      });
      return controls.stop;
    }
  }, [inView, mv, stat.value]);

  const Icon = stat.icon;
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="group relative rounded-2xl overflow-hidden p-5 lg:p-6 bg-white/[0.02] ring-1 ring-inset ring-white/8 hover:ring-purple-400/30 transition-all"
    >
      {/* corner glow on hover */}
      <div className="absolute -top-12 -right-12 w-28 h-28 rounded-full bg-purple-500/0 group-hover:bg-purple-500/20 blur-2xl transition-colors duration-500" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      <div className="relative flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-500/15 ring-1 ring-inset ring-purple-400/30 flex items-center justify-center">
          <Icon className="w-5 h-5 text-purple-300" />
        </div>
        <div className="min-w-0">
          <motion.div className="text-2xl lg:text-[1.7rem] font-black text-white leading-none tracking-tight tabular-nums">
            {stat.value > 0 ? rounded : "—"}
          </motion.div>
          <div className="text-[11px] text-gray-400 font-medium mt-1.5">{stat.label}</div>
        </div>
      </div>
    </motion.div>
  );
}
