import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Shield } from "lucide-react";
import SEO from "@/components/SEO";

const SECTIONS = [
  {
    title: "1. Information We Collect",
    content:
      "We collect information you provide directly (name, email, profile data), usage data (pages visited, features used, tournament activity), and technical data (IP address, browser type, device info). We do not sell your personal information to third parties.",
  },
  {
    title: "2. How We Use Your Information",
    content:
      "We use your information to: provide and maintain the platform; process tournament registrations and prize distributions; communicate with you about your account and tournaments; improve our services; ensure fair play and platform security; and comply with legal obligations.",
  },
  {
    title: "3. Data Sharing",
    content:
      "We may share your information with: tournament organizers (for event management); payment processors (for prize distributions); service providers (for platform operations); and law enforcement (when legally required). Public profile information is visible to other users.",
  },
  {
    title: "4. Data Security",
    content:
      "We implement industry-standard security measures including encryption, secure servers, and regular security audits. However, no method of transmission over the Internet is 100% secure. We encourage you to use strong passwords and enable two-factor authentication.",
  },
  {
    title: "5. Cookies & Tracking",
    content:
      "We use cookies and similar technologies to maintain your session, remember preferences, and analyze platform usage. You can control cookie settings through your browser. Disabling cookies may limit some platform functionality.",
  },
  {
    title: "6. Your Rights",
    content:
      "You have the right to: access your personal data; correct inaccurate data; delete your account and data; export your data; opt out of marketing communications; and restrict processing of your data. Contact us to exercise these rights.",
  },
  {
    title: "7. Data Retention",
    content:
      "We retain your data for as long as your account is active or as needed to provide services. Tournament records and results may be retained for historical and statistical purposes. You can request deletion of your account at any time.",
  },
  {
    title: "8. Children's Privacy",
    content:
      "Toornify is not intended for children under 13. We do not knowingly collect personal information from children under 13. If you are a parent and believe your child has provided us with personal information, please contact us.",
  },
  {
    title: "9. International Data Transfers",
    content:
      "Your data may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for international data transfers in compliance with applicable data protection laws.",
  },
  {
    title: "10. Changes to This Policy",
    content:
      "We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the 'last updated' date. Continued use of the platform after changes constitutes acceptance.",
  },
];

export default function Privacy() {
  return (
    <>
      <SEO />
      <main className="pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <span className="text-gray-300">Privacy Policy</span>
          </div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 backdrop-blur-sm mb-5">
              <Shield className="w-3 h-3 text-purple-300" />
              <span className="text-xs font-bold uppercase tracking-[0.22em] text-purple-200">Privacy</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-[1.05] mb-4">
              Privacy{" "}
              <span className="bg-gradient-to-r from-[#a855f7] via-[#c084fc] to-[#7c3aed] bg-clip-text text-transparent">
                Policy
              </span>
            </h1>
            <p className="text-gray-400 max-w-2xl">
              Your privacy matters to us. This policy explains how we collect,
              use, and protect your information. Last updated: January 2025.
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
              Questions about your privacy?{" "}
              <Link to="/contact" className="text-purple-400 hover:text-purple-300 font-medium">
                Contact our privacy team
              </Link>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
