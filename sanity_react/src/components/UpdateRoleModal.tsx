import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, AlertCircle, Gamepad2, Users, Camera } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Loader } from '@/components/ui/Loader';
import { userService } from '@/lib/services';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

interface UpdateRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: string;
  onSuccess?: () => void;
}

const roles = [
  {
    id: 'player',
    title: 'Player',
    description: 'Compete in tournaments and build your gaming profile',
    icon: Gamepad2,
    color: 'from-blue-500/20 to-blue-600/20',
    borderColor: 'border-blue-500/30 hover:border-blue-500/60',
    textColor: 'text-blue-400',
  },
  {
    id: 'organiser',
    title: 'Organiser',
    description: 'Create tournaments and manage gaming events',
    icon: Users,
    color: 'from-purple-500/20 to-purple-600/20',
    borderColor: 'border-purple-500/30 hover:border-purple-500/60',
    textColor: 'text-purple-400',
  },
  {
    id: 'creator',
    title: 'Creator',
    description: 'Share content and showcase your gaming talent',
    icon: Camera,
    color: 'from-pink-500/20 to-pink-600/20',
    borderColor: 'border-pink-500/30 hover:border-pink-500/60',
    textColor: 'text-pink-400',
  },
];

export function UpdateRoleModal({ isOpen, onClose, currentRole, onSuccess }: UpdateRoleModalProps) {
  const { updateUser, user } = useAuth();
  const [selectedRole, setSelectedRole] = useState<string>(currentRole);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleUpdateRole = async () => {
    if (selectedRole === currentRole) {
      setError('Please select a different role');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Update the role
      await userService.updateProfile({
        role: selectedRole,
      } as any);

      // Fetch fresh user details from API
      const updatedUserDetails = await userService.getUserDetails();

      if (updateUser && user) {
        updateUser({
          ...user,
          role: updatedUserDetails.role,
          isProfileComplete: updatedUserDetails.isProfileComplete,
          email: updatedUserDetails.email,
          username: updatedUserDetails.username,
          organization: updatedUserDetails.organization,
          creatorProfile: updatedUserDetails.creatorProfile,
          gameProfiles: updatedUserDetails.gameProfiles,
          education: updatedUserDetails.education,
          socialLinks: updatedUserDetails.socialLinks,
        });
      }

      toast.success(`Role updated to ${selectedRole}!`);
      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error('Failed to update role:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update role. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl z-50 max-h-[90vh] overflow-y-auto"
      >
        <div className="bg-gradient-to-b from-[#1f1a2e] to-[#18152a] border border-[#3d3551] rounded-2xl shadow-2xl p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Update Your Role</h2>
              <p className="text-sm text-gray-400 mt-1">
                Select a new role to change your profile type
              </p>
            </div>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </motion.div>
          )}

          {/* Role options */}
          <div className="grid grid-cols-1 gap-4 mb-6">
            {roles.map((role) => {
              const Icon = role.icon;
              const isSelected = selectedRole === role.id;
              const isCurrent = role.id === currentRole;

              return (
                <motion.button
                  key={role.id}
                  onClick={() => !isLoading && setSelectedRole(role.id)}
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative text-left p-4 rounded-lg border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : isCurrent
                      ? 'border-green-500/30 bg-green-500/5'
                      : 'border-gray-600 hover:border-gray-500 bg-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div
                        className={`mt-1 p-2 rounded-lg ${
                          isSelected
                            ? 'bg-primary/20'
                            : isCurrent
                            ? 'bg-green-500/20'
                            : 'bg-gray-700/30'
                        }`}
                      >
                        <Icon
                          className={`w-5 h-5 ${
                            isSelected ? 'text-primary' : isCurrent ? 'text-green-400' : 'text-gray-400'
                          }`}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-white">{role.title}</h3>
                          {isCurrent && (
                            <span className="text-xs font-medium px-2 py-1 bg-green-500/20 text-green-400 rounded-full">
                              Current
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-400">{role.description}</p>
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        isSelected ? 'border-primary bg-primary' : 'border-gray-500'
                      }`}
                    >
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Info message */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg"
          >
            <p className="text-sm text-blue-300">
              Changing your role will update your profile type and may affect your access to certain features. Your previous progress will be preserved.
            </p>
          </motion.div>

          {/* Actions */}
          <div className="flex items-center gap-3 justify-end">
            <Button
              onClick={onClose}
              disabled={isLoading}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateRole}
              disabled={isLoading || selectedRole === currentRole}
            >
              {isLoading ? (
                <>
                  <Loader variant="spinner" size="sm" />
                  <span className="ml-2">Updating...</span>
                </>
              ) : (
                'Update Role'
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

export default UpdateRoleModal;
