import { useState } from "react";
import { IconBrandDiscordFilled } from "@tabler/icons-react";
import { motion } from "framer-motion";
import BorderGlow from "@/components/BorderGlow";

interface Feature {
  title: string;
  description: string;
  skeleton: React.ReactNode;
}

export default function FeatureSection() {
  const features: Feature[] = [
    {
      title: "Join Our Discord Community",
      description:
        "Connect with fellow gamers, stay updated and participate in exclusive events by joining our Discord community.",
      skeleton: <SkeletonDiscord />,
    },
    {
      title: "Global Esports Community",
      description:
        "Connect and compete with players from around the world on our global platform.",
      skeleton: <SkeletonGlobe />,
    },
  ];

  return (
    <div className="relative z-20 py-12 lg:py-24 max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-16">
        <motion.h4
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center tracking-tight text-white mb-4"
        >
          Unlike any other Esports platform
        </motion.h4>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
          className="text-base lg:text-lg max-w-3xl mx-auto text-neutral-400 text-center leading-relaxed"
        >
          Toornify covers every single aspect of the esports community. Which a
          gamer desires we aim to connect organizers with players.
        </motion.p>
      </div>

      <div className="relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              viewport={{ once: true }}
            >
              <BorderGlow
                edgeSensitivity={30}
                glowColor="40 80 80"
                backgroundColor="#120F17"
                borderRadius={28}
                glowRadius={40}
                glowIntensity={1}
                coneSpread={25}
                animated={false}
                colors={['#c084fc', '#f472b6', '#38bdf8']}
              >
                <div className="p-6 sm:p-8 lg:p-10">
                  <FeatureTitle>{feature.title}</FeatureTitle>
                  <FeatureDescription>{feature.description}</FeatureDescription>
                  <div className="mt-6">{feature.skeleton}</div>
                </div>
              </BorderGlow>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

const FeatureTitle = ({ children }: { children: React.ReactNode }) => {
  return (
    <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white mb-3">
      {children}
    </h3>
  );
};

const FeatureDescription = ({ children }: { children: React.ReactNode }) => {
  return (
    <p className="text-sm sm:text-base text-neutral-400 leading-relaxed max-w-md">
      {children}
    </p>
  );
};

const SkeletonDiscord = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <a
      href="https://discord.gg/uxzB9BhH2p"
      target="_blank"
      rel="noopener noreferrer"
      className="relative block group cursor-pointer"
      aria-label="Join Discord"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative w-full h-56 sm:h-64 rounded-lg overflow-hidden border border-neutral-800/50 bg-gradient-to-br from-[#1f1a2e] to-[#18152a] transition-transform duration-300 group-hover:scale-[1.02]">
        {/* Background Image */}
        <img 
          src="/discord-bg.png" 
          alt="Discord background" 
          className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity duration-300"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#5865F2]/20 via-transparent to-transparent" />
        
        {/* Icon Container */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={isHovered ? { scale: 1.2 } : { scale: 1 }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            <IconBrandDiscordFilled className="h-20 w-20 text-[#5865F2] drop-shadow-lg" />
          </motion.div>
        </div>
        
        {/* Hover Text */}
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-4 left-0 right-0 text-center"
          >
            <p className="text-white font-semibold text-lg">Join Now</p>
          </motion.div>
        )}
      </div>
    </a>
  );
};

const SkeletonGlobe = () => {
  return (
    <div className="relative h-56 sm:h-64 rounded-lg overflow-hidden border border-neutral-800/50 bg-gradient-to-br from-[#1f1a2e] to-[#18152a]">
      {/* Background Image */}
      <img 
        src="/globe.png" 
        alt="Globe background" 
        className="absolute inset-0 w-full h-full object-cover opacity-30"
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-purple-600/20 via-transparent to-transparent" />
      
      {/* Center Globe Icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="relative"
        >
          <div className="h-32 w-32 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 opacity-20 blur-xl absolute inset-0" />
          <svg
            className="h-20 w-20 relative z-10 text-purple-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </motion.div>
      </div>
    </div>
  );
};
