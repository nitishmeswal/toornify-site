import { motion } from "framer-motion";
import { Settings, UserPlus, Trophy } from "lucide-react";
import { useEffect, useState } from "react";

const STEPS = [
  {
    num: "01",
    title: "Create",
    desc: "Set up your tournament in a few clicks — format, prize pool, rules.",
    icon: Settings,
  },
  {
    num: "02",
    title: "Invite",
    desc: "Share your bracket and watch teams pour in from your community.",
    icon: UserPlus,
  },
  {
    num: "03",
    title: "Compete",
    desc: "Run matches live, track scores, and crown the champion.",
    icon: Trophy,
  },
];

export default function HowItWorks() {
  // single moving indicator cycles through steps
  const [active, setActive] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setActive((p) => (p + 1) % STEPS.length), 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <section id="how-it-works" className="relative py-28">
      <div className="max-w-6xl mx-auto px-6 lg:px-10">
        <p className="text-center text-[11px] font-semibold uppercase tracking-[0.3em] text-purple-300 mb-3">
          How Toornify Works
        </p>
        <h2 className="text-center text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-3 tracking-tight">
          Three steps to launch
        </h2>
        <p className="text-center text-gray-400 text-base mb-20">
          From idea to champion — in minutes.
        </p>

        <div className="relative">
          {/* connector rail */}
          <div className="hidden md:block absolute left-0 right-0 top-7 h-px">
            <div className="absolute inset-0 bg-white/8" />
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 via-fuchsia-500 to-purple-500"
              animate={{ width: `${((active + 1) / STEPS.length) * 100}%` }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              style={{ boxShadow: "0 0 10px rgba(168,85,247,0.7)" }}
            />
          </div>

          <div className="grid md:grid-cols-3 gap-10 md:gap-14">
            {STEPS.map((s, i) => (
              <Step key={s.num} step={s} index={i} isActive={active === i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Step({
  step,
  index,
  isActive,
}: {
  step: (typeof STEPS)[number];
  index: number;
  isActive: boolean;
}) {
  const Icon = step.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.12 }}
      className="relative flex flex-col items-center text-center md:items-start md:text-left"
    >
      {/* dot on the rail */}
      <div className="relative flex items-center justify-center w-14 h-14">
        {/* outer pulsing ring (only when active) */}
        {isActive && (
          <>
            <motion.span
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 1.8, opacity: 0 }}
              transition={{ duration: 1.6, repeat: Infinity }}
              className="absolute inset-0 rounded-full bg-purple-500/40"
            />
            <motion.span
              initial={{ scale: 1, opacity: 0.4 }}
              animate={{ scale: 2.2, opacity: 0 }}
              transition={{ duration: 1.8, repeat: Infinity, delay: 0.4 }}
              className="absolute inset-0 rounded-full bg-purple-400/30"
            />
          </>
        )}

        <motion.div
          animate={
            isActive
              ? { scale: 1.05, backgroundColor: "#a855f7" }
              : { scale: 1, backgroundColor: "#1a0f2e" }
          }
          transition={{ duration: 0.5 }}
          className="relative z-10 w-14 h-14 rounded-full flex items-center justify-center ring-1 ring-white/15"
          style={{
            boxShadow: isActive
              ? "0 0 28px rgba(168,85,247,0.6)"
              : "0 0 0 rgba(0,0,0,0)",
          }}
        >
          <Icon
            className={`w-6 h-6 transition-colors duration-500 ${
              isActive ? "text-white" : "text-purple-300"
            }`}
          />
        </motion.div>
      </div>

      {/* text */}
      <div className="mt-6">
        <div
          className={`text-[10px] uppercase tracking-[0.3em] font-bold mb-2 transition-colors duration-500 ${
            isActive ? "text-purple-300" : "text-gray-500"
          }`}
        >
          Step {step.num}
        </div>
        <h3 className="text-2xl font-black text-white mb-3 tracking-tight">
          {step.title}
        </h3>
        <p className="text-[14px] text-gray-400 leading-relaxed max-w-xs">
          {step.desc}
        </p>
      </div>
    </motion.div>
  );
}
