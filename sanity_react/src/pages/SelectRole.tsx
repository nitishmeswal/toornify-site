import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Gamepad2, Users, Camera, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Loader } from '@/components/ui/Loader';

const roles = [
  {
    id: 'player',
    title: 'Player',
    description: 'Compete in tournaments, build your gaming profile, and connect with other players',
    icon: Gamepad2,
    color: 'from-blue-500/20 to-blue-600/20',
    borderColor: 'border-blue-500/30 hover:border-blue-500/60',
    textColor: 'text-blue-400',
  },
  {
    id: 'organiser',
    title: 'Organiser',
    description: 'Create tournaments, manage events, and build your gaming community',
    icon: Users,
    color: 'from-purple-500/20 to-purple-600/20',
    borderColor: 'border-purple-500/30 hover:border-purple-500/60',
    textColor: 'text-purple-400',
  },
  {
    id: 'creator',
    title: 'Creator',
    description: 'Share your content, showcase your talent, and monetize your gaming passion',
    icon: Camera,
    color: 'from-pink-500/20 to-pink-600/20',
    borderColor: 'border-pink-500/30 hover:border-pink-500/60',
    textColor: 'text-pink-400',
  },
];

export function SelectRole() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleContinue = (role: string) => {
    setSelectedRole(role);
    setIsLoading(true);
    setError(null);
    
    // Navigate to the appropriate onboarding page
    setTimeout(() => {
      navigate(`/onboarding/${role}`, { replace: true });
    }, 300);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a1625] via-[#13111c] to-[#0f0b15] px-4 py-12">
      {/* Grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.05)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-5xl relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-white mb-3"
          >
            Complete Your Profile
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-muted-foreground mb-2"
          >
            Select your role to get started with Toornify
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="text-sm text-muted-foreground"
          >
            Welcome, {user?.username || 'user'}! Complete your profile to unlock full access.
          </motion.p>
        </div>

        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </motion.div>
        )}

        {/* Role cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {roles.map((role, index) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.id;
            
            return (
              <motion.button
                key={role.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                onClick={() => handleContinue(role.id)}
                disabled={isLoading}
                className={`relative h-full text-left transition-all duration-300 rounded-2xl border-2 p-6 backdrop-blur-sm overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed $${role.borderColor}`}
              >
                {/* Background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${role.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                {/* Content */}
                <div className="relative z-10">
                  <div className={`mb-4 inline-block p-3 rounded-lg bg-gradient-to-br ${role.color}`}>
                    <Icon className={`w-6 h-6 ${role.textColor}`} />
                  </div>

                  <h3 className="text-xl font-bold text-foreground mb-2">{role.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{role.description}</p>

                  {isSelected && isLoading ? (
                    <div className="flex items-center gap-2 text-primary">
                      <Loader variant="spinner" size="sm" />
                      <span className="text-sm font-medium">Redirecting...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-primary font-medium group-hover:gap-3 transition-all duration-300">
                      <span>Get Started</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Info section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.65 }}
          className="bg-card border border-border rounded-lg p-6 text-center"
        >
          <p className="text-sm text-muted-foreground mb-2">
            Not sure which role is right for you?
          </p>
          <p className="text-xs text-muted-foreground">
            You can update your role later in your account settings. Choose the one that best describes your primary interest.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default SelectRole;
