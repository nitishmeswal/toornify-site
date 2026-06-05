import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Search, ChevronDown, HelpCircle, Sparkles, Headphones,
  Rocket, Trophy, Wallet, Crown, Users, Settings,
} from "lucide-react";
import SEO from "@/components/SEO";

interface QA { q: string; a: string; }
interface Cat { key: string; label: string; icon: any; items: QA[]; }

const CATEGORIES: Cat[] = [
  {
    key: "getting-started",
    label: "Getting Started",
    icon: Rocket,
    items: [
      { q: "What is Toornify?", a: "Toornify is an all-in-one esports tournament platform that helps organizers create, manage and run professional tournaments while giving players and fans a great experience." },
      { q: "How do I create an account?", a: "Click 'Get Started' in the top right, sign up with your email or social account, complete a quick onboarding flow, and you're ready to go." },
      { q: "Is Toornify free to use?", a: "Yes — our Free plan lets you run small tournaments with up to 64 participants. Paid plans unlock advanced features like multi-stage brackets, payouts, and analytics." },
      { q: "Do I need any competitive experience to join tournaments?", a: "No. Toornify hosts tournaments for all skill levels, from casual community events to professional leagues." },
      { q: "What games are supported on Toornify?", a: "We support 18+ titles including Valorant, BGMI, Call of Duty, Free Fire, CS2, Dota 2, League of Legends, Apex Legends, and more." },
      { q: "Can I join tournaments as a team?", a: "Absolutely. Create or join a team, manage your roster, and register together for any team-based tournament." },
    ],
  },
  {
    key: "tournaments",
    label: "Tournaments",
    icon: Trophy,
    items: [
      { q: "How do I join a tournament?", a: "Browse the Tournaments page, pick one that suits your skill level, and click Register. Some tournaments may require a team or entry fee." },
      { q: "How are tournaments structured?", a: "Most tournaments use single-elimination, double-elimination, or multi-stage brackets. You'll see the format on every tournament page." },
      { q: "Can I create a private tournament?", a: "Yes. On Creator and Pro plans you can create invite-only tournaments with custom branding." },
      { q: "What happens if a match is not reported?", a: "Our automated system flags disputes and notifies organizers. You can submit screenshots or VODs as proof." },
      { q: "How are winners determined?", a: "Winners are determined by match outcomes reported and verified through our scoring system, plus organizer review when needed." },
      { q: "Can I cancel or edit my tournament?", a: "Organizers can edit tournament details before registration closes. Cancellations follow our refund policy if entry fees were collected." },
    ],
  },
  {
    key: "payments",
    label: "Payments & Prizes",
    icon: Wallet,
    items: [
      { q: "How does the prize pool work?", a: "Prize pools are funded by entry fees, sponsorships, or organizer contributions. The pool is held in escrow and distributed automatically when the tournament concludes." },
      { q: "What payment methods do you support?", a: "Major credit cards, UPI, and PayPal. Enterprise customers can also wire-transfer." },
      { q: "When do winners receive their prizes?", a: "Within 24-72 hours of tournament completion, after final results are verified." },
      { q: "Are there any fees?", a: "Toornify takes a small platform fee on prize payouts and entry fee collection. Full breakdown is on our Pricing page." },
    ],
  },
  {
    key: "organizers",
    label: "Organizers",
    icon: Crown,
    items: [
      { q: "What tools do organizers get?", a: "Bracket builder, automated scheduling, payout management, analytics, custom branding, and a public tournament page." },
      { q: "Can I monetize my tournaments?", a: "Yes — collect entry fees, attract sponsorships, and earn through our creator program. Pro plans unlock revenue tools." },
    ],
  },
  {
    key: "players",
    label: "Players",
    icon: Users,
    items: [
      { q: "How do I track my stats?", a: "Your profile shows lifetime stats, recent matches, win rate, and earnings across all tournaments you've joined." },
      { q: "Can I get scouted?", a: "Top performers are featured on leaderboards and visible to organizers and pro teams looking to recruit." },
      { q: "Can I have multiple teams?", a: "Yes. You can be a member of multiple teams as long as they're for different games or tournaments." },
      { q: "How do I report a player?", a: "From any match or profile, click the report icon and submit details. Our moderation team reviews within 24 hours." },
    ],
  },
  {
    key: "technical",
    label: "Technical",
    icon: Settings,
    items: [
      { q: "Do you have an API?", a: "Yes. Creator plan and above include API access. Full docs are at /docs/api." },
      { q: "Which browsers are supported?", a: "Latest versions of Chrome, Firefox, Edge, and Safari. We also have dedicated mobile apps for iOS and Android." },
    ],
  },
];

const ALL_KEY = "all";

export default function FAQ() {
  const [active, setActive] = useState<string>(ALL_KEY);
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState<string | null>("getting-started:0");

  const totals = useMemo(() => {
    const map: Record<string, number> = { [ALL_KEY]: 0 };
    CATEGORIES.forEach((c) => {
      map[c.key] = c.items.length;
      map[ALL_KEY] += c.items.length;
    });
    return map;
  }, []);

  const visibleCats = useMemo(() => {
    const cats = active === ALL_KEY ? CATEGORIES : CATEGORIES.filter((c) => c.key === active);
    if (!search.trim()) return cats;
    const s = search.toLowerCase();
    return cats
      .map((c) => ({ ...c, items: c.items.filter((i) => i.q.toLowerCase().includes(s) || i.a.toLowerCase().includes(s)) }))
      .filter((c) => c.items.length > 0);
  }, [active, search]);

  return (
    <>
      <SEO />

      <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          {/* breadcrumb */}
          <div className="text-[11px] text-gray-500 mb-6">
            <Link to="/" className="hover:text-purple-300 transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-300">FAQ</span>
          </div>

          {/* HERO */}
          <div className="grid lg:grid-cols-[1.1fr_1fr] gap-10 items-center mb-12">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 backdrop-blur-sm mb-5"
              >
                <Sparkles className="w-3 h-3 text-purple-300" />
                <span className="text-xs font-bold uppercase tracking-[0.22em] text-purple-200">FAQ</span>
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-[3.4rem] font-black tracking-tight leading-[1.05] mb-4"
              >
                Got questions?
                <br />
                We've got{" "}
                <span className="bg-gradient-to-r from-[#a855f7] via-[#c084fc] to-[#7c3aed] bg-clip-text text-transparent">
                  answers.
                </span>
              </motion.h1>
              <p className="text-gray-400 text-base max-w-md">
                Everything you need to know about Toornify tournaments, features, and more.
              </p>
            </div>

            {/* graphic */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 }}
              className="relative h-[280px] lg:h-[320px] hidden md:block"
            >
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_70%_at_50%_50%,rgba(168,85,247,0.30),transparent_70%)]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                  className="relative"
                >
                  <div className="absolute -inset-12 bg-purple-500/30 blur-3xl rounded-full" />
                  <div className="relative w-44 h-44 lg:w-56 lg:h-56 rounded-[40px] bg-gradient-to-br from-[#7c3aed] via-[#a855f7] to-[#c084fc] flex items-center justify-center ring-2 ring-white/15 shadow-2xl shadow-purple-900/60">
                    <span className="text-[140px] font-black text-white drop-shadow-[0_0_30px_rgba(168,85,247,0.85)] leading-none -mt-4">?</span>
                  </div>
                </motion.div>
              </div>
              {[...Array(8)].map((_, i) => (
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
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-10 left-6 w-10 h-10 rounded-xl bg-white/[0.05] ring-1 ring-inset ring-purple-400/30 backdrop-blur-md flex items-center justify-center"
              >
                <HelpCircle className="w-4 h-4 text-purple-200" />
              </motion.div>
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute bottom-12 right-6 w-10 h-10 rounded-xl bg-white/[0.05] ring-1 ring-inset ring-purple-400/30 backdrop-blur-md flex items-center justify-center"
              >
                <Sparkles className="w-4 h-4 text-purple-200" />
              </motion.div>
            </motion.div>
          </div>

          {/* MAIN: sidebar + content */}
          <div className="grid lg:grid-cols-[260px_1fr] gap-6 lg:gap-8">
            {/* sidebar */}
            <aside className="space-y-5">
              <CategoryList
                active={active}
                onSelect={setActive}
                totals={totals}
              />

              {/* still have questions card */}
              <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#1a0f2e] to-[#0a0414] ring-1 ring-inset ring-white/8 p-5">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                <div className="absolute -right-6 -bottom-8 w-32 h-32 bg-purple-500/30 blur-3xl rounded-full" />
                <h4 className="relative text-[13px] font-black text-white mb-1.5 tracking-tight">
                  Still have questions?
                </h4>
                <p className="relative text-[11px] text-gray-400 leading-relaxed mb-4">
                  Can't find the answer you're looking for? Our support team is here to help.
                </p>
                <Link
                  to="/contact"
                  className="relative inline-flex items-center justify-center gap-1.5 w-full px-3 py-2 rounded-lg bg-gradient-to-r from-[#7c3aed] to-[#a855f7] text-white text-[11.5px] font-bold shadow shadow-purple-900/50 hover:shadow-purple-700/70 hover:scale-[1.02] transition-all"
                >
                  <Headphones className="w-3.5 h-3.5" />
                  Contact Support
                </Link>
              </div>
            </aside>

            {/* content */}
            <div>
              {/* search */}
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search for answers..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white/[0.03] ring-1 ring-inset ring-white/8 focus:ring-purple-400/40 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-gray-500 outline-none transition-colors"
                />
              </div>

              {/* sections */}
              {visibleCats.length === 0 ? (
                <div className="rounded-2xl bg-white/[0.03] ring-1 ring-inset ring-white/8 p-10 text-center">
                  <p className="text-gray-400 text-sm">No questions matched your search.</p>
                </div>
              ) : (
                <div className="space-y-7">
                  {visibleCats.map((cat) => (
                    <div key={cat.key}>
                      <h3 className="text-[15px] font-black text-white mb-3 tracking-tight flex items-center gap-2">
                        <cat.icon className="w-4 h-4 text-purple-300" />
                        {cat.label}
                      </h3>
                      <div className="space-y-2">
                        {cat.items.map((item, i) => {
                          const id = `${cat.key}:${i}`;
                          return (
                            <FAQItem
                              key={id}
                              id={id}
                              q={item.q}
                              a={item.a}
                              open={openId === id}
                              onToggle={() => setOpenId(openId === id ? null : id)}
                            />
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

function CategoryList({
  active, onSelect, totals,
}: {
  active: string;
  onSelect: (k: string) => void;
  totals: Record<string, number>;
}) {
  const items = [
    { key: ALL_KEY, label: "All Questions", icon: HelpCircle },
    ...CATEGORIES.map((c) => ({ key: c.key, label: c.label, icon: c.icon })),
  ];
  return (
    <div className="relative rounded-2xl bg-white/[0.03] ring-1 ring-inset ring-white/8 p-2 overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <div className="space-y-0.5">
        {items.map((it) => {
          const isActive = active === it.key;
          return (
            <button
              key={it.key}
              onClick={() => onSelect(it.key)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[12.5px] font-bold transition-colors ${
                isActive
                  ? "bg-purple-500/15 text-white ring-1 ring-inset ring-purple-400/30"
                  : "text-gray-400 hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              <it.icon className={`w-4 h-4 ${isActive ? "text-purple-300" : "text-gray-500"}`} />
              <span className="flex-1 text-left">{it.label}</span>
              <span className={`text-[10.5px] tabular-nums ${isActive ? "text-purple-300" : "text-gray-600"}`}>
                {totals[it.key]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FAQItem({
  id, q, a, open, onToggle,
}: {
  id: string; q: string; a: string;
  open: boolean; onToggle: () => void;
}) {
  return (
    <div
      className={`relative rounded-2xl ring-1 ring-inset overflow-hidden transition-colors ${
        open
          ? "bg-purple-500/[0.06] ring-purple-400/30"
          : "bg-white/[0.025] ring-white/8 hover:ring-white/15"
      }`}
    >
      <button
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={`a-${id}`}
        className="w-full flex items-center justify-between gap-4 px-4 py-3.5 text-left"
      >
        <span className="text-[13px] font-bold text-white">{q}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${open ? "rotate-180 text-purple-300" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={`a-${id}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 text-[12.5px] text-gray-300 leading-relaxed border-t border-white/8 pt-3">
              {a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
