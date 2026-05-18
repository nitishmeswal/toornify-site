import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Search, ArrowRight, ChevronLeft, ChevronRight, BookOpen, Calendar } from "lucide-react";
import SEO from "@/components/SEO";

interface Article {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  image: string;
  featured?: boolean;
}

const CATEGORIES = [
  { key: "all",       label: "All Articles",      count: 32 },
  { key: "platform",  label: "Platform Updates",  count: 8 },
  { key: "esports",   label: "Esports News",      count: 10 },
  { key: "organizer", label: "Organizer Tips",    count: 7 },
  { key: "player",    label: "Player Guide",      count: 5 },
  { key: "community", label: "Community Stories", count: 2 },
];

const ARTICLES: Article[] = [
  {
    id: 1,
    title: "The Future of Esports Tournaments: Trends to Watch in 2025",
    excerpt: "Explore the key trends shaping the future of esports gaming and how Toornify is leading the way.",
    date: "May 14, 2025",
    category: "Featured",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1400&q=80",
    featured: true,
  },
  {
    id: 2,
    title: "Introducing Advanced Brackets",
    excerpt: "Smarter seeding, automatic match progression, and real-time updates.",
    date: "May 12, 2025",
    category: "Platform Updates",
    image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 3,
    title: "How to Organize a Successful Online Tournament",
    excerpt: "A step-by-step guide for first-time tournament organizers.",
    date: "May 10, 2025",
    category: "Organizer Tips",
    image: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 4,
    title: "Valorant Champions Tour 2025 Schedule Announced",
    excerpt: "All the details on teams, locations and key match dates.",
    date: "May 8, 2025",
    category: "Esports News",
    image: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 5,
    title: "Improve Your Game Sense",
    excerpt: "Tips and drills to help you make smarter decisions in-game.",
    date: "May 6, 2025",
    category: "Player Guide",
    image: "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 6,
    title: "From Community to Champions: Team Insane's Journey",
    excerpt: "How a group of friends became an esports powerhouse.",
    date: "May 5, 2025",
    category: "Community Stories",
    image: "https://images.unsplash.com/photo-1551103782-8ab07afd45c1?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 7,
    title: "New Payout System Now Live",
    excerpt: "Faster withdrawals, more payment options, and better security.",
    date: "May 4, 2025",
    category: "Platform Updates",
    image: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=900&q=80",
  },
];

const PAGE_SIZE = 6;

export function Blogs() {
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState("all");
  const [page, setPage] = useState(1);

  const featured = ARTICLES.find((a) => a.featured);
  const others = ARTICLES.filter((a) => !a.featured);

  const filtered = useMemo(() => {
    let arr = others;
    if (activeCat !== "all") {
      const label = CATEGORIES.find((c) => c.key === activeCat)?.label;
      arr = arr.filter((a) => a.category === label);
    }
    if (search.trim()) {
      const s = search.toLowerCase();
      arr = arr.filter((a) => a.title.toLowerCase().includes(s) || a.excerpt.toLowerCase().includes(s));
    }
    return arr;
  }, [activeCat, search, others]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
      <SEO />

      <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-[11px] text-gray-500 mb-6">
            <Link to="/" className="hover:text-purple-300 transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-300">Blog</span>
          </div>

          {/* HERO row: title + featured */}
          <div className="grid lg:grid-cols-[1fr_1.2fr] gap-8 mb-12">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-4xl sm:text-5xl lg:text-[3.2rem] font-black tracking-tight leading-[1.05] mb-4"
              >
                Latest news
                <br />
                from the{" "}
                <span className="bg-gradient-to-r from-[#a855f7] via-[#c084fc] to-[#7c3aed] bg-clip-text text-transparent">
                  esports world
                </span>
              </motion.h1>
              <p className="text-gray-400 text-base max-w-md mb-6">
                Tips, updates and stories from the Toornify community and the world of competitive gaming.
              </p>

              {/* search */}
              <div className="relative max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Search articles..."
                  className="w-full bg-white/[0.03] ring-1 ring-inset ring-white/8 focus:ring-purple-400/40 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-gray-500 outline-none transition-colors"
                />
              </div>
            </div>

            {featured && <FeaturedArticle a={featured} />}
          </div>

          <div className="grid lg:grid-cols-[240px_1fr] gap-6 lg:gap-8">
            {/* sidebar */}
            <aside>
              <div className="sticky top-28">
                <h4 className="text-[11px] uppercase tracking-[0.22em] font-bold text-gray-500 mb-3 px-2">
                  Categories
                </h4>
                <div className="space-y-0.5">
                  {CATEGORIES.map((c) => {
                    const isActive = activeCat === c.key;
                    return (
                      <button
                        key={c.key}
                        onClick={() => { setActiveCat(c.key); setPage(1); }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[12.5px] font-bold transition-colors ${
                          isActive
                            ? "bg-purple-500/15 text-white ring-1 ring-inset ring-purple-400/30"
                            : "text-gray-400 hover:bg-white/[0.04] hover:text-white"
                        }`}
                      >
                        <BookOpen className={`w-4 h-4 ${isActive ? "text-purple-300" : "text-gray-500"}`} />
                        <span className="flex-1 text-left">{c.label}</span>
                        <span className={`text-[10.5px] tabular-nums ${isActive ? "text-purple-300" : "text-gray-600"}`}>
                          {c.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </aside>

            {/* grid */}
            <div>
              {paged.length === 0 ? (
                <div className="rounded-2xl bg-white/[0.03] ring-1 ring-inset ring-white/8 p-10 text-center">
                  <p className="text-gray-400 text-sm">No articles found.</p>
                </div>
              ) : (
                <>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {paged.map((a, i) => <ArticleCard key={a.id} a={a} index={i} />)}
                  </div>
                  {filtered.length > PAGE_SIZE && (
                    <Pagination page={page} totalPages={totalPages} onChange={setPage} />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

function FeaturedArticle({ a }: { a: Article }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="group relative rounded-3xl overflow-hidden ring-1 ring-inset ring-white/10 hover:ring-purple-400/40 cursor-pointer transition-all min-h-[280px]"
    >
      <div className="absolute inset-0 bg-cover bg-center scale-105 group-hover:scale-110 transition-transform duration-[1200ms] ease-out"
        style={{ backgroundImage: `url(${a.image})` }} />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0414] via-[#0a0414]/40 to-transparent" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

      <span className="absolute top-4 left-4 px-2.5 py-1 rounded-md bg-purple-500/90 text-[10px] font-black text-white tracking-widest uppercase ring-1 ring-white/15">
        Featured
      </span>

      <div className="absolute inset-x-0 bottom-0 p-6">
        <p className="text-[11px] text-gray-300 mb-2 flex items-center gap-1.5">
          <Calendar className="w-3 h-3" /> {a.date}
        </p>
        <h3 className="text-xl lg:text-2xl font-black text-white tracking-tight leading-tight mb-2.5">
          {a.title}
        </h3>
        <p className="text-[12.5px] text-gray-300 leading-relaxed mb-3 line-clamp-2 max-w-md">{a.excerpt}</p>
        <span className="inline-flex items-center gap-1 text-[12px] font-bold text-purple-300 group-hover:text-purple-200 transition-colors">
          Read More <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </span>
      </div>
    </motion.div>
  );
}

function ArticleCard({ a, index }: { a: Article; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
      whileHover={{ y: -4 }}
      className="group relative rounded-2xl overflow-hidden bg-[#0c0618] ring-1 ring-inset ring-white/8 hover:ring-purple-400/40 transition-all cursor-pointer flex flex-col"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center scale-105 group-hover:scale-110 transition-transform duration-[1200ms] ease-out"
          style={{ backgroundImage: `url(${a.image})` }} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0618] via-transparent to-transparent" />
        <span className="absolute top-3 left-3 px-2 py-0.5 rounded bg-purple-500/90 text-[9px] font-black text-white tracking-widest uppercase ring-1 ring-white/15">
          {a.category}
        </span>
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <p className="text-[10.5px] text-gray-500 mb-1.5 flex items-center gap-1.5">
          <Calendar className="w-3 h-3" /> {a.date}
        </p>
        <h3 className="text-[14px] font-black text-white tracking-tight leading-snug mb-2 group-hover:text-purple-200 transition-colors">
          {a.title}
        </h3>
        <p className="text-[11.5px] text-gray-400 leading-relaxed mb-3 line-clamp-2 flex-1">{a.excerpt}</p>
        <span className="inline-flex items-center gap-1 text-[11.5px] font-bold text-purple-300 group-hover:text-purple-200 transition-colors">
          Read More <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
        </span>
      </div>
    </motion.article>
  );
}

function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void }) {
  return (
    <div className="mt-8 flex items-center justify-center gap-1">
      <PageBtn disabled={page === 1} onClick={() => onChange(Math.max(1, page - 1))}><ChevronLeft className="w-3.5 h-3.5" /></PageBtn>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <PageBtn key={p} active={p === page} onClick={() => onChange(p)}>{p}</PageBtn>
      ))}
      <PageBtn disabled={page === totalPages} onClick={() => onChange(Math.min(totalPages, page + 1))}><ChevronRight className="w-3.5 h-3.5" /></PageBtn>
    </div>
  );
}

function PageBtn({ children, onClick, disabled, active }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean; active?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`min-w-[34px] h-[34px] px-2 rounded-lg text-[12px] font-bold flex items-center justify-center transition-all ${
        active
          ? "bg-gradient-to-b from-[#7c3aed] to-[#5b21b6] text-white ring-1 ring-inset ring-purple-300/30 shadow-md shadow-purple-900/40"
          : "bg-white/[0.04] hover:bg-white/[0.08] ring-1 ring-inset ring-white/8 text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed"
      }`}
    >
      {children}
    </button>
  );
}
