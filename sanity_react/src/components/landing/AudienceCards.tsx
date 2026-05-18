import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight, Headphones, Trophy, Monitor } from "lucide-react";

const CARDS = [
  {
    role: "For Organizers",
    title: "Create, manage and run\nprofessional tournaments\nwith powerful tools.",
    cta: "Create Tournament",
    href: "/tournaments/create",
    icon: Trophy,
    image:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1400&q=80",
    glow: "from-purple-500/40 via-violet-500/20 to-transparent",
  },
  {
    role: "For Players",
    title: "Compete in tournaments,\nclimb leaderboards\nand earn rewards.",
    cta: "Join Tournaments",
    href: "/tournaments",
    icon: Headphones,
    image:
      "https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&w=1400&q=80",
    glow: "from-fuchsia-500/40 via-pink-500/20 to-transparent",
  },
  {
    role: "For Viewers",
    title: "Watch live matches,\nfollow your favorite teams\nand never miss a moment.",
    cta: "Watch Live",
    href: "/live",
    icon: Monitor,
    image:
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1400&q=80",
    glow: "from-blue-500/40 via-cyan-500/20 to-transparent",
  },
];

export default function AudienceCards() {
  return (
    <section className="relative py-20">
      <div className="max-w-[1480px] mx-auto px-5 sm:px-6 lg:px-10">
        <div className="grid md:grid-cols-3 gap-5">
          {CARDS.map((c, i) => (
            <AudienceCard key={c.role} card={c} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function AudienceCard({ card, index }: { card: (typeof CARDS)[number]; index: number }) {
  const Icon = card.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-15%" }}
      transition={{ duration: 0.7, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6 }}
      className="group relative rounded-3xl overflow-hidden ring-1 ring-inset ring-white/8 hover:ring-purple-400/40 transition-all cursor-pointer h-[360px]"
    >
      {/* background image */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-105 group-hover:scale-110 transition-transform duration-[1200ms] ease-out"
        style={{ backgroundImage: `url(${card.image})` }}
      />
      {/* dark + color wash */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0414]/30 via-[#0a0414]/60 to-[#0a0414]/95" />
      <div className={`absolute inset-0 bg-gradient-to-br ${card.glow} opacity-50 mix-blend-screen group-hover:opacity-80 transition-opacity duration-500`} />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

      {/* corner icon */}
      <div className="absolute top-5 left-5 w-11 h-11 rounded-xl bg-white/8 backdrop-blur-md ring-1 ring-inset ring-white/15 flex items-center justify-center">
        <Icon className="w-5 h-5 text-white" />
      </div>

      {/* CTA arrow corner */}
      <div className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/8 backdrop-blur-md ring-1 ring-inset ring-white/15 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <ArrowUpRight className="w-4 h-4 text-white" />
      </div>

      {/* text content (bottom) */}
      <div className="absolute inset-x-0 bottom-0 p-6">
        <p className="text-[11px] uppercase tracking-[0.25em] text-purple-200 font-bold mb-3">
          {card.role}
        </p>
        <h3 className="text-[1.3rem] lg:text-[1.4rem] font-black text-white leading-tight tracking-tight mb-5 whitespace-pre-line">
          {card.title}
        </h3>
        <Link
          to={card.href}
          className="inline-flex items-center gap-1.5 text-sm font-bold text-white hover:text-purple-200 transition-colors"
        >
          {card.cta}
          <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>
      </div>

      {/* shimmer line on hover */}
      <div className="absolute -bottom-px inset-x-0 h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.div>
  );
}
