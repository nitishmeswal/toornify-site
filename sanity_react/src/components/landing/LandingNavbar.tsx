import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { Menu, X, ChevronDown, BookOpen, HelpCircle, Mail, FileText, Shield, Map, Users, Newspaper } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

interface DropdownItem {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  desc?: string;
}

interface NavLink {
  label: string;
  href?: string;
  dropdown?: DropdownItem[];
}

const navLinks: NavLink[] = [
  { label: "Tournaments", href: "/tournaments" },
  { label: "Games", href: "/games" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Pricing", href: "/pricing" },
  {
    label: "Resources",
    dropdown: [
      { label: "Blog", href: "/blogs", icon: Newspaper, desc: "Latest esports news & updates" },
      { label: "About Us", href: "/about-us", icon: Users, desc: "Our mission & team" },
      { label: "FAQ", href: "/faq", icon: HelpCircle, desc: "Frequently asked questions" },
      { label: "Contact", href: "/contact", icon: Mail, desc: "Get in touch with us" },
      { label: "Roadmap", href: "/roadmap", icon: Map, desc: "What we're building next" },
      { label: "Documentation", href: "/docs", icon: BookOpen, desc: "API docs & guides" },
      { label: "Terms of Service", href: "/terms", icon: FileText, desc: "Our terms & conditions" },
      { label: "Privacy Policy", href: "/privacy", icon: Shield, desc: "How we handle your data" },
    ],
  },
];

export default function LandingNavbar() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = () => setActiveDropdown(null);
    if (activeDropdown) {
      document.addEventListener("click", handler);
      return () => document.removeEventListener("click", handler);
    }
  }, [activeDropdown]);

  const handleDropdownEnter = (label: string) => {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
    setActiveDropdown(label);
  };

  const handleDropdownLeave = () => {
    dropdownTimeout.current = setTimeout(() => setActiveDropdown(null), 150);
  };

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-[#0a0612]/55 backdrop-blur-md border-b border-white/5 shadow-[0_4px_24px_-12px_rgba(0,0,0,0.6)]"
          : "bg-transparent"
      )}
      style={
        scrolled
          ? { boxShadow: "0 1px 0 0 rgba(192,132,252,0.25), 0 4px 24px -12px rgba(0,0,0,0.6)" }
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
          {navLinks.map((l) =>
            l.dropdown ? (
              <div
                key={l.label}
                className="relative"
                onMouseEnter={() => handleDropdownEnter(l.label)}
                onMouseLeave={handleDropdownLeave}
              >
                <button
                  style={{ textShadow: "0 1px 8px rgba(0,0,0,0.85)" }}
                  className="text-sm font-medium text-gray-200 hover:text-white transition-colors flex items-center gap-1 relative group"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveDropdown(activeDropdown === l.label ? null : l.label);
                  }}
                >
                  {l.label}
                  <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200", activeDropdown === l.label && "rotate-180")} />
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-gradient-to-r from-purple-400 to-blue-400 group-hover:w-full transition-all duration-300" />
                </button>

                {/* Dropdown panel */}
                {activeDropdown === l.label && (
                  <div
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[320px] rounded-xl border border-white/10 bg-[#13111c]/95 backdrop-blur-xl shadow-2xl shadow-black/40 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="p-2">
                      {l.dropdown.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.href}
                            to={item.href}
                            onClick={() => setActiveDropdown(null)}
                            className="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-all group/item"
                          >
                            {Icon && (
                              <div className="mt-0.5 p-1.5 rounded-md bg-purple-500/10 text-purple-400 group-hover/item:bg-purple-500/20 transition-colors">
                                <Icon className="w-4 h-4" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-200 group-hover/item:text-white">{item.label}</p>
                              {item.desc && <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>}
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={l.href}
                to={l.href!}
                style={{ textShadow: "0 1px 8px rgba(0,0,0,0.85)" }}
                className="text-sm font-medium text-gray-200 hover:text-white transition-colors relative group"
              >
                {l.label}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-gradient-to-r from-purple-400 to-blue-400 group-hover:w-full transition-all duration-300" />
              </Link>
            )
          )}
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
        <div className="lg:hidden bg-[#0a0612]/95 backdrop-blur-xl border-t border-white/5 max-h-[80vh] overflow-y-auto">
          <div className="px-6 py-6 flex flex-col gap-1">
            {navLinks.map((l) =>
              l.dropdown ? (
                <div key={l.label}>
                  <button
                    onClick={() => setActiveDropdown(activeDropdown === l.label ? null : l.label)}
                    className="w-full flex items-center justify-between py-3 text-base font-medium text-gray-300 hover:text-white"
                  >
                    {l.label}
                    <ChevronDown className={cn("w-4 h-4 transition-transform", activeDropdown === l.label && "rotate-180")} />
                  </button>
                  {activeDropdown === l.label && (
                    <div className="pl-4 pb-2 space-y-1">
                      {l.dropdown.map((item) => (
                        <Link
                          key={item.href}
                          to={item.href}
                          onClick={() => { setOpen(false); setActiveDropdown(null); }}
                          className="block py-2 text-sm text-gray-400 hover:text-white"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={l.href}
                  to={l.href!}
                  onClick={() => setOpen(false)}
                  className="py-3 text-base font-medium text-gray-300 hover:text-white"
                >
                  {l.label}
                </Link>
              )
            )}
            <div className="pt-4 border-t border-white/10 flex flex-col gap-2">
              {isAuthenticated ? (
                <Link to="/dashboard" onClick={() => setOpen(false)} className="px-4 py-2.5 rounded-lg text-center text-sm font-semibold text-white bg-gradient-to-r from-[#7c3aed] to-[#a855f7]">
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/sign-in" onClick={() => setOpen(false)} className="px-4 py-2.5 rounded-lg text-center text-sm font-semibold text-white border border-white/10">
                    Log In
                  </Link>
                  <Link to="/sign-up" onClick={() => setOpen(false)} className="px-4 py-2.5 rounded-lg text-center text-sm font-semibold text-white bg-gradient-to-r from-[#7c3aed] to-[#a855f7]">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
