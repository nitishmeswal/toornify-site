import { useState, useEffect } from 'react';
import { X, Shield, AlertCircle, Users } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Loader } from './ui/Loader';
import { teamService, gameService, userService } from '@/lib/services';
import { getAvatarUrl, getCharacterAvatar, getImageUrl } from '@/lib/utils';
import type { Game } from '@/lib/services/game.service';
import type { User } from '@/lib/services/user.service';
import type { Team } from '@/lib/services/team.service';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageCropper } from '@/components/ImageCropper';

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateTeamModal({ isOpen, onClose, onSuccess }: CreateTeamModalProps) {
  const [teamName, setTeamName] = useState('');
  const [selectedGame, setSelectedGame] = useState('');
  const [role, setRole] = useState('');
  const [rank, setRank] = useState('');
  const [server, setServer] = useState('');
  const [language, setLanguage] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [logo, setLogo] = useState('');
  const [logoPreview, setLogoPreview] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [uploadMethod, setUploadMethod] = useState<'file' | 'url'>('file');
  const [cropperImage, setCropperImage] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [games, setGames] = useState<Game[]>([]);
  const [players, setPlayers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [isLoadingGames, setIsLoadingGames] = useState(true);
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch games, players, and teams on mount
  useEffect(() => {
    if (isOpen) {
      fetchGames();
      fetchPlayersAndTeams();
    }
  }, [isOpen]);

  const fetchGames = async () => {
    try {
      setIsLoadingGames(true);
      const data = await gameService.getAll();
      setGames(data);
    } catch (err: any) {
      console.error('Failed to fetch games:', err);
    } finally {
      setIsLoadingGames(false);
    }
  };

  const fetchPlayersAndTeams = async () => {
    try {
      setIsLoadingPlayers(true);
      const [usersData, teamsData] = await Promise.all([
        userService.getPlayers(),
        teamService.getAll()
      ]);
      setPlayers(usersData);
      setTeams(teamsData);
    } catch (err: any) {
      console.error('Failed to fetch players and teams:', err);
    } finally {
      setIsLoadingPlayers(false);
    }
  };

  const isPlayerInTeam = (playerId: string): boolean => {
    return teams.some(team => 
      team.players?.some(player => player._id === playerId)
    );
  };

  const handlePlayerToggle = (playerId: string) => {
    if (selectedPlayers.includes(playerId)) {
      // Remove player
      setSelectedPlayers(selectedPlayers.filter(id => id !== playerId));
    } else {
      // Check if player is already in another team
      if (isPlayerInTeam(playerId)) {
        setError('This player is already in another team. Please contact them to leave their current team first.');
        return;
      }
      // Add player
      setSelectedPlayers([...selectedPlayers, playerId]);
      setError(null);
    }
  };


  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Image size should be less than 2MB');
      return;
    }

    // Create object URL for cropping
    const objectURL = URL.createObjectURL(file);
    setCropperImage(objectURL);
    setShowCropper(true);
    setLogoFile(file); // Keep the original file for later use
    setError(null);
  };

  const handleUrlChange = (url: string) => {
    setLogo(url);
    setLogoPreview(url);
  };

  const handleCropComplete = (croppedImage: string) => {
    setLogoPreview(croppedImage);
    setShowCropper(false);
    setCropperImage(null);
    setLogo(''); // clear any prior base64
    setError(null);
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setCropperImage(null);
    setLogoFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!teamName.trim()) {
      setError('Team name is required');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Prepare team data
      const teamData = {
        teamname: teamName.trim(),
        game: selectedGame || undefined,
        role: role.trim() || undefined,
        rank: rank.trim() || undefined,
        logo_url: logoUrl.trim() || undefined,
        server: server.trim() || undefined,
        language: language.trim() || undefined,
        players: selectedPlayers.length > 0 ? selectedPlayers : undefined,
      };

      // Handle logo upload - prioritize file upload over URL
      let logoFileToUpload: File | undefined;

      // If a file was uploaded (cropped or original), use it
      if (logoPreview && logoPreview.startsWith('data:')) {
        // Cropped image - convert base64 to File
        try {
          const response = await fetch(logoPreview);
          const blob = await response.blob();
          logoFileToUpload = new File([blob], 'team-logo.png', { type: 'image/png' });
        } catch (uploadErr: any) {
          console.error('Logo processing failed:', uploadErr);
          setError('Failed to process logo image');
          setIsSubmitting(false);
          return;
        }
      } else if (logoFile) {
        // Original file (not yet cropped)
        logoFileToUpload = logoFile;
      }

      // Create team with logo (if any)
      await teamService.createWithLogo(teamData, logoFileToUpload);

      // Reset form
      setTeamName('');
      setSelectedGame('');
      setRole('');
      setRank('');
      setServer('');
      setLanguage('');
      setLogo('');
      setLogoUrl('');
      setLogoPreview('');
      setLogoFile(null);
      setUploadMethod('file');
      setCropperImage(null);
      setShowCropper(false);
      setSelectedPlayers([]);
      
      // Call success callback
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Failed to create team:', err);
      setError(err.message || 'Failed to create team. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setTeamName('');
      setSelectedGame('');
      setRole('');
      setRank('');
      setServer('');
      setLanguage('');
      setLogo('');
      setLogoUrl('');
      if (logoPreview) URL.revokeObjectURL(logoPreview);
      setLogoPreview('');
      setLogoFile(null);
      setUploadMethod('file');
      setCropperImage(null);
      setShowCropper(false);
      setSelectedPlayers([]);
      setError(null);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-gradient-to-b from-[#1f1a2e] to-[#18152a] border border-[#3d3551] rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-[#3d3551]">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] flex items-center justify-center">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Create Team</h2>
                </div>
                <button
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 p-4 bg-red-900/20 border border-red-700 rounded-lg text-red-400 text-sm"
                  >
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p>{error}</p>
                  </motion.div>
                )}

                {/* Team Name */}
                <div className="space-y-2">
                  <label htmlFor="teamName" className="text-sm font-medium text-gray-200">
                    Team Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="teamName"
                    type="text"
                    placeholder="Enter team name"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    disabled={isSubmitting}
                    className="bg-[#18152a] border-[#3d3551] text-white placeholder-gray-500 focus:border-purple-500"
                    maxLength={50}
                    required
                  />
                  <p className="text-xs text-gray-500">
                    {teamName.length}/50 characters
                  </p>
                </div>

                {/* Game Selection */}
                <div className="space-y-2">
                  <label htmlFor="game" className="text-sm font-medium text-gray-200">
                    Game (Optional)
                  </label>
                  {isLoadingGames ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader size="sm" />
                    </div>
                  ) : (
                    <select
                      id="game"
                      value={selectedGame}
                      onChange={(e) => setSelectedGame(e.target.value)}
                      disabled={isSubmitting}
                      className="w-full px-3 py-2 bg-[#18152a] border border-[#3d3551] rounded-md text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">Select a game</option>
                      {games.map((game) => (
                        <option key={game._id} value={game._id}>
                          {game.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Role */}
                <div className="space-y-2">
                  <label htmlFor="role" className="text-sm font-medium text-gray-200">
                    Role (Optional)
                  </label>
                  <Input
                    id="role"
                    type="text"
                    placeholder="e.g., Competitive, Casual, Professional"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    disabled={isSubmitting}
                    className="bg-[#18152a] border-[#3d3551] text-white placeholder-gray-500 focus:border-purple-500"
                  />
                </div>

                {/* Rank */}
                <div className="space-y-2">
                  <label htmlFor="rank" className="text-sm font-medium text-gray-200">
                    Rank (Optional)
                  </label>
                  <Input
                    id="rank"
                    type="text"
                    placeholder="e.g., Diamond, Gold, Silver"
                    value={rank}
                    onChange={(e) => setRank(e.target.value)}
                    disabled={isSubmitting}
                    className="bg-[#18152a] border-[#3d3551] text-white placeholder-gray-500 focus:border-purple-500"
                  />
                </div>

                {/* Server */}
                <div className="space-y-2">
                  <label htmlFor="server" className="text-sm font-medium text-gray-200">
                    Server (Optional)
                  </label>
                  <Input
                    id="server"
                    type="text"
                    placeholder="e.g., NA, EU, Asia"
                    value={server}
                    onChange={(e) => setServer(e.target.value)}
                    disabled={isSubmitting}
                    className="bg-[#18152a] border-[#3d3551] text-white placeholder-gray-500 focus:border-purple-500"
                  />
                </div>

                {/* Language */}
                <div className="space-y-2">
                  <label htmlFor="language" className="text-sm font-medium text-gray-200">
                    Language (Optional)
                  </label>
                  <Input
                    id="language"
                    type="text"
                    placeholder="e.g., English, Spanish, Mandarin"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    disabled={isSubmitting}
                    className="bg-[#18152a] border-[#3d3551] text-white placeholder-gray-500 focus:border-purple-500"
                  />
                </div>

                {/* Logo URL (separate from uploaded logo) */}
                <div className="space-y-2">
                  <label htmlFor="logoUrl" className="text-sm font-medium text-gray-200">
                    Logo URL (Optional)
                  </label>
                  <Input
                    id="logoUrl"
                    type="url"
                    placeholder="https://example.com/team-logo.png"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    disabled={isSubmitting}
                    className="bg-[#18152a] border-[#3d3551] text-white placeholder-gray-500 focus:border-purple-500"
                  />
                  <p className="text-xs text-gray-500">
                    Alternative logo URL (different from upload)
                  </p>
                  {logoUrl.trim() && (
                    <div className="flex items-center gap-3 p-3 bg-[#18152a] border border-[#3d3551] rounded-lg">
                      <img
                        src={getImageUrl(logoUrl)}
                        alt="Team logo preview"
                        className="h-12 w-12 rounded-lg object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '';
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <span className="text-sm text-gray-400">Logo Preview</span>
                    </div>
                  )}
                </div>

                {/* Logo Upload */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-200">
                    Team Logo (Optional)
                  </label>
                  
                  {/* Upload Method Toggle */}
                  <div className="flex gap-2 mb-3">
                    <button
                      type="button"
                      onClick={() => {
                        setUploadMethod('file');
                        setLogo('');
                        setLogoPreview('');
                      }}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        uploadMethod === 'file'
                          ? 'bg-purple-600 text-white'
                          : 'bg-[#18152a] text-gray-400 hover:text-white border border-[#3d3551]'
                      }`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUploadMethod('url');
                        setLogo('');
                        setLogoPreview('');
                      }}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        uploadMethod === 'url'
                          ? 'bg-purple-600 text-white'
                          : 'bg-[#18152a] text-gray-400 hover:text-white border border-[#3d3551]'
                      }`}
                    >
                      Image URL
                    </button>
                  </div>

                  {uploadMethod === 'file' ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-center w-full">
                        <label
                          htmlFor="logo-upload"
                          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#3d3551] rounded-lg cursor-pointer bg-[#18152a] hover:bg-[#1f1a2e] transition-colors"
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            {logoPreview ? (
                              <img
                                src={logoPreview}
                                alt="Logo preview"
                                className="h-20 w-20 rounded-lg object-cover mb-2"
                              />
                            ) : (
                              <>
                                <Shield className="w-10 h-10 mb-2 text-gray-400" />
                                <p className="text-sm text-gray-400">
                                  <span className="font-semibold">Click to upload</span> or drag and drop
                                </p>
                                <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 2MB</p>
                              </>
                            )}
                          </div>
                          <input
                            id="logo-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            disabled={isSubmitting}
                            className="hidden"
                          />
                        </label>
                      </div>
                      {logoPreview && (
                        <button
                          type="button"
                          onClick={() => {
                            setLogo('');
                            setLogoPreview('');
                          }}
                          className="text-sm text-red-400 hover:text-red-300 transition-colors"
                        >
                          Remove Image
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Input
                        id="logo"
                        type="url"
                        placeholder="https://example.com/logo.png"
                        value={logo}
                        onChange={(e) => handleUrlChange(e.target.value)}
                        disabled={isSubmitting}
                        className="bg-[#18152a] border-[#3d3551] text-white placeholder-gray-500 focus:border-purple-500"
                      />
                      {logoPreview && (
                        <div className="flex items-center gap-3 p-3 bg-[#18152a] border border-[#3d3551] rounded-lg">
                          <img
                            src={logoPreview}
                            alt="Team logo preview"
                            className="h-12 w-12 rounded-lg object-cover"
                            onError={(e) => {
                              e.currentTarget.src = '';
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                          <span className="text-sm text-gray-400">Logo Preview</span>
                        </div>
                      )}
                      <p className="text-xs text-gray-500">
                        Provide a direct image URL
                      </p>
                    </div>
                  )}
                </div>

                {/* Player Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-200">
                    Add Players (Optional)
                  </label>
                  {isLoadingPlayers ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader size="sm" />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="max-h-48 overflow-y-auto bg-[#18152a] border border-[#3d3551] rounded-lg p-3 space-y-2">
                        {players.length === 0 ? (
                          <p className="text-sm text-gray-500 text-center py-2">No players available</p>
                        ) : (
                          players.map((player) => {
                            const isInTeam = isPlayerInTeam(player._id);
                            const isSelected = selectedPlayers.includes(player._id);
                            
                            return (
                              <label
                                key={player._id}
                                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all ${
                                  isInTeam && !isSelected
                                    ? 'bg-red-900/20 border border-red-700/50 opacity-60 cursor-not-allowed'
                                    : isSelected
                                    ? 'bg-purple-600/20 border border-purple-500'
                                    : 'bg-[#1f1a2e] hover:bg-[#252030] border border-transparent'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handlePlayerToggle(player._id)}
                                  disabled={isSubmitting || (isInTeam && !isSelected)}
                                  className="w-4 h-4 rounded border-[#3d3551] text-purple-600 focus:ring-purple-500 focus:ring-offset-0 disabled:opacity-50"
                                />
                                <div className="flex items-center gap-2 flex-1">
                                  <div className="relative">
                                    <img
                                      src={getAvatarUrl(player.profilePic || player.image, player.username || player._id)}
                                      alt={player.username}
                                      className="w-8 h-8 rounded-full object-cover"
                                      onError={(e) => {
                                        e.currentTarget.src = getCharacterAvatar(player.username || player._id || 'player');
                                      }}
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-white">{player.username}</p>
                                    <p className="text-xs text-gray-500">{player.email}</p>
                                  </div>
                                  {isInTeam && !isSelected && (
                                    <span className="text-xs text-red-400 font-medium">In Team</span>
                                  )}
                                </div>
                              </label>
                            );
                          })
                        )}
                      </div>
                      {selectedPlayers.length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Users className="w-4 h-4" />
                          <span>{selectedPlayers.length} player{selectedPlayers.length > 1 ? 's' : ''} selected</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="flex-1 border-[#3d3551] hover:border-purple-500"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || !teamName.trim()}
                    className="flex-1 bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] hover:from-[#A78BFA] hover:to-[#7C3AED] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader size="sm" className="mr-2" />
                        Creating...
                      </>
                    ) : (
                      'Create Team'
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}

      {/* Image Cropper Modal */}
      {showCropper && cropperImage && (
        <ImageCropper
          imageSrc={cropperImage}
          isCircular={true}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
    </AnimatePresence>
  );
}
