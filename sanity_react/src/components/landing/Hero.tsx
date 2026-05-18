import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Zap, ArrowRight } from "lucide-react";
import LiveTournamentCard from "./tournament/LiveTournamentCard";
// 3D objects (BackgroundParticles + controller ModelViewer) removed per
// user request — they were the source of the leftover floating cubes /
// triangles on the page background.

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-24 sm:pt-28 pb-10 sm:pb-16 overflow-hidden">
      {/* (opaque base layers removed so the global video backdrop shows through)
          Soft translucent purple wash kept for atmosphere. */}
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_120%_80%_at_80%_30%,rgba(76,29,149,0.30),transparent_60%)]" />
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_80%_60%_at_20%_70%,rgba(30,27,75,0.35),transparent_70%)]" />

      {/* Center radial glow */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_30%,rgba(124,58,237,0.15),transparent_70%)]" />

      <div className="max-w-[1480px] w-full mx-auto px-5 sm:px-6 lg:px-8 grid lg:grid-cols-[0.85fr_1.15fr] gap-8 lg:gap-10 items-center">
        {/* LEFT: copy (shifted left, +10% bigger) */}
        <div className="lg:pl-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 backdrop-blur-sm mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-widest text-purple-200">
              #1 All-in-One Esports Tournament Platform
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-[2.5rem] sm:text-[3.4rem] lg:text-[5rem] font-black leading-[1.02] tracking-tight"
          >
            <span className="block text-white">Create.</span>
            <span className="block text-white">Compete.</span>
            <span className="block bg-gradient-to-r from-[#a855f7] via-[#c084fc] to-[#7c3aed] bg-clip-text text-transparent">
              Conquer.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-5 sm:mt-7 text-sm sm:text-[1.1rem] text-gray-400 max-w-lg"
          >
            The fastest and easiest way to create, manage, and play esports tournaments.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-stretch sm:items-start gap-3"
          >
            <Link
              to="/tournaments"
              className="group inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#a855f7] text-white text-sm sm:text-base font-semibold shadow-lg shadow-purple-500/40 hover:shadow-purple-500/60 hover:scale-[1.02] transition-all"
            >
              Create Tournament
              <Zap className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            </Link>
            <Link
              to="/tournaments"
              className="group inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 rounded-xl border border-white/15 bg-white/5 backdrop-blur text-white text-sm sm:text-base font-semibold hover:bg-white/10 hover:border-white/30 transition-all"
            >
              Explore Tournaments
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {/* Avatar stack */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-8 flex items-center gap-3"
          >
            <div className="flex -space-x-2.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-9 h-9 rounded-full border-2 border-[#0a0612] bg-gradient-to-br from-purple-400 to-pink-500"
                  style={{
                    backgroundImage: `url(https://api.dicebear.com/7.x/avataaars/svg?seed=user${i})`,
                    backgroundSize: "cover",
                  }}
                />
              ))}
            </div>
            <p className="text-sm text-gray-400">
              Join <span className="text-white font-semibold">150K+</span> gamers & organizers worldwide
            </p>
          </motion.div>
        </div>

        {/* RIGHT: live tournament card. overflow-hidden so the card's outer
            blur halo cannot push the page wider than the viewport on mobile
            (which was causing the horizontal scroll bug). */}
        <div className="relative h-auto md:h-[680px] lg:h-[880px] overflow-hidden md:overflow-visible">
          <LiveTournamentCard />
        </div>
      </div>
    </section>
  );
}
