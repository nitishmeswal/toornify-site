import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Tournaments", href: "/tournaments" },
  { label: "Games", href: "/games" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Pricing", href: "/pricing" },
  { label: "Resources", href: "/blogs" },
];

export default function LandingNavbar() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        // KEY FRONTEND FIX:
        // Old:  bg-[#0a0612]/85 backdrop-blur-xl  → 85% opaque + heavy blur =
        //       erases the laser-rain behind it.
        // New:  bg-[#0a0612]/55 backdrop-blur-md  → 55% fill keeps the rain
        //       visible behind, and a moderate blur is enough to keep nav
        //       text readable. The text-shadow on links below is the safety
        //       net for the rare frame where a bright streak passes behind
        //       a label.
        scrolled
          ? "bg-[#0a0612]/55 backdrop-blur-md border-b border-white/5 shadow-[0_4px_24px_-12px_rgba(0,0,0,0.6)]"
          : "bg-transparent"
      )}
      style={
        scrolled
          ? {
              // tiny inner shadow at the very top simulates the laser-line
              // "lighting" the underside of the navbar
              boxShadow:
                "0 1px 0 0 rgba(192,132,252,0.25), 0 4px 24px -12px rgba(0,0,0,0.6)",
            }
          : undefined
      }
    >
      <div className="max-w-[1480px] mx-auto px-5 sm:px-6 lg:px-10 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#a855f7] via-[#7c3aed] to-[#3b82f6] flex items-center justify-center shadow-lg shadow-purple-500/30">
            <span className="text-white font-black text-lg">T</span>
          </div>
          <span className="text-xl font-bold text-white tracking-tight">Toornify</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-9">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              to={l.href}
              // text-shadow keeps labels readable if a bright laser streak
              // happens to pass directly behind them through the translucent navbar
              style={{ textShadow: "0 1px 8px rgba(0,0,0,0.85)" }}
              className="text-sm font-medium text-gray-200 hover:text-white transition-colors relative group"
            >
              {l.label}
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-gradient-to-r from-purple-400 to-blue-400 group-hover:w-full transition-all duration-300" />
            </Link>
          ))}
        </nav>

        {/* CTAs */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <button
              onClick={() => navigate("/dashboard")}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-[#7c3aed] to-[#a855f7] hover:shadow-lg hover:shadow-purple-500/40 transition-all"
            >
              Dashboard
            </button>
          ) : (
            <>
              <Link
                to="/sign-in"
                className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white border border-white/10 hover:border-white/30 hover:bg-white/5 transition-all"
              >
                Log In
              </Link>
              <Link
                to="/sign-up"
                className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-[#7c3aed] to-[#a855f7] hover:shadow-lg hover:shadow-purple-500/40 transition-all"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setOpen((v) => !v)} className="lg:hidden p-2 text-white">
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden bg-[#0a0612]/95 backdrop-blur-xl border-t border-white/5">
          <div className="px-6 py-6 flex flex-col gap-4">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                to={l.href}
                onClick={() => setOpen(false)}
                className="text-base font-medium text-gray-300 hover:text-white"
              >
                {l.label}
              </Link>
            ))}
            <div className="pt-4 border-t border-white/10 flex flex-col gap-2">
              <Link to="/sign-in" onClick={() => setOpen(false)} className="px-4 py-2.5 rounded-lg text-center text-sm font-semibold text-white border border-white/10">
                Log In
              </Link>
              <Link to="/sign-up" onClick={() => setOpen(false)} className="px-4 py-2.5 rounded-lg text-center text-sm font-semibold text-white bg-gradient-to-r from-[#7c3aed] to-[#a855f7]">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
