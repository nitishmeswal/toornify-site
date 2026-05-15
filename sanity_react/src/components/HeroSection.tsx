import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/Input";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { API_CONFIG } from "@/lib/api-config";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { BackgroundEffects } from "@/components/BackgroundEffects";
import GradientText from "@/components/GradientText";
import StarBorder from "@/components/StarBorder";
import GlitchText from "@/components/GlitchText";

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type EmailFormData = z.infer<typeof emailSchema>;

export default function HeroSection() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
  });

  const [message, setMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const onSubmit = async (data: EmailFormData) => {
    setStatus("loading");
    try {
      // Use the API base URL from config
      const apiUrl = `${API_CONFIG.BASE_URL}/api/email`;
      await axios.post(apiUrl, data);
      setStatus("success");
      setMessage("Thanks for signing up! We'll notify you when we launch.");
      reset();
    } catch (err: any) {
      setStatus("error");
      setMessage(err.response?.data?.message || "Something went wrong. Please try again.");
    }

    setTimeout(() => {
      setMessage(null);
      setStatus("idle");
    }, 5000);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <BackgroundEffects />
      
      <section className="relative flex flex-col justify-center py-12 sm:py-16 md:py-20 my-4 sm:my-6 md:my-10 z-10">
        <div className="text-center max-w-4xl mx-auto space-y-4 sm:space-y-6 px-4 sm:px-6">
          {/* Tagline */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center mb-6"
          >
            <div className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-neutral-700 bg-black/20 backdrop-blur-sm mb-6">
              <GlitchText
                speed={1}
                enableShadows
                enableOnHover={false}
                className="text-xs sm:text-sm font-semibold tracking-wide text-[#c084fc]"
              >
                BETA LAUNCH SOON
              </GlitchText>
            </div>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold max-w-7xl mx-auto text-center relative z-20 leading-tight px-2"
          >
            <GradientText
              colors={['#8B5CF6', '#6D28D9', '#A78BFA']}
              animationSpeed={6}
              className="inline-block"
            >
              Suite
            </GradientText>{" "}
            <GradientText
              colors={['#3B82F6', '#06B6D4', '#60A5FA']}
              animationSpeed={5}
              className="inline-block"
            >
              of Powerful Tools for
            </GradientText>{" "}
            <GradientText
              colors={['#6D28D9', '#8B5CF6', '#A78BFA']}
              animationSpeed={6}
              className="inline-block"
            >
              Tournaments
            </GradientText>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto"
          >
            Create, manage, and compete in tournaments with ease. Join the next generation of competitive gaming.
          </motion.p>

          {/* Email Form or CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-8"
          >
            {isAuthenticated ? (
              // Show action buttons for authenticated users
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <StarBorder
                  as="button"
                  className="rounded-xl"
                  color="magenta"
                  speed="5s"
                  onClick={() => navigate('/tournaments')}
                >
                  <span className="px-8 py-4 text-base sm:text-lg font-semibold bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl block">
                    Browse Tournaments
                  </span>
                </StarBorder>
                <StarBorder
                  as="button"
                  className="rounded-xl"
                  color="#38bdf8"
                  speed="5s"
                  onClick={() => navigate('/dashboard')}
                >
                  <span className="px-8 py-4 text-base sm:text-lg font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl block">
                    Go to Dashboard
                  </span>
                </StarBorder>
              </div>
            ) : (
              // Show email signup and login option for unauthenticated users
              <div className="space-y-6">
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="flex flex-col items-center gap-3 sm:gap-4 w-full max-w-md mx-auto px-2"
                >
                  <div className="w-full relative">
                    <Input
                      {...register("email")}
                      placeholder="Enter your email"
                      className="text-base border-zinc-400/10 bg-black/50 text-white placeholder:text-gray-500"
                    />
                    {message && (
                      <div
                        className={cn(
                          "absolute left-0 mt-1 text-sm rounded-md px-3 py-2 z-10",
                          status === "success"
                            ? "bg-green-600 text-white"
                            : "bg-red-600 text-white"
                        )}
                      >
                        {message}
                      </div>
                    )}
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                    )}
                  </div>

                  <StarBorder
                    as="button"
                    type="submit"
                    className="rounded-lg"
                    color="magenta"
                    speed="5s"
                    disabled={status === "loading"}
                  >
                    <div
                      className={cn(
                        "px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg bg-black text-white text-sm sm:text-base font-medium transition-all duration-200 flex items-center gap-2 min-h-[44px]",
                        status === "loading" && "cursor-not-allowed opacity-70"
                      )}
                    >
                      {status === "loading" ? (
                        <>
                          <svg
                            className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                            />
                          </svg>
                          <span>Loading...</span>
                        </>
                      ) : (
                        "Pre-Register Now"
                      )}
                    </div>
                  </StarBorder>
                </form>

                
              </div>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
