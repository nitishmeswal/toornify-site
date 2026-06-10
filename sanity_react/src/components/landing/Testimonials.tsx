import { motion } from "framer-motion";

const testimonials = [
  {
    quote: "Toornify made organizing our 1000+ player tournament so easy. The best platform out there!",
    name: "Mortal",
    role: "Content Creator",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=mortal",
  },
  {
    quote: "Super smooth experience for both organizers and players. Brackets update in real-time.",
    name: "Scout",
    role: "Team XO",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=scout",
  },
  {
    quote: "Payments, live scores, everything just works. Highly recommended.",
    name: "Snax",
    role: "Global Esports",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=snax",
  },
];

export default function Testimonials() {
  return (
    <section className="relative py-20">
      <div className="max-w-[1480px] mx-auto px-5 sm:px-6 lg:px-10">
        <p className="text-center text-[11px] font-semibold uppercase tracking-[0.3em] text-purple-300 mb-3">
          Loved by Players & Organizers
        </p>
        <h2 className="text-center text-3xl sm:text-4xl font-bold text-white mb-14">What our community says</h2>

        <div className="grid md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-6 hover:border-purple-500/30 transition-colors"
            >
              <p className="text-sm text-gray-300 leading-relaxed mb-6">"{t.quote}"</p>
              <div className="flex items-center gap-3">
                <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full bg-purple-500/20 border border-purple-500/30" />
                <div>
                  <div className="text-sm font-bold text-white">{t.name}</div>
                  <div className="text-xs text-gray-500">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Carousel dots */}
        <div className="flex items-center justify-center gap-1.5 mt-8">
          {[0, 1, 2].map((i) => (
            <span key={i} className={`h-1.5 rounded-full transition-all ${i === 1 ? "w-6 bg-purple-400" : "w-1.5 bg-white/20"}`} />
          ))}
        </div>
      </div>
    </section>
  );
}
