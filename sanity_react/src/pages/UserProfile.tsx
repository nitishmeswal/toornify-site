import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, Mail, MessageSquare, Shield, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Loader } from '@/components/ui/Loader';
import { BackgroundEffects } from '@/components/BackgroundEffects';
import { P2PChat } from '@/components/P2PChat';
import { useAuth } from '@/context/AuthContext';
import { userService } from '@/lib/services';
import type { User } from '@/lib/services/user.service';
import { getAvatarUrl, getCharacterAvatar } from '@/lib/utils';

export function UserProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDirectChat, setShowDirectChat] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) {
        setError('Invalid user id');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const userData = await userService.getUserById(id);
        setUser(userData);
      } catch (err: any) {
        setError(err?.message || 'Failed to load user profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  const joinedOn = useMemo(() => {
    if (!user?.createdAt) return null;
    return new Date(user.createdAt).toLocaleDateString();
  }, [user?.createdAt]);

  const avatar = getAvatarUrl(user?.profilePic || user?.image, user?.username || user?.email || user?._id);
  const isOwnProfile = !!currentUser && !!user && (currentUser.id === user._id || currentUser._id === user._id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a1625] via-[#13111c] to-[#0f0b15] py-12 px-4 flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1625] via-[#13111c] to-[#0f0b15] py-12 px-4 relative overflow-hidden">
      <BackgroundEffects />
      <div className="max-w-[980px] mx-auto relative z-10">
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="border-[#3d3551] hover:border-purple-500"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>

        {error || !user ? (
          <Card className="bg-red-900/20 border-red-700">
            <CardContent className="pt-6">
              <p className="text-red-400 text-center">{error || 'User not found'}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card className="bg-gradient-to-b from-[#1f1a2e] to-[#18152a] border border-[#3d3551] backdrop-blur-sm">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center gap-5">
                  <div className="h-24 w-24 rounded-full overflow-hidden border border-[#4b4362] bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] flex items-center justify-center text-white text-3xl font-bold shrink-0">
                    <img
                      src={avatar}
                      alt={user.username}
                      className="h-full w-full object-cover"
                      onError={(event) => {
                        event.currentTarget.src = getCharacterAvatar(user.username || user.email || user._id || 'user');
                      }}
                    />
                  </div>

                  <div className="min-w-0">
                    <CardTitle className="text-white text-3xl truncate">{user.username}</CardTitle>
                    <CardDescription className="text-gray-400 mt-1 truncate">{user.email}</CardDescription>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="text-xs px-2 py-1 rounded-full border border-[#4b4362] text-gray-300">
                        {user.role || 'user'}
                      </span>
                      {!isOwnProfile && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowDirectChat((prev) => !prev)}
                          className="border-[#3d3551] hover:border-[#0EA5E9] hover:bg-[#0EA5E9]/10 text-gray-200"
                        >
                          <MessageSquare className="mr-2 h-4 w-4" />
                          {showDirectChat ? 'Hide Chat' : 'Message Player'}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {showDirectChat && !isOwnProfile && user?.username && (
              <Card className="bg-gradient-to-b from-[#1f1a2e] to-[#18152a] border border-[#3d3551] backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Direct Chat</CardTitle>
                  <CardDescription className="text-gray-400">Chat privately with @{user.username}</CardDescription>
                </CardHeader>
                <CardContent>
                  <P2PChat
                    showFloatingButton={false}
                    initialOpen
                    initialRecipient={user.username}
                  />
                </CardContent>
              </Card>
            )}

            <Card className="bg-gradient-to-b from-[#1f1a2e] to-[#18152a] border border-[#3d3551] backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Profile Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="p-3 rounded-lg border border-[#3d3551] bg-[#18152a]/70">
                    <p className="text-gray-400 mb-1 flex items-center gap-2"><UserIcon className="h-4 w-4" /> Username</p>
                    <p className="text-white break-all">{user.username}</p>
                  </div>
                  <div className="p-3 rounded-lg border border-[#3d3551] bg-[#18152a]/70">
                    <p className="text-gray-400 mb-1 flex items-center gap-2"><Mail className="h-4 w-4" /> Email</p>
                    <p className="text-white break-all">{user.email}</p>
                  </div>
                  <div className="p-3 rounded-lg border border-[#3d3551] bg-[#18152a]/70">
                    <p className="text-gray-400 mb-1 flex items-center gap-2"><Shield className="h-4 w-4" /> Role</p>
                    <p className="text-white">{user.role || 'user'}</p>
                  </div>
                  <div className="p-3 rounded-lg border border-[#3d3551] bg-[#18152a]/70">
                    <p className="text-gray-400 mb-1 flex items-center gap-2"><CalendarDays className="h-4 w-4" /> Joined</p>
                    <p className="text-white">{joinedOn || '-'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserProfile;
