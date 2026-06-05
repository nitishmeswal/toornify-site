import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import {
  Mail, Lock, User, AlertCircle, Eye, EyeOff, CheckCircle, ArrowRight,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const signUpSchema = z
  .object({
    fullName: z
      .string()
      .min(3, "Full name must be at least 3 characters")
      .max(50, "Full name must be less than 50 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    role: z.enum(["player", "organiser", "creator"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SignUpFormData = z.infer<typeof signUpSchema>;

const ROLES = [
  { v: "player", label: "Player" },
  { v: "organiser", label: "Organiser" },
  { v: "creator", label: "Creator" },
] as const;

export function SignUp() {
  const navigate = useNavigate();
  const { signUp, isAuthenticated, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { role: "player" },
  });

  const selectedRole = watch("role");

  const onSubmit = async (data: SignUpFormData) => {
    try {
      setError(null);
      const response = await signUp({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        role: data.role,
      });

      if (response && response.statusCode === 200 && response.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate("/sign-in", {
            state: {
              message: "Account created successfully! Please sign in to continue.",
            },
          });
        }, 1800);
      } else {
        setSuccess(true);
        setTimeout(() => navigate("/sign-in"), 1800);
      }
    } catch (err: any) {
      let msg = "Failed to create account. Please try again.";
      if (err.response?.data?.message) msg = err.response.data.message;
      else if (err.response?.data?.error) msg = err.response.data.error;
      else if (err.response?.data?.errors) {
        const e = err.response.data.errors;
        if (typeof e === "string") msg = e;
        else if (Array.isArray(e)) msg = e.map((x: any) => x.message || x).join(", ");
        else if (typeof e === "object") msg = Object.values(e).join(", ");
      } else if (err.message) {
        msg = err.message;
      }
      setError(msg);
    }
  };

  return (
    <div className="min-h-screen bg-[#070310] text-white grid lg:grid-cols-2 overflow-hidden">
      {/* ============================================================
       *  LEFT — hero image with overlay
       *  Replace with your assets:
       *    /auth-hero-desktop.jpg  (recommended 1200 × 1400)
       *    /auth-hero-mobile.jpg   (recommended  900 ×  600)
       * ============================================================ */}
      <div className="relative hidden lg:flex flex-col justify-end p-12 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/auth-hero-desktop.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070310] via-[#070310]/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#070310]/40" />

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
       *  RIGHT — auth card
       * ============================================================ */}
      <div className="relative flex flex-col">
        {/* mobile-only hero strip */}
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

        <div className="absolute inset-y-0 right-0 w-1/2 -z-10 bg-[radial-gradient(ellipse_60%_70%_at_70%_30%,rgba(124,58,237,0.18),transparent_70%)] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex-1 flex items-center justify-center px-5 sm:px-8 py-10 lg:py-12"
        >
          <div className="w-full max-w-md">
            {/* SUCCESS panel replaces the form */}
            {success ? (
              <div className="relative rounded-3xl bg-[#0d0620]/80 backdrop-blur-xl ring-1 ring-inset ring-white/8 shadow-[0_30px_80px_-20px_rgba(124,58,237,0.35)] p-8 text-center">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/15 ring-1 ring-emerald-400/40 flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-emerald-300" />
                </div>
                <h2 className="text-xl font-black text-white tracking-tight">
                  Registration Successful!
                </h2>
                <p className="text-[13px] text-gray-400 mt-2">
                  Redirecting you to sign in…
                </p>
              </div>
            ) : (
              <>
                {/* glass card */}
                <div className="relative rounded-3xl bg-[#0d0620]/80 backdrop-blur-xl ring-1 ring-inset ring-white/8 shadow-[0_30px_80px_-20px_rgba(124,58,237,0.35)] p-7 sm:p-9">
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

                  {/* Logo */}
                  <div className="flex justify-center mb-5">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#a855f7] via-[#7c3aed] to-[#3b82f6] flex items-center justify-center shadow-lg shadow-purple-900/50">
                      <span className="text-white font-black text-xl tracking-tighter">
                        T
                      </span>
                    </div>
                  </div>

                  <h1 className="text-center text-[1.9rem] font-black text-white tracking-tight">
                    Create Account
                  </h1>
                  <p className="text-center text-sm text-gray-400 mt-1.5">
                    Join the Toornify community
                  </p>

                  {/* Tabs */}
                  <div className="relative mt-7 grid grid-cols-2 text-center">
                    <Link
                      to="/sign-in"
                      className="pb-3 text-[13px] font-bold text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      Log In
                    </Link>
                    <div className="pb-3 text-[13px] font-bold text-white relative">
                      Sign Up
                      <span className="absolute left-0 right-0 -bottom-px h-[2px] bg-gradient-to-r from-[#a855f7] to-[#7c3aed] rounded-full" />
                    </div>
                    <div className="col-span-2 h-px bg-white/8 -mt-px" />
                  </div>

                  {/* Error alert */}
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
                    {/* Full name */}
                    <Field
                      label="Full Name"
                      icon={<User className="w-4 h-4 text-gray-500" />}
                      error={errors.fullName?.message}
                    >
                      <input
                        type="text"
                        autoComplete="name"
                        placeholder="John Doe"
                        className="w-full pl-10 pr-3 py-3 rounded-xl bg-white/[0.03] ring-1 ring-inset ring-white/10 text-[13.5px] text-white placeholder:text-gray-600 focus:outline-none focus:ring-purple-400/60 focus:bg-white/[0.05] transition-all"
                        {...register("fullName")}
                      />
                    </Field>

                    {/* Email */}
                    <Field
                      label="Email Address"
                      icon={<Mail className="w-4 h-4 text-gray-500" />}
                      error={errors.email?.message}
                    >
                      <input
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        className="w-full pl-10 pr-3 py-3 rounded-xl bg-white/[0.03] ring-1 ring-inset ring-white/10 text-[13.5px] text-white placeholder:text-gray-600 focus:outline-none focus:ring-purple-400/60 focus:bg-white/[0.05] transition-all"
                        {...register("email")}
                      />
                    </Field>

                    {/* Password */}
                    <Field
                      label="Password"
                      icon={<Lock className="w-4 h-4 text-gray-500" />}
                      error={errors.password?.message}
                    >
                      <input
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="Create a password"
                        className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/[0.03] ring-1 ring-inset ring-white/10 text-[13.5px] text-white placeholder:text-gray-600 focus:outline-none focus:ring-purple-400/60 focus:bg-white/[0.05] transition-all"
                        {...register("password")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors p-1"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </Field>

                    {/* Confirm password */}
                    <Field
                      label="Confirm Password"
                      icon={<Lock className="w-4 h-4 text-gray-500" />}
                      error={errors.confirmPassword?.message}
                    >
                      <input
                        type={showConfirm ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="Re-enter your password"
                        className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/[0.03] ring-1 ring-inset ring-white/10 text-[13.5px] text-white placeholder:text-gray-600 focus:outline-none focus:ring-purple-400/60 focus:bg-white/[0.05] transition-all"
                        {...register("confirmPassword")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors p-1"
                        aria-label={showConfirm ? "Hide password" : "Show password"}
                      >
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </Field>

                    {/* Role */}
                    <div>
                      <label className="block text-[12.5px] font-bold text-white mb-2">
                        I am a…
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {ROLES.map((r) => {
                          const active = selectedRole === r.v;
                          return (
                            <button
                              key={r.v}
                              type="button"
                              onClick={() =>
                                setValue("role", r.v as SignUpFormData["role"], {
                                  shouldValidate: true,
                                })
                              }
                              className={`relative py-2.5 rounded-xl text-[12.5px] font-bold transition-all ${
                                active
                                  ? "bg-gradient-to-r from-[#7c3aed] to-[#a855f7] text-white shadow-md shadow-purple-900/40"
                                  : "bg-white/[0.03] ring-1 ring-inset ring-white/10 text-gray-300 hover:bg-white/[0.06] hover:ring-white/20"
                              }`}
                            >
                              {r.label}
                            </button>
                          );
                        })}
                      </div>
                      {errors.role && (
                        <p className="mt-1.5 text-[11.5px] text-red-300">
                          {errors.role.message}
                        </p>
                      )}
                    </div>

                    {/* Terms */}
                    <label className="flex items-start gap-2.5 cursor-pointer select-none w-fit group pt-1">
                      <input
                        type="checkbox"
                        required
                        className="peer sr-only"
                      />
                      <span className="relative inline-flex items-center justify-center w-4 h-4 mt-0.5 rounded-[5px] ring-1 ring-inset ring-white/15 bg-white/[0.04] peer-checked:bg-gradient-to-br peer-checked:from-[#a855f7] peer-checked:to-[#7c3aed] peer-checked:ring-purple-400/60 transition-all flex-shrink-0">
                        <svg
                          viewBox="0 0 12 10"
                          className="w-2.5 h-2.5 text-white opacity-0 peer-checked:opacity-100"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M1 5l3.5 3.5L11 1" />
                        </svg>
                      </span>
                      <span className="text-[12.5px] text-gray-300 leading-snug">
                        I agree to the{" "}
                        <Link
                          to="/terms"
                          className="text-purple-300 hover:text-purple-200 font-bold transition-colors"
                        >
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link
                          to="/privacy"
                          className="text-purple-300 hover:text-purple-200 font-bold transition-colors"
                        >
                          Privacy Policy
                        </Link>
                      </span>
                    </label>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="group relative w-full mt-2 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#a855f7] text-white font-bold text-[13.5px] shadow-lg shadow-purple-900/50 hover:shadow-purple-700/70 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
                            <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                          </svg>
                          Creating account…
                        </>
                      ) : (
                        <>
                          Create Account
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

                  <p className="mt-6 text-center text-[11.5px] text-gray-500 leading-relaxed">
                    By creating an account, you agree to our{" "}
                    <Link to="/terms" className="text-purple-300 hover:text-purple-200 transition-colors">
                      Terms
                    </Link>{" "}
                    and{" "}
                    <Link to="/privacy" className="text-purple-300 hover:text-purple-200 transition-colors">
                      Privacy Policy
                    </Link>
                    .
                  </p>
                </div>

                {/* mobile-only sign-in hint */}
                <p className="mt-5 text-center text-[12.5px] text-gray-500 lg:hidden">
                  Already have an account?{" "}
                  <Link
                    to="/sign-in"
                    className="text-purple-300 font-bold hover:text-purple-200 transition-colors"
                  >
                    Sign in
                  </Link>
                </p>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/* ============================================================================
 *  Field — label + relative wrapper for input + icon (matches SignIn styling)
 * ========================================================================= */
function Field({
  label,
  icon,
  error,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[12.5px] font-bold text-white mb-2">{label}</label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2">{icon}</span>
        {children}
      </div>
      {error && <p className="mt-1.5 text-[11.5px] text-red-300">{error}</p>}
    </div>
  );
}

/* ============================================================================
 *  Social button (same as SignIn)
 * ========================================================================= */
function SocialButton({ provider }: { provider: "google" | "riot" }) {
  const isGoogle = provider === "google";
  return (
    <button
      type="button"
      onClick={() => console.log(`Continue with ${provider}`)}
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
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35.5 24 35.5 17.6 35.5 12.5 30.4 12.5 24S17.6 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.9 6.4 29.2 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.4-.3-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 18.9 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.9 6.4 29.2 4.5 24 4.5 16.3 4.5 9.7 9.1 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 43.5c5.1 0 9.7-1.9 13.2-5.1l-6.1-5c-2 1.4-4.4 2.2-7.1 2.2-5.3 0-9.7-3.1-11.3-7.5l-6.5 5C9.5 38.7 16.2 43.5 24 43.5z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4-4 5.3l6.1 5c4.3-3.9 7.1-9.7 7.1-16.3 0-1.2-.1-2.4-.3-3.5z" />
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
