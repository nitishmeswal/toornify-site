import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FileText } from "lucide-react";
import SEO from "@/components/SEO";

const SECTIONS = [
  {
    title: "1. Acceptance of Terms",
    content:
      "By accessing or using the Toornify platform, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this platform.",
  },
  {
    title: "2. Use License",
    content:
      'Permission is granted to temporarily access the materials on Toornify\'s platform for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not: modify or copy the materials; use the materials for any commercial purpose or public display; attempt to decompile or reverse engineer any software on Toornify; remove any copyright or proprietary notations; or transfer the materials to another person or "mirror" the materials on any other server.',
  },
  {
    title: "3. Account Registration",
    content:
      "To access certain features of the platform, you must register for an account. You agree to provide accurate, current, and complete information during registration and keep your account information updated. You are responsible for safeguarding your password and for all activities that occur under your account.",
  },
  {
    title: "4. Tournament Participation",
    content:
      "When participating in tournaments on Toornify, you agree to abide by all tournament rules, maintain fair play standards, and respect other participants. Cheating, match-fixing, or any form of unsportsmanlike conduct will result in immediate disqualification and potential account suspension.",
  },
  {
    title: "5. Prize Pools & Payments",
    content:
      "Prize pools are held in escrow and distributed according to tournament rules upon completion. Toornify charges a platform fee on prize distributions. All payments are subject to verification and compliance with applicable financial regulations. Winners are responsible for any taxes on prize earnings.",
  },
  {
    title: "6. Content & Intellectual Property",
    content:
      "All content, trademarks, and intellectual property on the Toornify platform are owned by Toornify or its licensors. Users retain ownership of content they create but grant Toornify a non-exclusive license to use, display, and distribute such content on the platform.",
  },
  {
    title: "7. Prohibited Conduct",
    content:
      "You may not use the platform to: harass or harm other users; distribute malware or engage in hacking; impersonate others; spam or send unsolicited communications; violate any local, state, national, or international law; or engage in any conduct that restricts or inhibits anyone's use of the platform.",
  },
  {
    title: "8. Limitation of Liability",
    content:
      "In no event shall Toornify or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the platform, even if Toornify has been notified of the possibility of such damage.",
  },
  {
    title: "9. Modifications",
    content:
      "Toornify may revise these Terms of Service at any time without notice. By using this platform, you agree to be bound by the current version of these Terms of Service. We will notify registered users of significant changes via email or platform notification.",
  },
  {
    title: "10. Governing Law",
    content:
      "These terms and conditions are governed by and construed in accordance with the applicable laws and you irrevocably submit to the exclusive jurisdiction of the courts in that location.",
  },
];

export default function Terms() {
  return (
    <>
      <SEO />
      <main className="pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <span className="text-gray-300">Terms of Service</span>
          </div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 backdrop-blur-sm mb-5">
              <FileText className="w-3 h-3 text-purple-300" />
              <span className="text-xs font-bold uppercase tracking-[0.22em] text-purple-200">Legal</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-[1.05] mb-4">
              Terms of{" "}
              <span className="bg-gradient-to-r from-[#a855f7] via-[#c084fc] to-[#7c3aed] bg-clip-text text-transparent">
                Service
              </span>
            </h1>
            <p className="text-gray-400 max-w-2xl">
              Please read these terms carefully before using the Toornify platform.
              Last updated: January 2025.
            </p>
          </motion.div>

          {/* Sections */}
          <div className="space-y-8">
            {SECTIONS.map((section, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="rounded-xl border border-white/5 bg-[#12101c]/60 backdrop-blur-sm p-6"
              >
                <h2 className="text-lg font-bold text-white mb-3">{section.title}</h2>
                <p className="text-sm text-gray-400 leading-relaxed">{section.content}</p>
              </motion.div>
            ))}
          </div>

          {/* Contact */}
          <div className="mt-12 p-6 rounded-xl border border-purple-500/20 bg-purple-500/5 text-center">
            <p className="text-sm text-gray-400">
              Questions about these terms?{" "}
              <Link to="/contact" className="text-purple-400 hover:text-purple-300 font-medium">
                Contact us
              </Link>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
