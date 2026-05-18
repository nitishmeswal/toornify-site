import { motion } from "framer-motion";
import { GitBranch, Zap, Trophy, Users, LineChart } from "lucide-react";

const FEATURES = [
  {
    icon: GitBranch,
    title: "Real-time Brackets",
    desc: "Live updates, instant bracket sync and dynamic match resets.",
  },
  {
    icon: Zap,
    title: "Instant Setup",
    desc: "Create tournaments in seconds, not hours.",
  },
  {
    icon: Trophy,
    title: "Prize Pools",
    desc: "Built-in payments, secure payouts and multi-currency.",
  },
  {
    icon: Users,
    title: "Team Management",
    desc: "Roster tools and communication with your team's nucleus.",
  },
  {
    icon: LineChart,
    title: "Advanced Analytics",
    desc: "Deep insights and stats to grow your community.",
  },
];

export default function Features() {
  return (
    <section className="relative py-24">
      <div className="max-w-[1480px] mx-auto px-5 sm:px-6 lg:px-10">
        <h2 className="text-center text-3xl sm:text-4xl lg:text-[2.6rem] font-black tracking-tight text-white mb-3">
          Everything you need to run{" "}
          <span className="bg-gradient-to-r from-[#a855f7] via-[#c084fc] to-[#ec4899] bg-clip-text text-transparent">
            epic tournaments
          </span>
        </h2>
        <p className="text-center text-gray-400 text-base mb-14">
          A complete toolkit, finely tuned for esports.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ y: -4 }}
              className="group relative rounded-2xl overflow-hidden bg-white/[0.03] ring-1 ring-inset ring-white/8 hover:ring-purple-400/40 p-5 transition-all"
            >
              <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-purple-500/0 group-hover:bg-purple-500/25 blur-3xl transition-colors duration-500" />
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

              <div className="relative w-11 h-11 rounded-xl bg-purple-500/15 ring-1 ring-inset ring-purple-400/40 flex items-center justify-center mb-5 group-hover:bg-purple-500/25 transition-colors">
                <f.icon className="w-5 h-5 text-purple-300" />
              </div>
              <h3 className="relative text-[14.5px] font-bold text-white mb-2 tracking-tight">
                {f.title}
              </h3>
              <p className="relative text-[12px] text-gray-400 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
