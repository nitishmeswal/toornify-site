import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User as UserIcon, LogOut, Settings, Gamepad2, Building2, Tv } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAvatarUrl, getCharacterAvatar } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/DropdownMenu";

const navLinks = [
  {
    title: "Tournaments",
    href: "/tournaments",
  },
  {
    title: "Brackets",
    href: "/bracket",
  },
  // {
  //   title: "Games",
  //   href: "/games",
  // },
  {
    title: "Teams",
    href: "/teams",
  },
  {
    title: "Blogs",
    href: "/blogs",
  },
  {
    title: "News",
    href: "/news",
  },
  {
    title: "About Us",
    href: "/about-us",
  },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, signOut } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [, setHoveredIndex] = useState<number | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const rafIdRef = useRef<number | null>(null);
  const lastScrollYRef = useRef(0);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleScroll = useCallback(() => {
    if (rafIdRef.current) return;

    rafIdRef.current = requestAnimationFrame(() => {
      const scrollY = window.scrollY;
      if (Math.abs(scrollY - lastScrollYRef.current) > 10) {
        setScrolled(scrollY > 50);
        lastScrollYRef.current = scrollY;
      }
      rafIdRef.current = null;
    });
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [handleScroll]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = "0px";
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [isMenuOpen]);

  const isActive = (href: string) => {
    return location.pathname === href;
  };

  const showOnboardingLinks = !!isAuthenticated && !user?.isProfileComplete;

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <>
      {/* Desktop & Tablet */}
      <div className="md:block hidden">
        <div className="sticky top-0 z-50 bg-gradient-to-b from-[#13111c] via-[#1a1625] to-transparent">
          <div
            className={cn(
              "transition-all duration-300",
              scrolled
                ? "bg-[#13111c]/98 shadow-lg shadow-black/50"
                : "bg-[#1a1625]/90"
            )}
          >
            <div className="max-w-[1800px] mx-auto px-8">
              {/* Top Bar */}
              <div className="flex items-center justify-between py-3 border-b border-[#3d3551]/30">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-3 group">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] rounded flex items-center justify-center">
                    <span className="text-white font-bold text-xl">T</span>
                  </div>
                  <div className="flex flex-col">
                    <h1 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">
                      TOORNIFY
                    </h1>
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider">Tournament Platform</span>
                  </div>
                </Link>

                {/* Right Section */}
                <div className="flex items-center gap-4">
                  {isLoading ? (
                    // Loading skeleton
                    <div className="flex items-center gap-3 px-4 py-2 bg-[#18152a] border border-[#3d3551] rounded animate-pulse">
                      <div className="w-8 h-8 rounded bg-[#3d3551]" />
                      <div className="flex flex-col items-start gap-1">
                        <div className="w-16 h-3 bg-[#3d3551] rounded" />
                        <div className="w-20 h-2 bg-[#3d3551] rounded" />
                      </div>
                    </div>
                  ) : isAuthenticated ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-3 px-4 py-2 bg-[#18152a] hover:bg-[#1f1a2e] border border-[#3d3551] hover:border-purple-500/50 rounded transition-all">
                          <div className="relative">
                            <img
                              src={getAvatarUrl(user?.profilePic || user?.image, user?.username || user?.email || user?.id || 'user')}
                              alt={user?.username || 'User'}
                              className="w-8 h-8 rounded-full object-cover border border-purple-500/30"
                              onError={(e) => {
                                e.currentTarget.src = getCharacterAvatar(user?.username || user?.email || user?.id || 'user');
                              }}
                            />
                          </div>
                          <div className="flex flex-col items-start">
                            <span className="text-sm font-medium text-white">{user?.username || 'User'}</span>
                            <span className="text-xs text-gray-400">View Profile</span>
                          </div>
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                          <UserIcon className="w-4 h-4 mr-2" />
                          Dashboard
                        </DropdownMenuItem>
                        {user?.role === 'admin' && (
                          <DropdownMenuItem onClick={() => navigate('/admin')}>
                            <Settings className="w-4 h-4 mr-2" />
                            Admin Panel
                          </DropdownMenuItem>
                        )}

                        {showOnboardingLinks && (user?.role === 'player' || (user?.gameProfiles?.length ?? 0) > 0) && (
                          <DropdownMenuItem onClick={() => navigate('/onboarding/player')}>
                            <Gamepad2 className="w-4 h-4 mr-2" />
                            Player Profile
                          </DropdownMenuItem>
                        )}

                        {showOnboardingLinks && (user?.role === 'organiser' || user?.organization) && (
                          <DropdownMenuItem onClick={() => navigate('/onboarding/organiser')}>
                            <Building2 className="w-4 h-4 mr-2" />
                            Organiser Profile
                          </DropdownMenuItem>
                        )}

                        {showOnboardingLinks && (user?.role === 'creator' || user?.creatorProfile) && (
                          <DropdownMenuItem onClick={() => navigate('/onboarding/creator')}>
                            <Tv className="w-4 h-4 mr-2" />
                            Creator Profile
                          </DropdownMenuItem>
                        )}

                        {showOnboardingLinks && !user?.role && (
                          <DropdownMenuItem onClick={() => navigate('/onboarding/select-role')}>
                            <UserIcon className="w-4 h-4 mr-2" />
                            Complete Onboarding
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleSignOut}>
                          <LogOut className="w-4 h-4 mr-2" />
                          Sign Out
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Link to="/sign-in">
                        <button className="px-6 py-2 text-sm font-medium text-white hover:text-purple-400 transition-colors">
                          LOGIN
                        </button>
                      </Link>
                      <Link to="/sign-up">
                        <button className="px-6 py-2 bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] hover:from-[#A78BFA] hover:to-[#7C3AED] text-white text-sm font-semibold rounded transition-all">
                          SIGN UP
                        </button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Navigation Bar */}
              <nav className="flex items-center gap-1 py-2">
                <Link
                  to="/"
                  className={cn(
                    "px-4 py-2 text-sm font-medium uppercase tracking-wide transition-all",
                    isActive("/")
                      ? "text-white bg-[#18152a]"
                      : "text-gray-400 hover:text-white hover:bg-[#18152a]/50"
                  )}
                >
                  Home
                </Link>
                {navLinks.map((item, index) => (
                  <Link
                    key={index}
                    to={item.href}
                    className={cn(
                      "px-4 py-2 text-sm font-medium uppercase tracking-wide transition-all relative group",
                      isActive(item.href)
                        ? "text-white bg-[#18152a]"
                        : "text-gray-400 hover:text-white hover:bg-[#18152a]/50"
                    )}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    {item.title}
                    {isActive(item.href) && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9]" />
                    )}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile */}
      <div className="md:hidden sticky top-0 z-50 bg-[#13111c]">
        <div
          className={cn(
            "transition-all duration-300",
            scrolled
              ? "bg-[#13111c]/98 shadow-lg shadow-black/50"
              : "bg-[#1a1625]/90"
          )}
        >
          <div className="flex items-center justify-between px-4 py-4 border-b border-[#3d3551]/30">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] rounded flex items-center justify-center">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <h1 className="text-lg font-bold text-white">
                TOORNIFY
              </h1>
            </Link>

            {/* Hamburger Menu */}
            <button
              onClick={toggleMenu}
              className="p-2 bg-[#18152a] hover:bg-purple-500/20 border border-[#3d3551] hover:border-purple-500/50 rounded transition-all"
            >
              <Menu className="size-5 text-white" />
            </button>
          </div>

          {/* Mobile Drawer */}
          <AnimatePresence>
            {isMenuOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm"
                  onClick={closeMenu}
                />

                <motion.div
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="fixed top-0 right-0 z-50 w-80 max-w-[85vw] h-screen bg-[#13111c] border-l border-[#3d3551] shadow-2xl"
                >
                  <div className="h-full flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-5 border-b border-[#3d3551]">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] rounded flex items-center justify-center">
                          <span className="text-white font-bold text-lg">T</span>
                        </div>
                        <span className="text-white text-base font-bold">TOORNIFY</span>
                      </div>
                      <button
                        onClick={closeMenu}
                        className="p-2 bg-[#18152a] hover:bg-red-500/20 border border-[#3d3551] hover:border-red-500/50 rounded transition-all"
                      >
                        <X className="size-4 text-white" />
                      </button>
                    </div>

                    {/* Navigation Links */}
                    <div className="flex-1 overflow-y-auto">
                      <div className="px-4 py-4 space-y-1">
                        <Link
                          to="/"
                          onClick={closeMenu}
                          className={cn(
                            "flex items-center px-4 py-3 text-sm font-medium uppercase tracking-wide rounded transition-all",
                            isActive("/")
                              ? "bg-[#18152a] text-white border-l-2 border-purple-500"
                              : "text-gray-400 hover:bg-[#18152a]/50 hover:text-white"
                          )}
                        >
                          Home
                        </Link>
                        {navLinks.map((item, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <Link
                              to={item.href}
                              onClick={closeMenu}
                              className={cn(
                                "flex items-center px-4 py-3 text-sm font-medium uppercase tracking-wide rounded transition-all",
                                isActive(item.href)
                                  ? "bg-[#18152a] text-white border-l-2 border-purple-500"
                                  : "text-gray-400 hover:bg-[#18152a]/50 hover:text-white"
                              )}
                            >
                              {item.title}
                            </Link>
                          </motion.div>
                        ))}

                        {/* Mobile Profile Links */}
                        {isAuthenticated && showOnboardingLinks && (
                          <div className="mt-4 pt-4 border-t border-[#3d3551]">
                            <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">My Profiles</p>
                            {!user?.role && (
                              <Link
                                to="/onboarding/select-role"
                                onClick={closeMenu}
                                className="flex items-center px-4 py-3 text-sm font-medium text-gray-400 hover:text-white hover:bg-[#18152a]/50 rounded"
                              >
                                Complete Onboarding
                              </Link>
                            )}
                            {(user?.role === 'player' || (user?.gameProfiles?.length ?? 0) > 0) && (
                              <Link
                                to="/onboarding/player"
                                onClick={closeMenu}
                                className="flex items-center px-4 py-3 text-sm font-medium text-gray-400 hover:text-white hover:bg-[#18152a]/50 rounded"
                              >
                                Player Profile
                              </Link>
                            )}

                            {(user?.role === 'organiser' || user?.organization) && (
                              <Link
                                to="/onboarding/organiser"
                                onClick={closeMenu}
                                className="flex items-center px-4 py-3 text-sm font-medium text-gray-400 hover:text-white hover:bg-[#18152a]/50 rounded"
                              >
                                Organiser Profile
                              </Link>
                            )}

                            {(user?.role === 'creator' || user?.creatorProfile) && (
                              <Link
                                to="/onboarding/creator"
                                onClick={closeMenu}
                                className="flex items-center px-4 py-3 text-sm font-medium text-gray-400 hover:text-white hover:bg-[#18152a]/50 rounded"
                              >
                                Creator Profile
                              </Link>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer - User Profile or Auth Buttons */}
                    <div className="p-4 border-t border-[#3d3551] bg-[#0f0b15]">
                      {isLoading ? (
                        // Loading skeleton for mobile
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 px-4 py-3 bg-[#18152a] border border-[#3d3551] rounded animate-pulse">
                            <div className="w-10 h-10 rounded bg-[#3d3551]" />
                            <div className="flex-1 space-y-2">
                              <div className="w-24 h-3 bg-[#3d3551] rounded" />
                              <div className="w-32 h-2 bg-[#3d3551] rounded" />
                            </div>
                          </div>
                        </div>
                      ) : isAuthenticated ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 px-4 py-3 bg-[#18152a] border border-[#3d3551] rounded">
                            <div className="relative">
                              <img
                                src={getAvatarUrl(user?.profilePic || user?.image, user?.username || user?.email || user?.id || 'user')}
                                alt={user?.username || 'User'}
                                className="w-10 h-10 rounded-full object-cover border border-purple-500/30"
                                onError={(e) => {
                                  e.currentTarget.src = getCharacterAvatar(user?.username || user?.email || user?.id || 'user');
                                }}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white truncate">
                                {user?.username || 'User'}
                              </p>
                              <p className="text-xs text-gray-400 truncate">
                                {user?.email}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              navigate('/dashboard');
                              closeMenu();
                            }}
                            className="w-full py-2.5 bg-[#18152a] hover:bg-purple-500/20 border border-[#3d3551] hover:border-purple-500/50 text-white text-sm font-medium rounded transition-all"
                          >
                            DASHBOARD
                          </button>
                          {user?.role === 'admin' && (
                            <button
                              onClick={() => {
                                navigate('/admin');
                                closeMenu();
                              }}
                              className="w-full py-2.5 bg-[#18152a] hover:bg-purple-500/20 border border-[#3d3551] hover:border-purple-500/50 text-white text-sm font-medium rounded transition-all flex items-center justify-center gap-2"
                            >
                              <Settings className="w-4 h-4" />
                              ADMIN PANEL
                            </button>
                          )}
                          <button
                            onClick={() => {
                              handleSignOut();
                              closeMenu();
                            }}
                            className="w-full py-2.5 bg-[#18152a] hover:bg-red-500/20 border border-[#3d3551] hover:border-red-500/50 text-white text-sm font-medium rounded transition-all flex items-center justify-center gap-2"
                          >
                            <LogOut className="w-4 h-4" />
                            SIGN OUT
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Link to="/sign-in" className="block" onClick={closeMenu}>
                            <button className="w-full py-2.5 bg-[#18152a] hover:bg-[#1f1a2e] border border-[#3d3551] hover:border-purple-500/50 text-white text-sm font-medium rounded transition-all">
                              LOGIN
                            </button>
                          </Link>
                          <Link to="/sign-up" className="block" onClick={closeMenu}>
                            <button className="w-full py-2.5 bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] hover:from-[#A78BFA] hover:to-[#7C3AED] text-white text-sm font-semibold rounded transition-all">
                              SIGN UP
                            </button>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
