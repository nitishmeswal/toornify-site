import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Crown, Shield, Users as UsersIcon, Mail, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Loader } from '@/components/ui/Loader';
import { BackgroundEffects } from '@/components/BackgroundEffects';
import { teamService } from '@/lib/services';
import type { Team } from '@/lib/services/team.service';
import { getAvatarUrl, getCharacterAvatar, getPreferredTeamLogo } from '@/lib/utils';

export function TeamView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [team, setTeam] = useState<Team | null>(null);

  useEffect(() => {
    const fetchTeam = async () => {
      if (!id) {
        setError('Invalid team id');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const allTeams = await teamService.getAll();
        const foundTeam = allTeams.find((item) => item._id === id) ?? null;

        if (!foundTeam) {
          setError('Team not found');
          setTeam(null);
          return;
        }

        setTeam(foundTeam);
      } catch (err: any) {
        setError(err?.message || 'Failed to load team');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeam();
  }, [id]);

  const createdDate = useMemo(() => {
    if (!team?.createdAt) return null;
    return new Date(team.createdAt).toLocaleDateString();
  }, [team?.createdAt]);

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
      <div className="max-w-[1200px] mx-auto relative z-10">
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => navigate('/teams')}
            className="border-[#3d3551] hover:border-purple-500"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Teams
          </Button>
        </div>

        {error || !team ? (
          <Card className="bg-red-900/20 border-red-700">
            <CardContent className="pt-6">
              <p className="text-red-400 text-center">{error || 'Team not found'}</p>
              <Button onClick={() => navigate('/teams')} className="mt-4 mx-auto block">
                Go to Teams
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card className="bg-gradient-to-b from-[#1f1a2e] to-[#18152a] border border-[#3d3551] backdrop-blur-sm">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    {(() => {
                      const logoSrc = getPreferredTeamLogo(team);
                      return (
                        <>
                          <img
                            src={logoSrc || ''}
                            alt={team.teamname}
                            className="h-20 w-20 rounded-xl object-cover"
                            style={{ display: logoSrc ? 'block' : 'none' }}
                            onError={(event) => {
                              event.currentTarget.style.display = 'none';
                              const fallback = event.currentTarget.nextElementSibling as HTMLElement | null;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                          <div
                            className="h-20 w-20 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] flex items-center justify-center"
                            style={{ display: logoSrc ? 'none' : 'flex' }}
                          >
                            <Shield className="h-8 w-8 text-white" />
                          </div>
                        </>
                      );
                    })()}
                    <div className="min-w-0">
                      <CardTitle className="text-white text-3xl truncate">{team.teamname}</CardTitle>
                      <CardDescription className="text-gray-400 mt-1">
                        {team.game?.name || 'Game not specified'}
                      </CardDescription>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <UsersIcon className="h-4 w-4" />
                      <span>{team.players?.length || 0} members</span>
                    </div>
                    {createdDate && (
                      <div className="flex items-center gap-1.5">
                        <CalendarDays className="h-4 w-4" />
                        <span>{createdDate}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card className="bg-gradient-to-b from-[#1f1a2e] to-[#18152a] border border-[#3d3551] backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Players</CardTitle>
                <CardDescription className="text-gray-400">Current team roster</CardDescription>
              </CardHeader>
              <CardContent>
                {!team.players?.length ? (
                  <p className="text-gray-400">No players yet</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {team.players.map((player) => {
                      const avatar = getAvatarUrl(player.profilePic || player.image, player.username || player._id);
                      const isOwner = player._id === team.owner;

                      return (
                        <div
                          key={player._id}
                          onClick={() => navigate(`/users/${player._id}`)}
                          className="flex items-center justify-between p-3 rounded-lg border border-[#3d3551] bg-[#18152a]/70"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="h-10 w-10 rounded-full overflow-hidden border border-[#3d3551] bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] flex items-center justify-center text-white text-sm font-medium shrink-0">
                              <img
                                src={avatar}
                                alt={player.username}
                                className="h-full w-full object-cover"
                                onError={(event) => {
                                  event.currentTarget.src = getCharacterAvatar(player.username || player._id);
                                }}
                              />
                            </div>

                            <div className="min-w-0">
                              <p className="text-white text-sm font-medium truncate">{player.username}</p>
                              <p className="text-gray-400 text-xs flex items-center gap-1 truncate">
                                <Mail className="h-3 w-3" />
                                <span className="truncate">{player.email}</span>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {isOwner && <Crown className="h-4 w-4 text-yellow-500" />}
                            <span className="text-xs px-2 py-1 rounded-full border border-[#4b4362] text-gray-300">
                              {player.role}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export default TeamView;
