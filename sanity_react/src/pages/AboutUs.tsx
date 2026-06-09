import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Trophy, Users, Globe2, Gamepad2, Flame, Linkedin, Twitter,
  Heart, Lightbulb, Shield, Play, Sparkles,
} from "lucide-react";
import SEO from "@/components/SEO";

const STATS = [
  { v: "150K+", l: "Players",            icon: Users },
  { v: "12K+",  l: "Tournaments Hosted", icon: Trophy },
  { v: "40+",   l: "Games Supported",    icon: Gamepad2 },
  { v: "80+",   l: "Countries",          icon: Globe2 },
  { v: "2M+",   l: "Matches Played",     icon: Flame },
];

const VALUES = [
  {
    icon: Users,
    title: "Player First",
    desc: "Every feature we build starts with the player experience in mind.",
  },
  {
    icon: Shield,
    title: "Fair Play",
    desc: "We believe in a level playing field for everyone, always.",
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    desc: "We constantly push the boundaries of what's possible in esports.",
  },
  {
    icon: Heart,
    title: "Community",
    desc: "We grow together with our players, organizers and partners.",
  },
];

const TEAM = [
  { name: "Arjun Patel", role: "Co-Founder & CEO",       avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=arjun&backgroundColor=7c3aed" },
  { name: "Riya Shah",   role: "Co-Founder & CTO",       avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=riya&backgroundColor=a855f7" },
  { name: "Karan Singh", role: "Head of Esports",        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=karan&backgroundColor=c084fc" },
  { name: "Neha Verma",  role: "Head of Design",         avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=neha&backgroundColor=8b5cf6" },
  { name: "Aditya Rao",  role: "Head of Community",      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=aditya&backgroundColor=6d28d9" },
];

type TabKey = "mission" | "join";

export default function AboutUs() {
  const [tab, setTab] = useState<TabKey>("mission");

  return (
    <>
      <SEO />

      <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          {/* breadcrumb */}
          <div className="text-[11px] text-gray-500 mb-6">
            <Link to="/" className="hover:text-purple-300 transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-300">About Us</span>
          </div>

          {/* HERO */}
          <div className="grid lg:grid-cols-[1.05fr_1fr] gap-10 items-center mb-12">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-5xl sm:text-6xl lg:text-[4.2rem] font-black tracking-tight leading-[1.0] mb-5"
              >
                About{" "}
                <span className="bg-gradient-to-r from-[#a855f7] via-[#c084fc] to-[#7c3aed] bg-clip-text text-transparent">
                  Toornify
                </span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-gray-400 text-base max-w-md mb-7"
              >
                We're on a mission to empower the global esports community through technology and passion.
              </motion.p>

              {/* tabs */}
              <div className="inline-flex items-center gap-1 p-1 rounded-2xl bg-white/[0.04] ring-1 ring-inset ring-white/8">
                {(["mission", "join"] as TabKey[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`relative px-5 py-2 rounded-xl text-sm font-bold transition-colors ${
                      tab === t ? "text-white" : "text-gray-400 hover:text-gray-200"
                    }`}
                  >
                    {tab === t && (
                      <motion.span
                        layoutId="about-tab-pill"
                        className="absolute inset-0 rounded-xl bg-gradient-to-b from-[#7c3aed] to-[#5b21b6] shadow-md shadow-purple-900/40"
                        transition={{ type: "spring", stiffness: 350, damping: 28 }}
                      />
                    )}
                    <span className="relative">
                      {t === "mission" ? "Our Mission" : "Join Us"}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* trophy graphic */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 }}
              className="relative h-[280px] lg:h-[340px]"
            >
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_70%_at_50%_50%,rgba(168,85,247,0.30),transparent_70%)]" />
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

          {/* STATS BAR */}
          <div className="relative rounded-3xl bg-white/[0.03] ring-1 ring-inset ring-white/8 p-5 mb-14 overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {STATS.map((s, i) => (
                <motion.div
                  key={s.l}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-500/15 ring-1 ring-inset ring-purple-400/40 flex items-center justify-center flex-shrink-0">
                    <s.icon className="w-4 h-4 text-purple-300" />
                  </div>
                  <div>
                    <div className="text-xl font-black text-white tabular-nums leading-none">{s.v}</div>
                    <div className="text-[10.5px] text-gray-400 uppercase tracking-wider mt-1">{s.l}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* MISSION + VIDEO */}
          <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-6 lg:gap-8 mb-16">
            <div>
              <h2 className="text-2xl lg:text-3xl font-black text-white tracking-tight mb-4">Our Mission</h2>
              <p className="text-gray-400 text-[14px] leading-relaxed">
                To make esports tournaments accessible to everyone. Whether you're a casual gamer, a competitive player, or an organizer, Toornify provides the tools you need to create, manage and experience esports like never before.
              </p>
            </div>
            <VideoCard />
          </div>

          {/* VALUES */}
          <h2 className="text-2xl lg:text-3xl font-black text-white tracking-tight mb-6">Our Values</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
            {VALUES.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                whileHover={{ y: -4 }}
                className="group relative rounded-2xl overflow-hidden bg-white/[0.03] ring-1 ring-inset ring-white/8 hover:ring-purple-400/40 p-5 transition-all"
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-purple-500/0 group-hover:bg-purple-500/25 blur-3xl transition-colors duration-500" />
                <div className="relative w-11 h-11 rounded-xl bg-purple-500/15 ring-1 ring-inset ring-purple-400/40 flex items-center justify-center mb-4">
                  <v.icon className="w-5 h-5 text-purple-300" />
                </div>
                <h3 className="relative text-[15px] font-black text-white tracking-tight mb-1.5">{v.title}</h3>
                <p className="relative text-[12px] text-gray-400 leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* TEAM */}
          <h2 className="text-2xl lg:text-3xl font-black text-white tracking-tight mb-2">The Team</h2>
          <p className="text-gray-400 text-[14px] mb-7 max-w-xl">
            A passionate team of esports enthusiasts, developers, and dreamers building the future of competitive esports.
          </p>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-14">
            {TEAM.map((m, i) => (
              <TeamCard key={m.name} member={m} index={i} />
            ))}
          </div>

          {/* CTA */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#1a0f2e] via-[#140a26] to-[#0a0414] ring-1 ring-inset ring-white/10">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_15%_50%,rgba(168,85,247,0.25),transparent_60%)]" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            <div className="relative grid md:grid-cols-[1fr_auto] gap-5 items-center p-7 lg:p-9">
              <div className="flex items-center gap-5">
                <div className="relative flex-shrink-0">
                  <div className="absolute -inset-3 bg-purple-500/30 blur-2xl rounded-full" />
                  <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-[#7c3aed] to-[#a855f7] flex items-center justify-center ring-1 ring-white/15">
                    <Sparkles className="w-7 h-7 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl lg:text-2xl font-black text-white tracking-tight mb-1">
                    Want to join our journey?
                  </h3>
                  <p className="text-gray-400 text-sm">
                    We're always looking for passionate people to help build the future of esports.
                  </p>
                </div>
              </div>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#a855f7] text-white font-bold text-sm shadow-lg shadow-purple-900/50 hover:shadow-purple-700/70 hover:scale-[1.02] transition-all whitespace-nowrap"
              >
                Get in Touch
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

function VideoCard() {
  const [playing, setPlaying] = useState(false);
  return (
    <div className="relative aspect-[16/9] rounded-3xl overflow-hidden ring-1 ring-inset ring-white/10 group">
      <div
        className="absolute inset-0 bg-cover bg-center scale-105 group-hover:scale-110 transition-transform duration-[1500ms] ease-out"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1400&q=80')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-[#0a0414]/30 to-fuchsia-900/40" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

      {!playing ? (
        <button
          onClick={() => setPlaying(true)}
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 group/btn"
        >
          <div className="relative">
            <span className="absolute inset-0 rounded-full bg-purple-500/30 blur-xl" />
            <span className="absolute -inset-2 rounded-full bg-white/10 ring-1 ring-inset ring-white/20 backdrop-blur-md group-hover/btn:scale-110 transition-transform" />
            <span className="relative w-16 h-16 rounded-full bg-gradient-to-br from-[#a855f7] to-[#7c3aed] ring-2 ring-white/30 flex items-center justify-center shadow-2xl shadow-purple-900/60">
              <Play className="w-6 h-6 text-white fill-white ml-1" />
            </span>
          </div>
          <span className="text-[12px] font-bold text-white tracking-widest uppercase mt-2">Watch Our Story</span>
        </button>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-gray-300 text-sm">
          (Video would play here)
        </div>
      )}
    </div>
  );
}

function TeamCard({ member, index }: { member: (typeof TEAM)[number]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
      whileHover={{ y: -4 }}
      className="group relative rounded-2xl overflow-hidden bg-white/[0.03] ring-1 ring-inset ring-white/8 hover:ring-purple-400/40 p-5 text-center transition-all"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-purple-500/0 group-hover:bg-purple-500/25 blur-3xl transition-colors duration-500" />

      <div className="relative inline-block mb-3">
        <div className="absolute -inset-2 bg-gradient-to-br from-purple-500/30 to-fuchsia-500/30 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        <img
          src={member.avatar}
          alt={member.name}
          className="relative w-20 h-20 rounded-full ring-2 ring-purple-400/40 bg-purple-500/10"
        />
      </div>
      <h4 className="relative text-[13px] font-black text-white tracking-tight mb-0.5">{member.name}</h4>
      <p className="relative text-[11px] text-purple-300 font-bold mb-3">{member.role}</p>
      <div className="relative flex items-center justify-center gap-1.5">
        <a className="w-7 h-7 rounded-md bg-white/[0.05] hover:bg-white/[0.12] ring-1 ring-inset ring-white/10 hover:ring-purple-400/40 flex items-center justify-center transition-all" href="#" aria-label="LinkedIn">
          <Linkedin className="w-3 h-3 text-purple-300" />
        </a>
        <a className="w-7 h-7 rounded-md bg-white/[0.05] hover:bg-white/[0.12] ring-1 ring-inset ring-white/10 hover:ring-purple-400/40 flex items-center justify-center transition-all" href="#" aria-label="Twitter">
          <Twitter className="w-3 h-3 text-purple-300" />
        </a>
      </div>
    </motion.div>
  );
}
