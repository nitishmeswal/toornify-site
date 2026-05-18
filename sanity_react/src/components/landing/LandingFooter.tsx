import { Link } from "react-router-dom";
import { Twitter, Instagram, Youtube, Linkedin, ArrowRight } from "lucide-react";

const cols = [
  {
    title: "Product",
    links: [
      { label: "Tournaments", href: "/tournaments" },
      { label: "Features", href: "/#features" },
      { label: "Pricing", href: "/#pricing" },
      { label: "Games", href: "/games" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Blog", href: "/blogs" },
      { label: "Help Center", href: "/help" },
      { label: "Guides", href: "/guides" },
      { label: "API Docs", href: "/docs" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about-us" },
      { label: "Careers", href: "/careers" },
      { label: "Partner Program", href: "/partners" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of Service", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Refund Policy", href: "/refund" },
    ],
  },
];

export default function LandingFooter() {
  return (
    <footer className="relative border-t border-white/5 pt-8 sm:pt-16 pb-6 sm:pb-8">
      <div className="max-w-[1480px] mx-auto px-5 sm:px-6 lg:px-10">
        {/* MOBILE: ultra-compact stack — brand row + 2-col link grid.
            DESKTOP (sm+): full 6-col layout w/ newsletter. */}
        <div className="sm:hidden">
          {/* Brand row */}
          <div className="flex items-center justify-between mb-5">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#a855f7] via-[#7c3aed] to-[#3b82f6] flex items-center justify-center">
                <span className="text-white font-black text-base">T</span>
              </div>
              <span className="text-base font-bold text-white">Toornify</span>
            </Link>
            <div className="flex items-center gap-2">
              {[Twitter, Instagram, Youtube, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="w-7 h-7 rounded-md border border-white/10 flex items-center justify-center text-gray-500 hover:text-white hover:border-purple-500/50 transition-all">
                  <Icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>

          <p className="text-[12px] text-gray-500 leading-relaxed mb-5">
            All-in-one platform to create, manage & play esports tournaments.
          </p>

          {/* 2-col compact link grid (drop "Legal" on mobile — keep terms/privacy in copyright row) */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-5 mb-6">
            {cols.slice(0, 3).map((c) => (
              <div key={c.title}>
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">{c.title}</h4>
                <ul className="space-y-1.5">
                  {c.links.map((l) => (
                    <li key={l.label}>
                      <Link to={l.href} className="text-[12.5px] text-gray-500 hover:text-white transition-colors">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* compact copyright + legal links inline */}
          <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[10.5px] text-gray-600">
            <span>© 2025 Toornify</span>
            <div className="flex items-center gap-3">
              <Link to="/terms" className="hover:text-gray-400">Terms</Link>
              <Link to="/privacy" className="hover:text-gray-400">Privacy</Link>
            </div>
          </div>
        </div>

        {/* DESKTOP / TABLET layout */}
        <div className="hidden sm:block">
          <div className="grid sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr_1.2fr] gap-8 sm:gap-10 mb-10 sm:mb-12">
            {/* Brand */}
            <div>
              <Link to="/" className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#a855f7] via-[#7c3aed] to-[#3b82f6] flex items-center justify-center">
                  <span className="text-white font-black text-lg">T</span>
                </div>
                <span className="text-xl font-bold text-white">Toornify</span>
              </Link>
              <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
                The all-in-one platform to create, manage and play esports tournaments.
              </p>
              <div className="flex items-center gap-3 mt-5">
                {[Twitter, Instagram, Youtube, Linkedin].map((Icon, i) => (
                  <a key={i} href="#" className="w-9 h-9 rounded-lg border border-white/10 flex items-center justify-center text-gray-500 hover:text-white hover:border-purple-500/50 hover:bg-purple-500/10 transition-all">
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>

            {cols.map((c) => (
              <div key={c.title}>
                <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">{c.title}</h4>
                <ul className="space-y-2.5">
                  {c.links.map((l) => (
                    <li key={l.label}>
                      <Link to={l.href} className="text-sm text-gray-500 hover:text-white transition-colors">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Newsletter */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Stay in the loop</h4>
              <p className="text-xs text-gray-500 mb-4">Get tournament updates & exclusive offers.</p>
              <form className="relative">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-4 py-2.5 pr-11 rounded-lg bg-white/5 border border-white/10 focus:border-purple-500/50 focus:bg-white/10 text-white text-sm placeholder:text-gray-600 outline-none transition-all"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-md bg-gradient-to-r from-[#7c3aed] to-[#a855f7] flex items-center justify-center hover:scale-105 transition-transform"
                >
                  <ArrowRight className="w-4 h-4 text-white" />
                </button>
              </form>
            </div>
          </div>

          <div className="pt-6 border-t border-white/5 text-center text-xs text-gray-600">
            © 2025 Toornify. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
