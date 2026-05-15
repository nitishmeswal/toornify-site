import { useState, useEffect } from "react";
import { Search, Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Loader } from "@/components/ui/Loader";
import { gameService } from "@/lib/services";
import type { Game } from "@/lib/services/game.service";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { BackgroundEffects } from "@/components/BackgroundEffects";
import { urlFor } from "@/lib/sanity-client";

export function Games() {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await gameService.getAll();
      setGames(data);
    } catch (err: any) {
      console.error('Failed to fetch games:', err);
      setError(err.message || 'Failed to load games');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredGames = games.filter(game =>
    game.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1625] via-[#13111c] to-[#0f0b15] py-12 px-4 relative overflow-hidden">
      <BackgroundEffects />
      <div className="max-w-[1920px] mx-auto relative z-10">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Games
          </h1>
          <p className="text-gray-400 text-lg">
            Browse all available games and find tournaments
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search games..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-[#18152a] border border-[#3d3551] rounded text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all backdrop-blur-sm"
            />
          </div>
        </div>

        {/* Games Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader size="lg" />
          </div>
        ) : error ? (
          <Card className="bg-red-900/20 border-red-700">
            <CardContent className="pt-6">
              <p className="text-red-400 text-center">{error}</p>
              <Button
                onClick={fetchGames}
                variant="outline"
                className="mt-4 mx-auto block"
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : filteredGames.length === 0 ? (
          <div className="text-center py-20">
            <Gamepad2 className="h-20 w-20 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">
              {searchTerm ? 'No games found matching your search' : 'No games available'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredGames.map((game, index) => (
              <GameCard key={game._id} game={game} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function GameCard({ game, index }: { game: Game; index: number }) {
  // Get the image URL - prioritize gameBannerPhoto, fallback to image
  const imageSource = game.gameBannerPhoto || game.image;
  
  // Handle different image formats
  let imageUrl: string | null = null;
  
  if (imageSource) {
    // If it's already a full URL (starts with http/https), use it directly
    if (typeof imageSource === 'string' && (imageSource.startsWith('http://') || imageSource.startsWith('https://'))) {
      imageUrl = imageSource;
    } 
    // If it's a valid Sanity asset object or reference, use urlFor
    else if (typeof imageSource === 'object' || (typeof imageSource === 'string' && !imageSource.includes('image-') && !imageSource.includes('-webp'))) {
      try {
        imageUrl = urlFor(imageSource).width(600).height(400).url();
      } catch (error) {
        console.warn('Failed to build Sanity image URL:', error);
      }
    }
    // For malformed Sanity references, try to construct CDN URL manually
    else if (typeof imageSource === 'string' && imageSource.includes('image-')) {
      // Extract the asset ID and try to construct a proper Sanity CDN URL
      const match = imageSource.match(/image-([a-f0-9-]+)-(webp|jpg|png|gif)/i);
      if (match) {
        const [, assetId, format] = match;
        imageUrl = `https://cdn.sanity.io/images/gblobdeg/production/${assetId}.${format}`;
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link to={`/tournaments?game=${game._id}`}>
        <Card className="bg-gradient-to-b from-[#1f1a2e] to-[#18152a] border border-[#3d3551] hover:border-purple-500/50 transition-all cursor-pointer overflow-hidden h-full group backdrop-blur-sm">
          <div className="relative h-48 bg-gradient-to-br from-[#1f1a2e] to-[#18152a] overflow-hidden">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={game.name}
                className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Gamepad2 className="h-16 w-16 text-purple-400/50" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <CardHeader>
            <CardTitle className="text-white group-hover:text-purple-400 transition-colors">
              {game.name}
            </CardTitle>
            {game.description && (
              <CardDescription className="text-gray-400 line-clamp-2">
                {game.description}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {game.category && (
                <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full border border-purple-500/30">
                  {game.category}
                </span>
              )}
              {game.platform && game.platform.length > 0 && (
                <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full border border-purple-500/30">
                  {game.platform[0]}
                  {game.platform.length > 1 && ` +${game.platform.length - 1}`}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
