import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Check, X, Sparkles, Gamepad2, Headphones, MessageCircle } from "lucide-react";
import SEO from "@/components/SEO";

type BillingCycle = "monthly" | "yearly";

interface Plan {
  name: string;
  tagline: string;
  monthly: number | null;     // null = Custom
  yearly: number | null;
  billedNote: string;
  cta: string;
  href: string;
  highlight?: boolean;
  badge?: string;
  includesLabel: string;
  bullets: string[];
}

const PLANS: Plan[] = [
  {
    name: "Free",
    tagline: "Get started and run small tournaments for free.",
    monthly: 0,
    yearly: 0,
    billedNote: "Forever",
    cta: "Get Started",
    href: "/sign-up",
    includesLabel: "Includes:",
    bullets: [
      "Up to 5 tournaments",
      "Up to 64 participants",
      "Single-elimination brackets",
      "Basic stats & reporting",
      "Community support",
    ],
  },
  {
    name: "Creator",
    tagline: "Perfect for content creators and growing communities.",
    monthly: 19,
    yearly: 15,
    billedNote: "Billed monthly",
    cta: "Start 7-Day Free Trial",
    href: "/sign-up?plan=creator",
    highlight: true,
    badge: "Most Popular",
    includesLabel: "Everything in Free, plus:",
    bullets: [
      "Unlimited tournaments",
      "Up to 256 participants",
      "Advanced brackets",
      "Custom branding",
      "Priority support",
      "API access",
    ],
  },
  {
    name: "Pro",
    tagline: "Built for professional organizers and esports teams.",
    monthly: 49,
    yearly: 39,
    billedNote: "Billed monthly",
    cta: "Start 7-Day Free Trial",
    href: "/sign-up?plan=pro",
    includesLabel: "Everything in Creator, plus:",
    bullets: [
      "Up to 1,024 participants",
      "Multi-stage tournaments",
      "Automated match scheduling",
      "Payouts & prize management",
      "Discord & Slack integrations",
      "Advanced analytics",
    ],
  },
  {
    name: "Enterprise",
    tagline: "Custom solutions for large-scale esports organizations.",
    monthly: null,
    yearly: null,
    billedNote: "Tailored to your needs",
    cta: "Contact Sales",
    href: "/contact?topic=enterprise",
    includesLabel: "Everything in Pro, plus:",
    bullets: [
      "Unlimited participants",
      "Dedicated account manager",
      "SLA & priority support",
      "White-label solution",
      "Custom integrations",
      "Advanced security",
    ],
  },
];

const COMPARE_ROWS: { feature: string; values: (string | boolean)[] }[] = [
  { feature: "Tournaments",                  values: ["5", "Unlimited", "Unlimited", "Unlimited"] },
  { feature: "Participants per tournament",  values: ["64", "256", "1,024", "Unlimited"] },
  { feature: "Brackets",                     values: ["Single Elimination", "Advanced", "Advanced + Multi-Stage", "Custom"] },
  { feature: "Custom Branding",              values: [false, true, true, true] },
  { feature: "Payouts & Prize Management",   values: [false, true, true, true] },
  { feature: "Advanced Analytics",           values: [false, false, true, true] },
  { feature: "API Access",                   values: [false, true, true, true] },
  { feature: "Priority Support",             values: [false, true, true, true] },
  { feature: "White-label Solution",         values: [false, false, false, true] },
];

export default function Pricing() {
  const [cycle, setCycle] = useState<BillingCycle>("monthly");

  return (
    <>
      <SEO />

      {/* ambient glow */}
      <div className="absolute inset-x-0 top-0 h-[600px] -z-10 bg-[radial-gradient(ellipse_60%_80%_at_50%_0%,rgba(124,58,237,0.18),transparent_70%)]" />

      <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          {/* HERO */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 backdrop-blur-sm mb-5"
            >
              <Sparkles className="w-3 h-3 text-purple-300" />
              <span className="text-xs font-bold uppercase tracking-[0.22em] text-purple-200">
                Simple, Transparent & Fair
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-[3.6rem] font-black tracking-tight leading-[1.05] mb-4"
            >
              Pricing that grows{" "}
              <span className="bg-gradient-to-r from-[#a855f7] via-[#c084fc] to-[#7c3aed] bg-clip-text text-transparent">
                with your ambition.
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="text-gray-400 max-w-xl mx-auto"
            >
              Choose the perfect plan to create, manage and scale your esports tournaments.
            </motion.p>

            {/* billing toggle */}
            <div className="mt-8 inline-flex items-center gap-1 p-1 rounded-2xl bg-white/[0.04] ring-1 ring-inset ring-white/10">
              {(["monthly", "yearly"] as BillingCycle[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setCycle(c)}
                  className={`relative px-5 py-2 rounded-xl text-sm font-bold transition-colors ${
                    cycle === c ? "text-white" : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  {cycle === c && (
                    <motion.span
                      layoutId="pricing-toggle"
                      className="absolute inset-0 rounded-xl bg-gradient-to-b from-[#7c3aed] to-[#5b21b6] shadow-md shadow-purple-900/40"
                      transition={{ type: "spring", stiffness: 350, damping: 28 }}
                    />
                  )}
                  <span className="relative capitalize">{c}</span>
                  {c === "yearly" && (
                    <span className="relative ml-2 inline-block px-1.5 py-0.5 rounded text-[10px] font-black bg-emerald-500/20 text-emerald-300 ring-1 ring-inset ring-emerald-400/40">
                      Save 20%
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* PLANS */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
            {PLANS.map((p, i) => (
              <PlanCard key={p.name} plan={p} cycle={cycle} index={i} />
            ))}
          </div>

          {/* COMPARE TABLE */}
          <div className="mt-16">
            <div className="relative rounded-3xl bg-white/[0.03] ring-1 ring-inset ring-white/8 overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
              <div className="p-6 lg:p-8">
                <h2 className="text-xl lg:text-2xl font-black text-white mb-6 tracking-tight">
                  Compare all features
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-[640px]">
                    <thead>
                      <tr className="border-b border-white/8">
                        <th className="py-3 pr-4 text-xs font-semibold uppercase tracking-widest text-gray-500"></th>
                        {PLANS.map((p) => (
                          <th
                            key={p.name}
                            className="py-3 px-3 text-center text-[13px] font-black text-white"
                          >
                            {p.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {COMPARE_ROWS.map((row, i) => (
                        <tr
                          key={row.feature}
                          className={`${i % 2 === 0 ? "bg-white/[0.015]" : ""} border-b border-white/5`}
                        >
                          <td className="py-3 pr-4 text-[13px] text-gray-300 font-medium">
                            {row.feature}
                          </td>
                          {row.values.map((v, j) => (
                            <td key={j} className="py-3 px-3 text-center">
                              {typeof v === "boolean" ? (
                                v ? (
                                  <Check className="w-4 h-4 text-purple-400 mx-auto" />
                                ) : (
                                  <X className="w-4 h-4 text-gray-600 mx-auto" />
                                )
                              ) : (
                                <span className="text-[13px] text-white font-medium">{v}</span>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* TALK TO SALES BANNER */}
          <div className="mt-12">
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#1a0f2e] via-[#140a26] to-[#0a0414] ring-1 ring-inset ring-white/8">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_15%_50%,rgba(168,85,247,0.25),transparent_60%)]" />
              <div className="absolute -right-10 -top-10 w-72 h-72 rounded-full bg-fuchsia-500/15 blur-3xl pointer-events-none" />
              <div className="relative grid md:grid-cols-[1fr_auto] gap-6 items-center p-7 lg:p-9">
                <div className="flex items-center gap-5">
                  <div className="relative flex-shrink-0">
                    <div className="absolute -inset-3 bg-purple-500/30 blur-2xl rounded-full" />
                    <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-[#7c3aed] to-[#a855f7] flex items-center justify-center ring-1 ring-white/15">
                      <Gamepad2 className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl lg:text-2xl font-black text-white tracking-tight mb-1">
                      Not sure which plan is right for you?
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Our team is happy to help you find the perfect solution.
                    </p>
                  </div>
                </div>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#a855f7] text-white font-bold text-sm shadow-lg shadow-purple-900/50 hover:shadow-purple-700/70 hover:scale-[1.02] transition-all whitespace-nowrap"
                >
                  <MessageCircle className="w-4 h-4" />
                  Talk to Sales
                </Link>
              </div>
            </div>
          </div>

          {/* FAQ teaser */}
          <div className="mt-12 text-center">
            <p className="text-[11px] uppercase tracking-[0.3em] font-bold text-purple-300 mb-2">
              Got questions?
            </p>
            <p className="text-gray-400 text-sm mb-4">
              Visit our{" "}
              <Link to="/help" className="text-white font-bold hover:text-purple-200 transition-colors underline underline-offset-4">
                Help Center
              </Link>{" "}
              or chat with our team in real-time.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 text-sm font-bold text-purple-300 hover:text-purple-200 transition-colors"
            >
              <Headphones className="w-4 h-4" />
              Contact Support
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}

function PlanCard({ plan, cycle, index }: { plan: Plan; cycle: BillingCycle; index: number }) {
  const price = cycle === "monthly" ? plan.monthly : plan.yearly;
  const priceDisplay =
    price === null ? "Custom" : price === 0 ? "$0" : `$${price}`;
  const period =
    price === null ? "" : `/${cycle === "monthly" ? "month" : "month"}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      whileHover={{ y: -4 }}
      className={`relative rounded-3xl overflow-hidden p-6 lg:p-7 flex flex-col ${
        plan.highlight
          ? "bg-gradient-to-b from-[#2a1448] to-[#170a2a] ring-1 ring-purple-400/50"
          : "bg-white/[0.03] ring-1 ring-inset ring-white/8 hover:ring-white/15"
      } transition-all`}
    >
      {plan.highlight && (
        <div className="absolute -top-0.5 left-1/2 -translate-x-1/2">
          <div className="px-3 py-1 rounded-b-lg bg-gradient-to-b from-[#a855f7] to-[#7c3aed] text-[10px] font-black text-white tracking-wider shadow-md shadow-purple-900/60">
            {plan.badge?.toUpperCase()}
          </div>
        </div>
      )}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

      <h3 className="text-lg font-black text-white tracking-tight">{plan.name}</h3>
      <p className="text-[12px] text-gray-400 mt-1.5 mb-5 min-h-[36px]">{plan.tagline}</p>

      <div className="flex items-baseline gap-1 mb-1">
        <span className="text-4xl font-black text-white tabular-nums">{priceDisplay}</span>
        {period && (
          <span className="text-sm text-gray-400 font-medium">{period}</span>
        )}
      </div>
      <p className="text-[11px] text-gray-500 mb-5">{plan.billedNote}</p>

      <Link
        to={plan.href}
        className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold mb-6 transition-all ${
          plan.highlight
            ? "bg-gradient-to-r from-[#7c3aed] to-[#a855f7] text-white shadow-lg shadow-purple-900/50 hover:shadow-purple-700/70 hover:scale-[1.02]"
            : "bg-white/[0.06] hover:bg-white/[0.12] ring-1 ring-inset ring-white/15 text-white"
        }`}
      >
        {plan.cta}
      </Link>

      <p className="text-[11px] uppercase tracking-[0.2em] font-bold text-purple-300 mb-3">
        {plan.includesLabel}
      </p>
      <ul className="space-y-2 flex-1">
        {plan.bullets.map((b) => (
          <li key={b} className="flex items-start gap-2">
            <Check className="w-3.5 h-3.5 text-purple-400 mt-0.5 flex-shrink-0" />
            <span className="text-[12.5px] text-gray-300 leading-relaxed">{b}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
