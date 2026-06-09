import { useState, useEffect } from 'react';
import { X, Calendar, Trophy, Users, DollarSign, Globe, Lock, Info } from 'lucide-react';
import { Button } from './ui/Button';
import { ImageCropper } from '@/components/ImageCropper';
import { gameService } from '@/lib/services';
import type { Game } from '@/lib/services';
import { toast } from 'react-hot-toast';

interface CreateTournamentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TournamentFormData) => void;
}

export interface TournamentFormData {
  tournamentName: string;
  gameId: string;
  game?: string;
  gameImage?: string;
  entryFee?: number;
  gameType: 'SOLO' | 'DUO' | 'SQUAD';
  tournamentFormat: string;
  tournamentStartDate: string;
  registrationEndDate: string;
  tournamentEndDate?: string;
  maxTeams: number;
  minTeams: number;
  maxTeamMembers: number;
  minTeamMembers: number;
  tournamentVisibility: 'public' | 'private';
  prizeConfig: Array<{
    position: number;
    prizeType?: 'money' | 'custom';
    amount: string;
    currency: string;
    customPrize?: string;
    customPrizeValue?: string;
  }>;
  rules: string[];
  sponsors?: string[];
  description?: string;
  selectedPlatform?: string;
  selectedTimezone?: string;
  email?: string;
  tournamentIcon?: File | null;
  tournamentBanner?: File | null;
}

const GAME_TYPES = [
  { value: 'SOLO', label: 'Solo', description: 'Individual players' },
  { value: 'DUO', label: 'Duo', description: '2 players per team' },
  { value: 'SQUAD', label: 'Squad', description: '3+ players per team' },
];

const TOURNAMENT_FORMATS = [
  { value: 'single_elimination', label: 'Single Elimination' },
  { value: 'double_elimination', label: 'Double Elimination' },
  { value: 'round_robin', label: 'Round Robin' },
  { value: 'swiss', label: 'Swiss System' },
  { value: 'battle_royale', label: 'Battle Royale' },
];

const PLATFORMS = ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch', 'Mobile', 'Cross-Platform'];
const TIMEZONE_OPTIONS = [
  { country: 'Global', flag: '🌍', timezone: 'UTC', offset: 'UTC+00:00' },
  { country: 'United Kingdom', flag: '🇬🇧', timezone: 'GMT', offset: 'UTC+00:00' },
  { country: 'United States (East)', flag: '🇺🇸', timezone: 'EST', offset: 'UTC-05:00' },
  { country: 'United States (Central)', flag: '🇺🇸', timezone: 'CST', offset: 'UTC-06:00' },
  { country: 'United States (Pacific)', flag: '🇺🇸', timezone: 'PST', offset: 'UTC-08:00' },
  { country: 'Germany', flag: '🇩🇪', timezone: 'CET', offset: 'UTC+01:00' },
  { country: 'India', flag: '🇮🇳', timezone: 'IST', offset: 'UTC+05:30' },
  { country: 'Japan', flag: '🇯🇵', timezone: 'JST', offset: 'UTC+09:00' },
  { country: 'Australia', flag: '🇦🇺', timezone: 'AEST', offset: 'UTC+10:00' },
];
const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'AUD'];

export function CreateTournamentModal({ isOpen, onClose, onSubmit }: CreateTournamentModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [games, setGames] = useState<Game[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [cropperImage, setCropperImage] = useState<string | null>(null);
  const [cropperMode, setCropperMode] = useState<'icon' | 'banner' | null>(null);
  const [previewUrls, setPreviewUrls] = useState({
    tournamentIcon: null as string | null,
    tournamentBanner: null as string | null,
  });
  const [formData, setFormData] = useState<TournamentFormData>({
    tournamentName: '',
    gameId: '',
    entryFee: 0,
    gameType: 'SOLO',
    tournamentFormat: 'single_elimination',
    tournamentStartDate: '',
    registrationEndDate: '',
    maxTeams: 16,
    minTeams: 4,
    maxTeamMembers: 1,
    minTeamMembers: 1,
    tournamentVisibility: 'public',
    prizeConfig: [
      { position: 1, prizeType: 'money', amount: '', currency: 'USD', customPrize: '', customPrizeValue: '' },
      { position: 2, prizeType: 'money', amount: '', currency: 'USD', customPrize: '', customPrizeValue: '' },
      { position: 3, prizeType: 'money', amount: '', currency: 'USD', customPrize: '', customPrizeValue: '' },
    ],
    rules: [''],
    sponsors: [''],
    selectedPlatform: 'Cross-Platform',
    selectedTimezone: 'UTC',
  });

  useEffect(() => {
    if (isOpen) {
      fetchGames();
    }
  }, [isOpen]);

  useEffect(() => {
    // Auto-adjust team members based on game type
    if (formData.gameType === 'SOLO') {
      setFormData(prev => ({ ...prev, maxTeamMembers: 1, minTeamMembers: 1 }));
    } else if (formData.gameType === 'DUO') {
      setFormData(prev => ({ ...prev, maxTeamMembers: 2, minTeamMembers: 2 }));
    } else if (formData.gameType === 'SQUAD') {
      setFormData(prev => ({ 
        ...prev, 
        maxTeamMembers: prev.maxTeamMembers < 3 ? 4 : prev.maxTeamMembers,
        minTeamMembers: 3 
      }));
    }
  }, [formData.gameType]);

  const fetchGames = async () => {
    try {
      const response = await gameService.getAll();
      setGames(response);
    } catch (error) {
      console.error('Failed to fetch games:', error);
      toast.error('Unable to load games. Please try again.');
    }
  };

  const validateCurrentStep = () => {
    if (currentStep === 1) {
      if (!formData.tournamentName.trim()) {
        setFormError('Tournament name is required.');
        return false;
      }
      if (!formData.gameId) {
        setFormError('Please select a game.');
        return false;
      }
      if (!formData.tournamentFormat) {
        setFormError('Please select a tournament format.');
        return false;
      }
    }

    if (currentStep === 2) {
      if (!formData.registrationEndDate || !formData.tournamentStartDate || !formData.tournamentEndDate) {
        setFormError('Please complete all date fields.');
        return false;
      }

      const regEndDate = new Date(formData.registrationEndDate);
      const startDate = new Date(formData.tournamentStartDate);
      const endDate = new Date(formData.tournamentEndDate);

      if (startDate <= regEndDate) {
        setFormError('Tournament start date must be after registration end date.');
        return false;
      }

      if (endDate <= startDate) {
        setFormError('Tournament end date must be after tournament start date.');
        return false;
      }

      if (formData.minTeams < 2 || formData.maxTeams < formData.minTeams) {
        setFormError('Team limits are invalid.');
        return false;
      }

      if (formData.gameType === 'SQUAD' && formData.maxTeamMembers < formData.minTeamMembers) {
        setFormError('Team member limits are invalid.');
        return false;
      }
    }

    setFormError(null);
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate dates
    const regEndDate = new Date(formData.registrationEndDate);
    const startDate = new Date(formData.tournamentStartDate);
    const endDate = formData.tournamentEndDate ? new Date(formData.tournamentEndDate) : null;
    
    if (startDate <= regEndDate) {
      setFormError('Tournament start date must be after registration end date.');
      return;
    }

    if (endDate && endDate <= startDate) {
      setFormError('Tournament end date must be after tournament start date.');
      return;
    }

    // Filter out empty rules and sponsors
    const cleanedData = {
      ...formData,
      rules: formData.rules.filter(rule => rule.trim() !== ''),
      sponsors: (formData.sponsors || []).filter(sponsor => sponsor.trim() !== ''),
      prizeConfig: formData.prizeConfig.filter(
        prize =>
          prize.prizeType === 'custom'
            ? !!(prize.customPrize && prize.customPrize.trim() !== '') && !!(prize.customPrizeValue && prize.customPrizeValue.trim() !== '')
            : !!(prize.amount && prize.amount.trim() !== '')
      ),
    };

    onSubmit(cleanedData);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setFormError(null);
    setCurrentStep(1);
    setCropperImage(null);
    setCropperMode(null);
    setPreviewUrls({
      tournamentIcon: null,
      tournamentBanner: null,
    });
    setFormData({
      tournamentName: '',
      gameId: '',
      entryFee: 0,
      gameType: 'SOLO',
      tournamentFormat: 'single_elimination',
      tournamentStartDate: '',
      registrationEndDate: '',
      maxTeams: 16,
      minTeams: 4,
      maxTeamMembers: 1,
      minTeamMembers: 1,
      tournamentVisibility: 'public',
      prizeConfig: [
        { position: 1, prizeType: 'money', amount: '', currency: 'USD', customPrize: '', customPrizeValue: '' },
        { position: 2, prizeType: 'money', amount: '', currency: 'USD', customPrize: '', customPrizeValue: '' },
        { position: 3, prizeType: 'money', amount: '', currency: 'USD', customPrize: '', customPrizeValue: '' },
      ],
      rules: [''],
      sponsors: [''],
      selectedPlatform: 'Cross-Platform',
      selectedTimezone: 'UTC',
    });
  };

  const addRule = () => {
    setFormData(prev => ({ ...prev, rules: [...prev.rules, ''] }));
  };

  const updateRule = (index: number, value: string) => {
    const newRules = [...formData.rules];
    newRules[index] = value;
    setFormData(prev => ({ ...prev, rules: newRules }));
  };

  const removeRule = (index: number) => {
    setFormData(prev => ({ ...prev, rules: prev.rules.filter((_, i) => i !== index) }));
  };

  const addSponsor = () => {
    setFormData(prev => ({ ...prev, sponsors: [...(prev.sponsors || []), ''] }));
  };

  const updateSponsor = (index: number, value: string) => {
    const newSponsors = [...(formData.sponsors || [])];
    newSponsors[index] = value;
    setFormData(prev => ({ ...prev, sponsors: newSponsors }));
  };

  const removeSponsor = (index: number) => {
    setFormData(prev => ({ ...prev, sponsors: (prev.sponsors || []).filter((_, i) => i !== index) }));
  };

  const validateImageFile = (file: File | null) => {
    if (!file) return false;
    if (!file.type.startsWith('image/')) return false;
    if (file.size === 0) return false;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return false;
    }
    return true;
  };

  const fileToDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const dataURLToFile = (dataUrl: string, filename: string): File => {
    const arr = dataUrl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const applyCroppedImage = (croppedImage: string) => {
    if (!cropperMode) return;

    const fileName = cropperMode === 'icon' ? `tournament-icon-${Date.now()}.jpg` : `tournament-banner-${Date.now()}.jpg`;
    const croppedFile = dataURLToFile(croppedImage, fileName);

    if (cropperMode === 'icon') {
      setFormData(prev => ({ ...prev, tournamentIcon: croppedFile }));
      setPreviewUrls(prev => ({ ...prev, tournamentIcon: croppedImage }));
    } else {
      setFormData(prev => ({ ...prev, tournamentBanner: croppedFile }));
      setPreviewUrls(prev => ({ ...prev, tournamentBanner: croppedImage }));
    }

    setCropperImage(null);
    setCropperMode(null);
  };

  const handleIconUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (validateImageFile(file)) {
      fileToDataURL(file)
        .then((imageSrc) => {
          setCropperImage(imageSrc);
          setCropperMode('icon');
        })
        .catch(() => toast.error('Unable to open cropper for icon image.'));
    } else {
      toast.error('Please select a valid image file (max 5MB)');
    }

    event.target.value = '';
  };

  const handleBannerUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (validateImageFile(file)) {
      fileToDataURL(file)
        .then((imageSrc) => {
          setCropperImage(imageSrc);
          setCropperMode('banner');
        })
        .catch(() => toast.error('Unable to open cropper for banner image.'));
    } else {
      toast.error('Please select a valid image file (max 5MB)');
    }

    event.target.value = '';
  };

  const addPrize = () => {
    const newPosition = formData.prizeConfig.length + 1;
    setFormData(prev => ({
      ...prev,
      prizeConfig: [...prev.prizeConfig, { position: newPosition, prizeType: 'money', amount: '', currency: 'USD', customPrize: '', customPrizeValue: '' }],
    }));
  };

  const updatePrize = (index: number, field: 'prizeType' | 'amount' | 'currency' | 'customPrize' | 'customPrizeValue', value: string) => {
    const newPrizes = [...formData.prizeConfig];
    newPrizes[index] = { ...newPrizes[index], [field]: value };
    setFormData(prev => ({ ...prev, prizeConfig: newPrizes }));
  };

  const updatePrizeType = (index: number, prizeType: 'money' | 'custom') => {
    const newPrizes = [...formData.prizeConfig];
    newPrizes[index] = {
      ...newPrizes[index],
      prizeType,
      amount: prizeType === 'money' ? newPrizes[index].amount : '',
      customPrize: prizeType === 'custom' ? (newPrizes[index].customPrize || '') : '',
      customPrizeValue: prizeType === 'custom' ? (newPrizes[index].customPrizeValue || '') : '',
    };
    setFormData(prev => ({ ...prev, prizeConfig: newPrizes }));
  };

  const removePrize = (index: number) => {
    setFormData(prev => ({
      ...prev,
      prizeConfig: prev.prizeConfig.filter((_, i) => i !== index),
    }));
  };

  if (!isOpen) {
    return null;
  }

  const totalSteps = 4;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-gradient-to-b from-[#1f1a2e] to-[#18152a] border border-[#3d3551] rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-b from-[#1f1a2e] to-[#18152a] border-b border-[#3d3551] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Create Tournament</h2>
            <button
              onClick={() => {
                onClose();
                resetForm();
              }}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex-1">
                <div className="flex items-center gap-2">
                  <div
                    className={`h-2 flex-1 rounded-full transition-all ${
                      step <= currentStep
                        ? 'bg-gradient-to-r from-purple-500 to-purple-600'
                        : 'bg-[#3d3551]'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-gray-400">Basic Info</span>
            <span className="text-xs text-gray-400">Settings</span>
            <span className="text-xs text-gray-400">Prizes</span>
            <span className="text-xs text-gray-400">Rules & Sponsors</span>
          </div>
          {formError && (
            <div className="mt-3 text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded px-3 py-2">
              {formError}
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white mb-4">Basic Information</h3>

              {/* Image Uploads */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="icon-upload" className="block text-sm font-semibold text-gray-300 mb-2">
                    Tournament Icon
                  </label>
                  <label htmlFor="icon-upload" className="block">
                    <div className="h-40 w-40 mx-auto bg-[#13111c] border-2 border-dashed border-[#3d3551] hover:border-purple-500 flex flex-col items-center justify-center cursor-pointer rounded-full relative overflow-hidden transition-colors">
                      {previewUrls.tournamentIcon ? (
                        <img
                          src={previewUrls.tournamentIcon}
                          alt="Tournament Icon"
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      ) : (
                        <>
                          <span className="text-3xl mb-2 text-gray-400">+</span>
                          <span className="text-sm text-gray-400">Add Icon</span>
                        </>
                      )}
                    </div>
                  </label>
                  <input
                    id="icon-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleIconUpload}
                  />
                </div>
                <div>
                  <label htmlFor="banner-upload" className="block text-sm font-semibold text-gray-300 mb-2">
                    Tournament Banner
                  </label>
                  <label htmlFor="banner-upload" className="block">
                    <div className="h-40 w-40 mx-auto bg-[#13111c] border-2 border-dashed border-[#3d3551] hover:border-purple-500 flex flex-col items-center justify-center cursor-pointer rounded-full relative overflow-hidden transition-colors">
                      {previewUrls.tournamentBanner ? (
                        <img
                          src={previewUrls.tournamentBanner}
                          alt="Tournament Banner"
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      ) : (
                        <>
                          <span className="text-3xl mb-2 text-gray-400">+</span>
                          <span className="text-sm text-gray-400">Add Banner</span>
                        </>
                      )}
                    </div>
                  </label>
                  <input
                    id="banner-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleBannerUpload}
                  />
                </div>
              </div>

              {/* Tournament Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Tournament Name *
                </label>
                <input
                  type="text"
                  value={formData.tournamentName}
                  onChange={(e) => setFormData(prev => ({ ...prev, tournamentName: e.target.value }))}
                  placeholder="e.g., Spring Championship 2026"
                  className="w-full px-4 py-3 bg-[#13111c] border border-[#3d3551] rounded text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Briefly describe your tournament..."
                  className="w-full px-4 py-3 bg-[#13111c] border border-[#3d3551] rounded text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 resize-none"
                />
              </div>

              {/* Game Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Select Game *
                </label>
                <select
                  value={formData.gameId}
                  onChange={(e) => {
                    const selectedGame = games.find(g => (g._id || g.id) === e.target.value);
                    setFormData(prev => ({ 
                      ...prev, 
                      gameId: e.target.value,
                      game: selectedGame?.name || '',
                      gameImage: selectedGame?.gameBannerPhoto || selectedGame?.image || ''
                    }));
                  }}
                  className="w-full px-4 py-3 bg-[#13111c] border border-[#3d3551] rounded text-white focus:outline-none focus:border-purple-500"
                  required
                >
                  <option value="">Choose a game...</option>
                  {games.map((game) => (
                    <option key={game._id || game.id} value={game._id || game.id}>
                      {game.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Game Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Game Type *
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {GAME_TYPES.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, gameType: type.value as any }))}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        formData.gameType === type.value
                          ? 'bg-purple-500/20 border-purple-500 text-white'
                          : 'bg-[#13111c] border-[#3d3551] text-gray-400 hover:border-purple-500/50'
                      }`}
                    >
                      <Users className="h-5 w-5 mx-auto mb-2" />
                      <p className="font-semibold text-sm">{type.label}</p>
                      <p className="text-xs mt-1 opacity-70">{type.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tournament Format */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Tournament Format *
                </label>
                <select
                  value={formData.tournamentFormat}
                  onChange={(e) => setFormData(prev => ({ ...prev, tournamentFormat: e.target.value }))}
                  className="w-full px-4 py-3 bg-[#13111c] border border-[#3d3551] rounded text-white focus:outline-none focus:border-purple-500"
                  required
                >
                  {TOURNAMENT_FORMATS.map((format) => (
                    <option key={format.value} value={format.value}>
                      {format.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Settings */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white mb-4">Tournament Settings</h3>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    <Calendar className="inline h-4 w-4 mr-1" />
                    Registration End Date *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.registrationEndDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, registrationEndDate: e.target.value }))}
                    className="w-full px-4 py-3 bg-[#13111c] border border-[#3d3551] rounded text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    <Calendar className="inline h-4 w-4 mr-1" />
                    Tournament Start Date *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.tournamentStartDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, tournamentStartDate: e.target.value }))}
                    className="w-full px-4 py-3 bg-[#13111c] border border-[#3d3551] rounded text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
              </div>

              {/* Tournament End Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Tournament End Date *
                </label>
                <input
                  type="datetime-local"
                  value={formData.tournamentEndDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, tournamentEndDate: e.target.value }))}
                  className="w-full px-4 py-3 bg-[#13111c] border border-[#3d3551] rounded text-white focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              {/* Team Limits */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Minimum Teams *
                  </label>
                  <input
                    type="number"
                    min="2"
                    value={formData.minTeams}
                    onChange={(e) => setFormData(prev => ({ ...prev, minTeams: Number(e.target.value) }))}
                    className="w-full px-4 py-3 bg-[#13111c] border border-[#3d3551] rounded text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Maximum Teams *
                  </label>
                  <input
                    type="number"
                    min={formData.minTeams}
                    value={formData.maxTeams}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxTeams: Number(e.target.value) }))}
                    className="w-full px-4 py-3 bg-[#13111c] border border-[#3d3551] rounded text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
              </div>

              {/* Team Members (for Squad) */}
              {formData.gameType === 'SQUAD' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Min Team Members *
                    </label>
                    <input
                      type="number"
                      min="3"
                      value={formData.minTeamMembers}
                      onChange={(e) => setFormData(prev => ({ ...prev, minTeamMembers: Number(e.target.value) }))}
                      className="w-full px-4 py-3 bg-[#13111c] border border-[#3d3551] rounded text-white focus:outline-none focus:border-purple-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Max Team Members *
                    </label>
                    <input
                      type="number"
                      min={formData.minTeamMembers}
                      value={formData.maxTeamMembers}
                      onChange={(e) => setFormData(prev => ({ ...prev, maxTeamMembers: Number(e.target.value) }))}
                      className="w-full px-4 py-3 bg-[#13111c] border border-[#3d3551] rounded text-white focus:outline-none focus:border-purple-500"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Platform & Timezone */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Platform
                  </label>
                  <select
                    value={formData.selectedPlatform}
                    onChange={(e) => setFormData(prev => ({ ...prev, selectedPlatform: e.target.value }))}
                    className="w-full px-4 py-3 bg-[#13111c] border border-[#3d3551] rounded text-white focus:outline-none focus:border-purple-500"
                  >
                    {PLATFORMS.map((platform) => (
                      <option key={platform} value={platform}>
                        {platform}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Timezone
                  </label>
                  <select
                    value={formData.selectedTimezone}
                    onChange={(e) => setFormData(prev => ({ ...prev, selectedTimezone: e.target.value }))}
                    className="w-full px-4 py-3 bg-[#13111c] border border-[#3d3551] rounded text-white focus:outline-none focus:border-purple-500"
                  >
                    {TIMEZONE_OPTIONS.map((tz) => (
                      <option key={tz.timezone} value={tz.timezone}>
                        {tz.country} {tz.flag} ({tz.timezone}) [{tz.offset}]
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Visibility */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Tournament Visibility *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, tournamentVisibility: 'public' }))}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      formData.tournamentVisibility === 'public'
                        ? 'bg-purple-500/20 border-purple-500 text-white'
                        : 'bg-[#13111c] border-[#3d3551] text-gray-400 hover:border-purple-500/50'
                    }`}
                  >
                    <Globe className="h-5 w-5 mx-auto mb-2" />
                    <p className="font-semibold">Public</p>
                    <p className="text-xs mt-1 opacity-70">Anyone can join</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, tournamentVisibility: 'private' }))}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      formData.tournamentVisibility === 'private'
                        ? 'bg-purple-500/20 border-purple-500 text-white'
                        : 'bg-[#13111c] border-[#3d3551] text-gray-400 hover:border-purple-500/50'
                    }`}
                  >
                    <Lock className="h-5 w-5 mx-auto mb-2" />
                    <p className="font-semibold">Private</p>
                    <p className="text-xs mt-1 opacity-70">Invite only</p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Prize Pool */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Prize Pool (Optional)</h3>
                <button
                  type="button"
                  onClick={addPrize}
                  className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1"
                >
                  <DollarSign className="h-4 w-4" />
                  Add Prize Position
                </button>
              </div>

              {/* Entry Fee */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Entry Fee
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.entryFee ?? 0}
                  onChange={(e) => setFormData(prev => ({ ...prev, entryFee: Number(e.target.value) || 0 }))}
                  placeholder="0"
                  className="w-full px-4 py-3 bg-[#13111c] border border-[#3d3551] rounded text-white focus:outline-none focus:border-purple-500"
                />
                <p className="text-xs text-gray-400 mt-1">Set 0 for free tournaments.</p>
              </div>

              <div className="space-y-3">
                {formData.prizeConfig.map((prize, index) => (
                  <div key={index} className="flex items-center gap-3 bg-[#13111c] border border-[#3d3551] rounded-lg p-4">
                    <Trophy className={`h-5 w-5 flex-shrink-0 ${
                      index === 0 ? 'text-yellow-400' :
                      index === 1 ? 'text-gray-300' :
                      index === 2 ? 'text-orange-400' :
                      'text-purple-400'
                    }`} />
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">
                          Position #{prize.position}
                        </label>
                        <select
                          value={prize.prizeType || 'money'}
                          onChange={(e) => updatePrizeType(index, e.target.value as 'money' | 'custom')}
                          className="w-full px-3 py-2 bg-[#1a1625] border border-[#3d3551] rounded text-white text-sm focus:outline-none focus:border-purple-500"
                        >
                          <option value="money">Money</option>
                          <option value="custom">Custom Prize</option>
                        </select>
                      </div>
                      {prize.prizeType !== 'custom' ? (
                        <>
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">
                              Amount
                            </label>
                            <input
                              type="text"
                              value={prize.amount}
                              onChange={(e) => updatePrize(index, 'amount', e.target.value)}
                              placeholder="Amount"
                              className="w-full px-3 py-2 bg-[#1a1625] border border-[#3d3551] rounded text-white text-sm focus:outline-none focus:border-purple-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">
                              Currency
                            </label>
                            <select
                              value={prize.currency}
                              onChange={(e) => updatePrize(index, 'currency', e.target.value)}
                              className="w-full px-3 py-2 bg-[#1a1625] border border-[#3d3551] rounded text-white text-sm focus:outline-none focus:border-purple-500"
                            >
                              {CURRENCIES.map((curr) => (
                                <option key={curr} value={curr}>
                                  {curr}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div />
                        </>
                      ) : (
                        <>
                          <div className="md:col-span-2">
                            <label className="block text-xs text-gray-400 mb-1">
                              Custom Prize
                            </label>
                            <input
                              type="text"
                              value={prize.customPrize || ''}
                              onChange={(e) => updatePrize(index, 'customPrize', e.target.value)}
                              placeholder="e.g., Amazon voucher, Esports Keyboard, Gift Hamper"
                              className="w-full px-3 py-2 bg-[#1a1625] border border-[#3d3551] rounded text-white text-sm focus:outline-none focus:border-purple-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">
                              Value
                            </label>
                            <input
                              type="text"
                              value={prize.customPrizeValue || ''}
                              onChange={(e) => updatePrize(index, 'customPrizeValue', e.target.value)}
                              placeholder="e.g., 100 USD"
                              className="w-full px-3 py-2 bg-[#1a1625] border border-[#3d3551] rounded text-white text-sm focus:outline-none focus:border-purple-500"
                            />
                          </div>
                        </>
                      )}
                    </div>
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removePrize(index)}
                        className="text-red-400 hover:text-red-300 p-2"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-start gap-2 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <Info className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-300">
                  Prize pool is optional. You can use cash amount, custom prizes (e.g., Amazon vouchers), or both.
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Rules */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Tournament Rules</h3>
                <button
                  type="button"
                  onClick={addRule}
                  className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1"
                >
                  Add Rule
                </button>
              </div>

              <div className="space-y-3">
                {formData.rules.map((rule, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <span className="text-gray-400 text-sm mt-3">{index + 1}.</span>
                    <textarea
                      value={rule}
                      onChange={(e) => updateRule(index, e.target.value)}
                      placeholder="Enter tournament rule..."
                      rows={2}
                      className="flex-1 px-4 py-3 bg-[#13111c] border border-[#3d3551] rounded text-white focus:outline-none focus:border-purple-500 resize-none"
                    />
                    {formData.rules.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRule(index)}
                        className="text-red-400 hover:text-red-300 p-2 mt-2"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Sponsors Section */}
              <div className="space-y-4 mt-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">Sponsors (Optional)</h3>
                  <button
                    type="button"
                    onClick={addSponsor}
                    className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1"
                  >
                    Add Sponsor
                  </button>
                </div>

                <div className="space-y-3">
                  {(formData.sponsors || []).map((sponsor, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <span className="text-gray-400 text-sm mt-3">{index + 1}.</span>
                      <input
                        type="text"
                        value={sponsor}
                        onChange={(e) => updateSponsor(index, e.target.value)}
                        placeholder="Enter sponsor name..."
                        className="flex-1 px-4 py-3 bg-[#13111c] border border-[#3d3551] rounded text-white focus:outline-none focus:border-purple-500"
                      />
                      {(formData.sponsors || []).length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSponsor(index)}
                          className="text-red-400 hover:text-red-300 p-2 mt-2"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex items-start gap-2 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <Info className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-300">
                    Add tournament sponsors to display on the tournament page.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#3d3551]">
            <Button
              type="button"
              onClick={() => {
                if (currentStep === 1) {
                  onClose();
                  resetForm();
                } else {
                  setCurrentStep(currentStep - 1);
                }
              }}
              className="bg-[#13111c] hover:bg-[#1a1625] text-white"
            >
              {currentStep === 1 ? 'Cancel' : 'Back'}
            </Button>

            <div className="text-sm text-gray-400">
              Step {currentStep} of {totalSteps}
            </div>

            {currentStep < totalSteps ? (
              <Button
                type="button"
                onClick={() => {
                  if (validateCurrentStep()) {
                    setCurrentStep(currentStep + 1);
                  }
                }}
                className="bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] hover:from-[#A78BFA] hover:to-[#7C3AED]"
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                className="bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] hover:from-[#A78BFA] hover:to-[#7C3AED]"
              >
                Create Tournament
              </Button>
            )}
          </div>
        </form>
      </div>

      {cropperImage && cropperMode && (
        <ImageCropper
          imageSrc={cropperImage}
          isCircular={true}
          onCropComplete={applyCroppedImage}
          onCancel={() => {
            setCropperImage(null);
            setCropperMode(null);
          }}
        />
      )}
    </div>
  );
}
