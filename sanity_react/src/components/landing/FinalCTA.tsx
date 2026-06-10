import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Trophy, ArrowRight, Zap, Sparkles } from "lucide-react";

export default function FinalCTA() {
  return (
    <section className="relative py-24">
      <div className="max-w-[1480px] mx-auto px-5 sm:px-6 lg:px-10">
        <div className="relative rounded-[28px] overflow-hidden">
          {/* layered glass */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a0f2e] via-[#140a26] to-[#0a0414]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_70%_at_20%_50%,rgba(168,85,247,0.25),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_90%_50%,rgba(236,72,153,0.15),transparent_60%)]" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-[28px] pointer-events-none" />

          {/* floating sparkles */}
          {[...Array(14)].map((_, i) => (
            <motion.span
              key={i}
              className="absolute w-1 h-1 rounded-full bg-purple-300"
              style={{
                left: `${(i * 37) % 100}%`,
                top: `${(i * 53) % 100}%`,
                boxShadow: "0 0 8px rgba(168,85,247,0.8)",
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.2, 1, 0.2],
              }}
              transition={{
                duration: 3 + (i % 4),
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
            />
          ))}

          <div className="relative grid md:grid-cols-[auto_1fr_auto] gap-6 sm:gap-8 items-center p-6 sm:p-10 lg:p-14">
            {/* trophy graphic */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85, rotate: -8 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex-shrink-0"
            >
              <div className="absolute -inset-6 bg-gradient-to-br from-amber-400/40 via-orange-500/30 to-purple-500/30 blur-3xl rounded-full" />
              <motion.div
                animate={{ y: [0, -6, 0], rotate: [-2, 2, -2] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="relative w-24 h-24 lg:w-28 lg:h-28 rounded-3xl bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 flex items-center justify-center ring-2 ring-white/20 shadow-2xl shadow-amber-900/50"
              >
                <Trophy className="w-12 h-12 lg:w-14 lg:h-14 text-white drop-shadow-[0_0_18px_rgba(251,191,36,0.85)]" />
                <Sparkles className="absolute -top-2 -right-2 w-5 h-5 text-amber-200 animate-pulse" />
              </motion.div>
            </motion.div>

            {/* copy */}
            <div className="text-center md:text-left">
              <p className="text-[11px] uppercase tracking-[0.3em] font-bold text-purple-300 mb-2">
                Join the Movement
              </p>
              <h2 className="text-3xl lg:text-[2.4rem] font-black tracking-tight text-white leading-tight mb-2">
                Empowering 1M+ youth participants
                <br className="hidden lg:block" />{" "}
                <span className="bg-gradient-to-r from-[#a855f7] via-[#c084fc] to-[#ec4899] bg-clip-text text-transparent">
                  across Asia's esports ecosystem.
                </span>
              </h2>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row md:flex-col gap-3 flex-shrink-0">
              <Link
                to="/tournaments/create"
                className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#a855f7] text-white font-bold text-sm shadow-lg shadow-purple-900/50 hover:shadow-purple-700/70 hover:scale-[1.02] transition-all whitespace-nowrap"
              >
                Create Tournament
                <Zap className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              </Link>
              <Link
                to="/tournaments"
                className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-white/15 bg-white/5 backdrop-blur text-white font-bold text-sm hover:bg-white/10 hover:border-white/30 transition-all whitespace-nowrap"
              >
                Explore Tournaments
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
