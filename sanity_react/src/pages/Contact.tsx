import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Mail, MessageCircle, Briefcase, Send, MapPin, Clock,
  Zap, GraduationCap, Heart, Sparkles, Headphones,
} from "lucide-react";
import { toast } from "react-hot-toast";
import SEO from "@/components/SEO";

const REACH_OUT = [
  {
    icon: Mail,
    title: "Email Us",
    value: "hello@toornify.com",
    desc: "We'll get back to you as soon as possible.",
    href: "mailto:hello@toornify.com",
    accent: "from-purple-500 to-fuchsia-500",
  },
  {
    icon: MessageCircle,
    title: "Join Our Discord",
    value: "discord.gg/toornify",
    desc: "Chat with our community and team.",
    href: "https://discord.gg/toornify",
    accent: "from-indigo-500 to-purple-500",
  },
  {
    icon: Briefcase,
    title: "Business Inquiries",
    value: "partnerships@toornify.com",
    desc: "For partnerships, sponsorships and collaborations.",
    href: "mailto:partnerships@toornify.com",
    accent: "from-fuchsia-500 to-pink-500",
  },
  {
    icon: Send,
    title: "Follow Us",
    value: "@toornify",
    desc: "Stay updated on tournaments, announcements and more.",
    href: "https://twitter.com/toornify",
    accent: "from-violet-500 to-purple-600",
  },
];

const SUPPORT_STATS = [
  { icon: Clock, title: "24/7 Support",    desc: "Our team is available around the clock to assist you." },
  { icon: Zap, title: "Fast Response",     desc: "We respond to all inquiries within 24 hours." },
  { icon: GraduationCap, title: "Expert Help", desc: "Get help from experts and gaming experts." },
  { icon: Heart, title: "Community First",  desc: "We value every player, organizer and partner." },
];

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error("Please fill out all required fields");
      return;
    }
    setSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
      toast.success("Message sent! We'll get back to you within 24 hours.");
      setForm({ name: "", email: "", subject: "", message: "" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <SEO />

      <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          {/* breadcrumb */}
          <div className="text-[11px] text-gray-500 mb-6">
            <Link to="/" className="hover:text-purple-300 transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-300">Contact</span>
          </div>

          {/* HERO */}
          <div className="grid lg:grid-cols-[1.05fr_1fr] gap-10 items-center mb-12">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 backdrop-blur-sm mb-5"
              >
                <Sparkles className="w-3 h-3 text-purple-300" />
                <span className="text-xs font-bold uppercase tracking-[0.22em] text-purple-200">Contact Us</span>
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-[3.4rem] font-black tracking-tight leading-[1.05] mb-4"
              >
                We're here to
                <br />
                help you{" "}
                <span className="bg-gradient-to-r from-[#a855f7] via-[#c084fc] to-[#7c3aed] bg-clip-text text-transparent">
                  win.
                </span>
              </motion.h1>
              <p className="text-gray-400 text-base max-w-md">
                Have a question, partnership idea, or need support?
                <br />
                Our team is just a message away.
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
                    <Headphones className="w-24 h-24 text-white drop-shadow-[0_0_30px_rgba(168,85,247,0.85)]" />
                  </div>
                </motion.div>
              </div>
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-10 left-6 w-10 h-10 rounded-xl bg-white/[0.05] ring-1 ring-inset ring-purple-400/30 backdrop-blur-md flex items-center justify-center"
              >
                <Mail className="w-4 h-4 text-purple-200" />
              </motion.div>
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute bottom-12 right-6 w-10 h-10 rounded-xl bg-white/[0.05] ring-1 ring-inset ring-purple-400/30 backdrop-blur-md flex items-center justify-center"
              >
                <MessageCircle className="w-4 h-4 text-purple-200" />
              </motion.div>
            </motion.div>
          </div>

          {/* MAIN GRID: form + reach out */}
          <div className="grid lg:grid-cols-[1.3fr_1fr] gap-6 lg:gap-8 mb-10">
            {/* form */}
            <div className="relative rounded-3xl bg-white/[0.03] ring-1 ring-inset ring-white/8 p-6 lg:p-8 overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
              <h3 className="text-lg font-black text-white tracking-tight mb-5">Send us a message</h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-3">
                  <Input
                    label="Name"
                    placeholder="Your full name"
                    value={form.name}
                    onChange={(v) => setForm((p) => ({ ...p, name: v }))}
                  />
                  <Input
                    type="email"
                    label="Email"
                    placeholder="you@email.com"
                    value={form.email}
                    onChange={(v) => setForm((p) => ({ ...p, email: v }))}
                  />
                </div>
                <Input
                  label="Subject"
                  placeholder="How can we help?"
                  value={form.subject}
                  onChange={(v) => setForm((p) => ({ ...p, subject: v }))}
                />
                <div>
                  <label className="text-[11px] uppercase tracking-[0.18em] text-gray-400 font-bold mb-1.5 block">
                    Message
                  </label>
                  <textarea
                    rows={5}
                    placeholder="Type your message here..."
                    value={form.message}
                    onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                    className="w-full bg-white/[0.03] ring-1 ring-inset ring-white/8 focus:ring-purple-400/40 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-500 outline-none transition-colors resize-none"
                  />
                </div>

                <div className="flex items-center justify-between gap-4 pt-1">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#a855f7] text-white font-bold text-sm shadow-lg shadow-purple-900/50 hover:shadow-purple-700/70 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                  >
                    <Send className="w-4 h-4" />
                    {submitting ? "Sending…" : "Send Message"}
                  </button>
                  <span className="text-[11px] text-gray-500 hidden sm:block">
                    We usually reply within 24 hours
                  </span>
                </div>
              </form>
            </div>

            {/* other ways */}
            <div>
              <h3 className="text-lg font-black text-white tracking-tight mb-5">Other ways to reach us</h3>
              <div className="space-y-3">
                {REACH_OUT.map((r, i) => (
                  <motion.a
                    key={r.title}
                    href={r.href}
                    target={r.href.startsWith("http") ? "_blank" : undefined}
                    rel="noreferrer"
                    initial={{ opacity: 0, x: 16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.06 }}
                    whileHover={{ x: 3 }}
                    className="group relative block rounded-2xl bg-white/[0.03] ring-1 ring-inset ring-white/8 hover:ring-purple-400/40 p-4 transition-all overflow-hidden"
                  >
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${r.accent} ring-1 ring-white/15 flex items-center justify-center flex-shrink-0`}>
                        <r.icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-[13px] font-black text-white tracking-tight">{r.title}</h4>
                        <p className="text-[12px] text-purple-300 font-bold truncate">{r.value}</p>
                        <p className="text-[11px] text-gray-400 leading-relaxed mt-1">{r.desc}</p>
                      </div>
                    </div>
                  </motion.a>
                ))}
              </div>
            </div>
          </div>

          {/* OFFICE + MAP */}
          <div className="relative rounded-3xl bg-white/[0.03] ring-1 ring-inset ring-white/8 overflow-hidden mb-10">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
            <div className="grid md:grid-cols-[0.85fr_1.15fr] gap-0">
              <div className="p-6 lg:p-8">
                <h3 className="text-lg font-black text-white tracking-tight mb-4">Our Office</h3>
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/15 ring-1 ring-inset ring-purple-400/40 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-purple-300" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">Toornify Inc.</div>
                    <div className="text-[12px] text-gray-400 leading-relaxed mt-0.5">
                      123 Esports Way, Level 7
                      <br />
                      Gaming City, CA 90210
                      <br />
                      United States
                    </div>
                  </div>
                </div>
                <a
                  href="https://maps.google.com/?q=Gaming+City+CA"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-[12px] font-bold text-purple-300 hover:text-purple-200 transition-colors"
                >
                  View on Map →
                </a>
              </div>

              {/* faux map */}
              <div className="relative h-[220px] md:h-auto bg-[#0c0618] overflow-hidden">
                <FauxMap />
              </div>
            </div>
          </div>

          {/* SUPPORT STATS */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {SUPPORT_STATS.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                whileHover={{ y: -3 }}
                className="relative rounded-2xl bg-white/[0.03] ring-1 ring-inset ring-white/8 hover:ring-purple-400/30 p-5 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 ring-1 ring-inset ring-purple-400/40 flex items-center justify-center mb-3">
                  <s.icon className="w-4 h-4 text-purple-300" />
                </div>
                <h4 className="text-[13px] font-black text-white tracking-tight mb-1">{s.title}</h4>
                <p className="text-[11.5px] text-gray-400 leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}

function Input({
  label, value, onChange, placeholder, type = "text",
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div>
      <label className="text-[11px] uppercase tracking-[0.18em] text-gray-400 font-bold mb-1.5 block">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white/[0.03] ring-1 ring-inset ring-white/8 focus:ring-purple-400/40 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-500 outline-none transition-colors"
      />
    </div>
  );
}

function FauxMap() {
  return (
    <div className="absolute inset-0">
      {/* grid */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 240" preserveAspectRatio="none">
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(168,85,247,0.12)" strokeWidth="0.5" />
          </pattern>
          <radialGradient id="mapGlow" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="rgba(168,85,247,0.25)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        <rect width="400" height="240" fill="url(#grid)" />
        <rect width="400" height="240" fill="url(#mapGlow)" />

        {/* fake roads */}
        <path d="M 0 130 Q 100 110 200 130 T 400 120" stroke="rgba(168,85,247,0.4)" strokeWidth="1.5" fill="none" />
        <path d="M 220 0 Q 240 80 200 130 T 230 240" stroke="rgba(168,85,247,0.3)" strokeWidth="1.5" fill="none" />
        <path d="M 0 60 L 400 70" stroke="rgba(168,85,247,0.2)" strokeWidth="1" fill="none" />
        <path d="M 0 200 L 400 190" stroke="rgba(168,85,247,0.2)" strokeWidth="1" fill="none" />
      </svg>
      {/* pin */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="absolute -inset-8 bg-purple-500/30 blur-2xl rounded-full" />
        <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#a855f7] ring-2 ring-white/20 shadow-2xl shadow-purple-900/60 flex items-center justify-center">
          <MapPin className="w-5 h-5 text-white" />
        </div>
        <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-2 bg-black/30 rounded-full blur-sm" />
      </div>
    </div>
  );
}
