import { useState, useEffect } from "react";
import { Search, Users as UsersIcon, Plus, Shield, Crown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Loader } from "@/components/ui/Loader";
import { teamService } from "@/lib/services";
import type { Team } from "@/lib/services/team.service";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { BackgroundEffects } from "@/components/BackgroundEffects";
import { CreateTeamModal } from "@/components/CreateTeamModal";
import { getPreferredTeamLogo, getAvatarUrl, getCharacterAvatar } from "@/lib/utils";

export function Teams() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showUserTeamsOnly, setShowUserTeamsOnly] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    fetchTeams();
  }, [showUserTeamsOnly]);

  const fetchTeams = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = showUserTeamsOnly && user
        ? await teamService.getUserTeams()
        : await teamService.getAll();
      setTeams(data);
    } catch (err: any) {
      console.error('Failed to fetch teams:', err);
      setError(err.message || 'Failed to load teams');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTeams = teams.filter(team =>
    team.teamname.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateTeam = () => {
    if (!user) {
      navigate('/sign-in', { state: { from: '/teams' } });
      return;
    }
    setIsCreateModalOpen(true);
  };

  const handleCreateSuccess = () => {
    fetchTeams();
    setIsCreateModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1625] via-[#13111c] to-[#0f0b15] py-12 px-4 relative overflow-hidden">
      <BackgroundEffects />
      <div className="max-w-[1920px] mx-auto relative z-10">
        {/* Header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Teams
            </h1>
            <p className="text-gray-400 text-lg">
              Join a team or create your own
            </p>
          </div>
          <Button
            onClick={handleCreateTeam}
            className="bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] hover:from-[#A78BFA] hover:to-[#7C3AED]"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Team
          </Button>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search teams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-[#18152a] border border-[#3d3551] rounded text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all backdrop-blur-sm"
            />
          </div>
          {isAuthenticated ? (
            <Button
              variant={showUserTeamsOnly ? "default" : "outline"}
              onClick={() => setShowUserTeamsOnly(!showUserTeamsOnly)}
              className={showUserTeamsOnly ? "bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9]" : "border-[#3d3551]"}
            >
              <Shield className="mr-2 h-4 w-4" />
              My Teams
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => navigate('/sign-in', { state: { from: '/teams' } })}
              className="border-[#3d3551] hover:border-purple-500"
            >
              <Shield className="mr-2 h-4 w-4" />
              Sign in to see your teams
            </Button>
          )}
        </div>

        {/* Teams Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader size="lg" />
          </div>
        ) : error ? (
          <Card className="bg-red-900/20 border-red-700">
            <CardContent className="pt-6">
              <p className="text-red-400 text-center">{error}</p>
              <Button
                onClick={fetchTeams}
                variant="outline"
                className="mt-4 mx-auto block"
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : filteredTeams.length === 0 ? (
          <div className="text-center py-20">
            <UsersIcon className="h-20 w-20 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg mb-4">
              {searchTerm
                ? 'No teams found matching your search'
                : showUserTeamsOnly
                ? "You haven't joined any teams yet"
                : 'No teams available'}
            </p>
            {!showUserTeamsOnly && (
              <Button
                onClick={handleCreateTeam}
                className="bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] hover:from-[#A78BFA] hover:to-[#7C3AED]"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Team
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeams.map((team, index) => (
              <TeamCard
                key={team._id}
                team={team}
                index={index}
                currentUserId={user?.id}
                onViewTeam={() => navigate(`/teams/${team._id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Team Modal */}
      <CreateTeamModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}

function TeamCard({
  team,
  index,
  currentUserId,
  onViewTeam,
}: {
  team: Team;
  index: number;
  currentUserId?: string;
  onViewTeam: () => void;
}) {
  const isOwner = team.owner === currentUserId;
  const isMember = team.players.some(player => player._id === currentUserId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card
        onClick={onViewTeam}
        className="bg-gradient-to-b from-[#1f1a2e] to-[#18152a] border border-[#3d3551] hover:border-purple-500/50 transition-all cursor-pointer h-full group backdrop-blur-sm"
      >
        <CardHeader>
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="flex items-center gap-3 flex-1">
              {(() => {
                const logoSrc = getPreferredTeamLogo(team);
                return (
                  <>
                    <img
                      src={logoSrc || ''}
                      alt={team.teamname}
                      className="h-12 w-12 rounded-lg object-cover"
                      style={{ display: logoSrc ? 'block' : 'none' }}
                      onLoad={(e) => {
                        const fallback = (e.currentTarget.nextElementSibling as HTMLElement | null);
                        if (fallback) fallback.style.display = 'none';
                      }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const fallback = (e.currentTarget.nextElementSibling as HTMLElement | null);
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                    <div
                      className="h-12 w-12 rounded-lg bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] flex items-center justify-center"
                      style={{ display: logoSrc ? 'none' : 'flex' }}
                    >
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                  </>
                );
              })()}
              <div className="flex-1 min-w-0">
                <CardTitle className="text-white group-hover:text-purple-400 transition-colors truncate">
                  {team.teamname}
                </CardTitle>
                {team.game && (
                  <CardDescription className="text-gray-400 text-sm">
                    {team.game.name}
                  </CardDescription>
                )}
              </div>
            </div>
            {isOwner && (
              <div className="flex-shrink-0" title="Team Owner">
                <Crown className="h-5 w-5 text-yellow-500" />
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-400">
              <UsersIcon className="h-4 w-4" />
              <span>{team.players?.length || 0} members</span>
            </div>
            {isMember && (
              <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full border border-green-500/30">
                Member
              </span>
            )}
          </div>

          {team.players && team.players.length > 0 && (
            <div className="flex -space-x-2">
              {team.players.slice(0, 5).map((player, idx) => {
                const picSrc = getAvatarUrl(player.profilePic || player.image, player.username || player._id || idx);
                return (
                  <div
                    key={idx}
                    className="relative h-8 w-8 rounded-full border-2 border-[#1f1a2e] overflow-hidden"
                    title={player.username}
                  >
                    <img
                      src={picSrc}
                      alt={player.username}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = getCharacterAvatar(player.username || player._id || idx);
                      }}
                    />
                  </div>
                );
              })}
              {team.players.length > 5 && (
                <div className="h-8 w-8 rounded-full bg-[#18152a] flex items-center justify-center text-gray-300 text-xs font-medium border-2 border-[#1f1a2e]">
                  +{team.players.length - 5}
                </div>
              )}
            </div>
          )}

          <Button
            variant="outline"
            onClick={(event) => {
              event.stopPropagation();
              onViewTeam();
            }}
            className="w-full border-[#3d3551] hover:border-purple-500 hover:bg-purple-500/10 transition-all"
          >
            View Team
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
