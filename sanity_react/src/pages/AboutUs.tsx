import { motion } from "framer-motion";
import { Target, Users, Zap, Award, Heart, Globe, Instagram, Linkedin, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { BackgroundEffects } from "@/components/BackgroundEffects";

export function AboutUs() {
  const values = [
    {
      icon: Target,
      title: "Excellence",
      description: "We strive for excellence in every tournament, feature, and interaction.",
      color: "from-[#8B5CF6] to-[#6D28D9]"
    },
    {
      icon: Users,
      title: "Community First",
      description: "Our community drives everything we do. Your feedback shapes our platform.",
      color: "from-[#A78BFA] to-[#A78BFA]"
    },
    {
      icon: Zap,
      title: "Innovation",
      description: "Constantly pushing boundaries with cutting-edge tournament technology.",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: Heart,
      title: "Passion for Gaming",
      description: "Built by gamers, for gamers. We live and breathe competitive gaming.",
      color: "from-[#6D28D9] to-[#8B5CF6]"
    },
    {
      icon: Award,
      title: "Fair Play",
      description: "Integrity and fairness are at the core of every tournament we host.",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Globe,
      title: "Global Reach",
      description: "Connecting players worldwide, breaking down geographical barriers.",
      color: "from-[#7C3AED] to-[#A78BFA]"
    }
  ];

  const team = [
    { name: "Aniket Pandey", role: "CEO & Founder", initials: "AP",linkedIn:"https://www.linkedin.com/in/aniketpandeyofficial?utm_source=share_via&utm_content=profile&utm_medium=member_android" },
    { name: "Anant Mann", role: "CTO", initials: "AM" ,linkedIn:"https://www.linkedin.com/in/anantmann?utm_source=share_via&utm_content=profile&utm_medium=member_android"},
    
  ];

  // const stats = [
  //   { label: "Active Players", value: "500K+" },
  //   { label: "Tournaments Hosted", value: "10K+" },
  //   { label: "Prize Pool Distributed", value: "$5M+" },
  //   { label: "Countries Reached", value: "150+" },
  // ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1625] via-[#13111c] to-[#0f0b15] relative overflow-hidden">
      <BackgroundEffects />
      {/* Hero Section */}
      <div className="relative py-20 px-4 overflow-hidden z-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM4YjVjZjYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzBoNnYtNmgtNnY2em0tMTggNmg2di02aC02djZ6bTE4LTZoNnYtNmgtNnY2em0tMTggNmg2di02aC02djZ6bTE4LTZoNnYtNmgtNnY2eiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-bold text-white mb-6"
          >
            About Toornify
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-300 mb-8"
          >
            Revolutionizing competitive gaming, one tournament at a time
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-20">
        {/* Mission Statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-20"
        >
          <Card className="bg-gradient-to-br from-[#1f1a2e] to-[#18152a] border-purple-500/50">
            <CardContent className="p-8 md:p-12">
              <h2 className="text-3xl font-bold text-white mb-6 text-center">Our Mission</h2>
              <p className="text-lg text-gray-200 leading-relaxed text-center max-w-3xl mx-auto">
                To create the world's most accessible and engaging esports platform, empowering gamers 
                of all skill levels to compete, connect, and grow. We believe competitive gaming should 
                be inclusive, exciting, and rewarding for everyone.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <Card className="bg-gradient-to-b from-[#1f1a2e] to-[#18152a] border border-[#3d3551] text-center backdrop-blur-sm">
                <CardContent className="pt-6">
                  <p className="text-3xl md:text-4xl font-bold text-purple-400 mb-2">
                    {stat.value}
                  </p>
                  <p className="text-gray-400">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div> */}

        {/* Values */}
        <div className="mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
            Our Core Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <Card className="bg-gradient-to-b from-[#1f1a2e] to-[#18152a] border border-[#3d3551] hover:border-purple-500/50 transition-all h-full backdrop-blur-sm">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${value.color} flex items-center justify-center mb-4`}>
                      <value.icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-white">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400">{value.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
            Meet Our Team
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <Card
                
                onClick={()=>{
                  window.open(member.linkedIn,'_blank')
                }}
                className="bg-gradient-to-b from-[#1f1a2e] to-[#18152a] border border-[#3d3551] hover:border-purple-500/50 transition-all text-center backdrop-blur-sm">
                  <CardContent className="pt-6">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                      {member.initials}
                    </div>
                    <h3 className="text-white font-semibold mb-1">{member.name}</h3>
                    <p className="text-gray-400 text-sm">{member.role}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="relative overflow-hidden rounded-2xl border border-purple-500/30">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#4c1d95]/60 via-[#1f1a2e] to-[#2d1b69]/60" />
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-violet-700/20 rounded-full blur-3xl" />

            <div className="relative p-8 md:p-14 text-center">
              <span className="inline-block px-4 py-1 rounded-full bg-purple-500/20 text-purple-300 text-sm font-medium mb-6 border border-purple-500/30">
                🎮 Join the Movement
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                Ready to Compete at
                <span className="block bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
                  the Next Level?
                </span>
              </h2>
              <p className="text-lg text-gray-300 mb-10 max-w-2xl mx-auto">
                Join thousands of players already competing on Toornify. Create your account, 
                build your squad, and dominate the leaderboards.
              </p>

              <div className="flex flex-wrap gap-4 justify-center mb-12">
                <Button className="bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] hover:from-[#A78BFA] hover:to-[#7C3AED] px-8 py-3 text-base flex items-center gap-2">
                  Get Started Free <ArrowRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" className="border-purple-500/50 hover:border-purple-400 text-gray-300 hover:text-white px-8 py-3 text-base">
                  Explore Tournaments
                </Button>
              </div>

              {/* Social handles */}
              <div className="border-t border-purple-500/20 pt-8">
                <p className="text-gray-400 text-sm mb-4 uppercase tracking-widest font-medium">Follow Us</p>
                <div className="flex justify-center gap-6">
                  <a
                    href="https://instagram.com/toornify"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-gray-400 hover:text-pink-400 transition-colors group"
                  >
                    <span className="w-10 h-10 rounded-full bg-white/5 group-hover:bg-pink-500/20 border border-white/10 group-hover:border-pink-500/40 flex items-center justify-center transition-all">
                      <Instagram className="h-5 w-5" />
                    </span>
                    <span className="text-sm font-medium">@toornify</span>
                  </a>
                  <a
                    href="https://linkedin.com/company/toornify"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors group"
                  >
                    <span className="w-10 h-10 rounded-full bg-white/5 group-hover:bg-blue-500/20 border border-white/10 group-hover:border-blue-500/40 flex items-center justify-center transition-all">
                      <Linkedin className="h-5 w-5" />
                    </span>
                    <span className="text-sm font-medium">Toornify</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
