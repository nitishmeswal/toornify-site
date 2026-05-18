import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import {
  Mail, Lock, AlertCircle, Eye, EyeOff, CheckCircle, ArrowRight,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type SignInFormData = z.infer<typeof signInSchema>;

export default function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, isAuthenticated, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Check for expired token message in URL
  const searchParams = new URLSearchParams(location.search);
  const reason = searchParams.get("reason");

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const from = (location.state as any)?.from?.pathname || "/";
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, location]);

  // Show messages from navigation state or URL params
  useEffect(() => {
    const state = location.state as any;
    if (state?.message) {
      setSuccessMessage(state.message);
      window.history.replaceState({}, document.title);
    } else if (reason === "expired" || reason === "session-expired") {
      setError("Your session has expired. Please sign in again.");
    }
  }, [reason, location.state]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (data: SignInFormData) => {
    try {
      setError(null);
      await signIn(data.email, data.password);
      const from = (location.state as any)?.from?.pathname || "/";
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error("Sign in error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to sign in. Please check your credentials."
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#070310] text-white grid lg:grid-cols-2 overflow-hidden">
      {/* ============================================================
       *  LEFT — Hero image with overlay
       *  Replace the background URLs below with your own assets:
       *    /auth-hero-desktop.jpg  (recommended 1200 × 1400, ≤ 400 KB)
       *    /auth-hero-mobile.jpg   (recommended  900 ×  600, ≤ 200 KB)
       * ============================================================ */}
      <div className="relative hidden lg:flex flex-col justify-end p-12 overflow-hidden">
        {/* desktop image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/auth-hero-desktop.jpg')" }}
        />
        {/* gradient veil so text stays legible */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#070310] via-[#070310]/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#070310]/40" />

        {/* copy */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 max-w-md"
        >
          <h2 className="text-[2.6rem] xl:text-[3rem] font-black tracking-tight leading-[1.05]">
            <span className="block text-white">Compete. Conquer.</span>
            <span className="block bg-gradient-to-r from-[#a855f7] via-[#c084fc] to-[#7c3aed] bg-clip-text text-transparent">
              Make History.
            </span>
          </h2>
          <p className="mt-4 text-sm text-gray-400 leading-relaxed">
            Toornify is the all-in-one platform for esports tournaments.<br />
            Create, compete, and celebrate victories.
          </p>
        </motion.div>
      </div>

      {/* ============================================================
       *  RIGHT — Auth card
       * ============================================================ */}
      <div className="relative flex flex-col">
        {/* mobile-only hero image strip (top of screen) */}
        <div className="lg:hidden relative h-[180px] sm:h-[220px] overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/auth-hero-mobile.jpg')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#070310]/40 to-[#070310]" />
          <div className="absolute bottom-4 left-5 right-5">
            <h2 className="text-2xl font-black tracking-tight leading-tight">
              Compete. Conquer.{" "}
              <span className="bg-gradient-to-r from-[#a855f7] via-[#c084fc] to-[#7c3aed] bg-clip-text text-transparent">
                Make History.
              </span>
            </h2>
          </div>
        </div>

        {/* ambient glow */}
        <div className="absolute inset-y-0 right-0 w-1/2 -z-10 bg-[radial-gradient(ellipse_60%_70%_at_70%_30%,rgba(124,58,237,0.18),transparent_70%)] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex-1 flex items-center justify-center px-5 sm:px-8 py-10 lg:py-12"
        >
          <div className="w-full max-w-md">
            {/* glass card */}
            <div className="relative rounded-3xl bg-[#0d0620]/80 backdrop-blur-xl ring-1 ring-inset ring-white/8 shadow-[0_30px_80px_-20px_rgba(124,58,237,0.35)] p-7 sm:p-9">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

              {/* Logo */}
              <div className="flex justify-center mb-5">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#a855f7] via-[#7c3aed] to-[#3b82f6] flex items-center justify-center shadow-lg shadow-purple-900/50">
                  <span className="text-white font-black text-xl tracking-tighter">T</span>
                </div>
              </div>

              {/* heading */}
              <h1 className="text-center text-[1.9rem] font-black text-white tracking-tight">
                Welcome Back
              </h1>
              <p className="text-center text-sm text-gray-400 mt-1.5">
                Log in to your Toornify account
              </p>

              {/* Tabs */}
              <div className="relative mt-7 grid grid-cols-2 text-center">
                <div className="pb-3 text-[13px] font-bold text-white relative">
                  Log In
                  <span className="absolute left-0 right-0 -bottom-px h-[2px] bg-gradient-to-r from-[#a855f7] to-[#7c3aed] rounded-full" />
                </div>
                <Link
                  to="/sign-up"
                  className="pb-3 text-[13px] font-bold text-gray-500 hover:text-gray-300 transition-colors"
                >
                  Sign Up
                </Link>
                <div className="col-span-2 h-px bg-white/8 -mt-px" />
              </div>

              {/* Alerts */}
              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-5 flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-300 text-[12.5px]"
                >
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  <p>{successMessage}</p>
                </motion.div>
              )}
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-5 flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-[12.5px]"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <p>{error}</p>
                </motion.div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-[12.5px] font-bold text-white mb-2"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-3 py-3 rounded-xl bg-white/[0.03] ring-1 ring-inset ring-white/10 text-[13.5px] text-white placeholder:text-gray-600 focus:outline-none focus:ring-purple-400/60 focus:bg-white/[0.05] transition-all"
                      {...register("email")}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1.5 text-[11.5px] text-red-300">{errors.email.message}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label
                      htmlFor="password"
                      className="block text-[12.5px] font-bold text-white"
                    >
                      Password
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-[12px] font-bold text-purple-300 hover:text-purple-200 transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/[0.03] ring-1 ring-inset ring-white/10 text-[13.5px] text-white placeholder:text-gray-600 focus:outline-none focus:ring-purple-400/60 focus:bg-white/[0.05] transition-all"
                      {...register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors p-1"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1.5 text-[11.5px] text-red-300">{errors.password.message}</p>
                  )}
                </div>

                {/* Remember me */}
                <label className="flex items-center gap-2.5 cursor-pointer select-none w-fit group">
                  <span
                    onClick={() => setRemember(!remember)}
                    className={`relative inline-flex items-center justify-center w-4 h-4 rounded-[5px] ring-1 ring-inset transition-all ${
                      remember
                        ? "bg-gradient-to-br from-[#a855f7] to-[#7c3aed] ring-purple-400/60"
                        : "bg-white/[0.04] ring-white/15 group-hover:ring-white/30"
                    }`}
                  >
                    {remember && (
                      <svg
                        viewBox="0 0 12 10"
                        className="w-2.5 h-2.5 text-white"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M1 5l3.5 3.5L11 1" />
                      </svg>
                    )}
                  </span>
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="sr-only"
                  />
                  <span className="text-[12.5px] text-gray-300">Remember me</span>
                </label>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group relative w-full mt-2 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#a855f7] text-white font-bold text-[13.5px] shadow-lg shadow-purple-900/50 hover:shadow-purple-700/70 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="3"
                          opacity="0.25"
                        />
                        <path
                          d="M22 12a10 10 0 0 1-10 10"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                      </svg>
                      Signing in…
                    </>
                  ) : (
                    <>
                      Log In
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              {/* divider */}
              <div className="relative my-6 flex items-center">
                <div className="flex-1 h-px bg-white/8" />
                <span className="px-3 text-[10px] font-bold text-gray-500 tracking-[0.2em]">
                  OR CONTINUE WITH
                </span>
                <div className="flex-1 h-px bg-white/8" />
              </div>

              {/* Social */}
              <div className="space-y-2.5">
                <SocialButton provider="google" />
                <SocialButton provider="riot" />
              </div>

              {/* footer */}
              <p className="mt-6 text-center text-[11.5px] text-gray-500 leading-relaxed">
                By continuing, you agree to our{" "}
                <Link
                  to="/terms"
                  className="text-purple-300 hover:text-purple-200 transition-colors"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  to="/privacy"
                  className="text-purple-300 hover:text-purple-200 transition-colors"
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </div>

            {/* mobile-only sign-up hint */}
            <p className="mt-5 text-center text-[12.5px] text-gray-500 lg:hidden">
              Don't have an account?{" "}
              <Link
                to="/sign-up"
                className="text-purple-300 font-bold hover:text-purple-200 transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/* ============================================================================
 *  Social button
 * ========================================================================= */
function SocialButton({ provider }: { provider: "google" | "riot" }) {
  const isGoogle = provider === "google";
  return (
    <button
      type="button"
      onClick={() => {
        // wire to your OAuth flow
        console.log(`Continue with ${provider}`);
      }}
      className="group relative w-full inline-flex items-center justify-center gap-3 px-5 py-3 rounded-xl bg-white/[0.03] ring-1 ring-inset ring-white/10 hover:bg-white/[0.06] hover:ring-white/20 text-white font-bold text-[13px] transition-all"
    >
      <span
        className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${
          isGoogle ? "bg-white" : "bg-gradient-to-br from-red-600 to-red-500"
        }`}
      >
        {isGoogle ? <GoogleIcon /> : <RiotIcon />}
      </span>
      Continue with {isGoogle ? "Google" : "Riot"}
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="w-4 h-4" aria-hidden>
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35.5 24 35.5 17.6 35.5 12.5 30.4 12.5 24S17.6 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.9 6.4 29.2 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.4-.3-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.6 16 18.9 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.9 6.4 29.2 4.5 24 4.5 16.3 4.5 9.7 9.1 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 43.5c5.1 0 9.7-1.9 13.2-5.1l-6.1-5c-2 1.4-4.4 2.2-7.1 2.2-5.3 0-9.7-3.1-11.3-7.5l-6.5 5C9.5 38.7 16.2 43.5 24 43.5z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4-4 5.3l6.1 5c4.3-3.9 7.1-9.7 7.1-16.3 0-1.2-.1-2.4-.3-3.5z"
      />
    </svg>
  );
}

function RiotIcon() {
  return (
    <svg viewBox="0 0 32 32" className="w-3.5 h-3.5 text-white" fill="currentColor" aria-hidden>
      <path d="M3 6l5 18h4l-1-12 3 12h3l-1-12 3 12h3l-1-12 3 12h4L29 6 3 6zm5 22h17v2H8v-2z" />
    </svg>
  );
}
