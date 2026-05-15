import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { sanityService, type SanityNewsPost } from '@/lib/services/sanity.service';
import { urlFor } from '@/lib/sanity-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loader } from '@/components/ui/Loader';
import { ExternalLink, Calendar, TrendingUp, Gamepad2, Trophy, Newspaper } from 'lucide-react';
import { BackgroundEffects } from '@/components/BackgroundEffects';

interface NewsItem {
  id: string;
  title: string;
  description: string;
  url?: string;
  image?: string;
  publishedAt: string;
  sourceName: string;
  categories: string[];
}

const iconMap: Record<string, typeof Newspaper> = {
  all: Newspaper,
  esports: Trophy,
  gaming: Gamepad2,
  tournament: TrendingUp,
  tournaments: TrendingUp,
  update: Newspaper,
  community: Newspaper,
  'patch-notes': Newspaper,
};

const normalizeCategory = (value: string): string =>
  value.trim().toLowerCase().replace(/\s+/g, '-');

const formatCategoryLabel = (value: string): string =>
  value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const extractPlainText = (content: any[] = []): string =>
  content
    .filter((block: any) => block?._type === 'block' && Array.isArray(block.children))
    .flatMap((block: any) => block.children)
    .map((child: any) => child?.text || '')
    .join(' ');

const deriveDynamicCategory = (post: SanityNewsPost): string => {
  const haystack = `${post.title || ''} ${post.excerpt || ''} ${extractPlainText(post.content)}`.toLowerCase();

  if (/(tournament|bracket|qualifier|final|playoff|league)/.test(haystack)) return 'tournament';
  if (/(esports|esport|pro team|competitive|scrim|ranked)/.test(haystack)) return 'esports';
  if (/(patch|update|release notes|hotfix|maintenance|version)/.test(haystack)) return 'update';
  if (/(community|creator|discord|event|fan|streamer)/.test(haystack)) return 'community';
  return 'gaming';
};

export function News() {
  const [articles, setArticles] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = useMemo(() => {
    const dynamic = Array.from(
      new Set(articles.flatMap((article) => article.categories).filter(Boolean)),
    ).sort();

    return [
      { id: 'all', label: 'All News', icon: Newspaper },
      ...dynamic.map((category) => ({
        id: category,
        label: formatCategoryLabel(category),
        icon: iconMap[category] || Newspaper,
      })),
    ];
  }, [articles]);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(null);

      const sanityNews = await sanityService.getAllNews();

      const transformed: NewsItem[] = sanityNews.map((post: SanityNewsPost) => {
        const fallbackDescription = extractPlainText(post.content).slice(0, 220);
        const categories = (post.categories && post.categories.length > 0
          ? post.categories
          : post.category
            ? [post.category]
            : [deriveDynamicCategory(post)])
          .map(normalizeCategory);

        return {
          id: post._id,
          title: post.title,
          description: post.excerpt || fallbackDescription || 'Read the latest update from Toornify News.',
          url: post.sourceUrl,
          image: post.featuredImage ? urlFor(post.featuredImage).width(800).height(420).url() : undefined,
          publishedAt: post.modifiedAt || post.scheduledAt || post.publishedAt || post._createdAt,
          sourceName: 'Toornify News',
          categories,
        };
      });

      setArticles(transformed);
    } catch (err: any) {
      console.error('Failed to fetch news:', err);
      setError('Failed to load news. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
    });
  };

  const filteredArticles = selectedCategory === 'all'
    ? articles
    : articles.filter((article) => article.categories.includes(selectedCategory));

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1625] via-[#13111c] to-[#0f0b15] relative overflow-hidden">
      <BackgroundEffects />
      
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 pb-12 pt-2 mt-10 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-4xl lg:text-5xl font-bold pb-2 text-white drop-shadow-lg uppercase tracking-wider">
            Gaming News
          </h1>
          <p className="text-gray-200 text-lg max-w-2xl font-medium">
            Stay updated with the latest gaming and esports news from around the world
          </p>
        </motion.div>

        {/* Category Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  className={`
                    ${selectedCategory === category.id
                      ? 'bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] hover:from-purple-700 hover:to-purple-800 text-white'
                      : 'bg-gray-700 hover:bg-gray-800 border-gray-600 text-gray-200'
                    } px-6 py-3 rounded-xl transition-all duration-300
                  `}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {category.label}
                </Button>
              );
            })}
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader size="lg" />
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto"
          >
            <Card className="bg-red-500/10 border-red-500/50">
              <CardContent className="pt-6">
                <p className="text-red-400 text-center">{error}</p>
                <Button
                  onClick={fetchNews}
                  className="w-full mt-4 bg-red-500 hover:bg-red-600"
                >
                  Try Again
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* News Grid */}
        {!loading && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredArticles.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="bg-gradient-to-b from-[#1f1a2e] to-[#18152a] border border-[#3d3551] hover:border-purple-500 transition-all duration-300 h-full flex flex-col group overflow-hidden backdrop-blur-sm">
                  {/* Image */}
                  {article.image && (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        crossOrigin="anonymous"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/400x200?text=Gaming+News';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#18152a] to-transparent opacity-60" />
                    </div>
                  )}

                  <CardHeader className="flex-1">
                    {/* Source & Date */}
                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                      <span className="px-2 py-1 bg-violet-500/20 text-violet-400 rounded-full">
                        {formatCategoryLabel(article.categories[0] || 'news')}
                      </span>
                      <span className="text-gray-600">•</span>
                      <span className="text-violet-300">{article.sourceName}</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(article.publishedAt)}
                      </span>
                    </div>

                    {/* Title */}
                    <CardTitle className="text-white text-lg mb-2 line-clamp-2 group-hover:text-violet-400 transition-colors">
                      {article.title}
                    </CardTitle>

                    {/* Description */}
                    <p className="text-gray-400 text-sm line-clamp-3">
                      {article.description}
                    </p>
                  </CardHeader>

                  <CardContent className="pt-0 pb-6">
                    {article.url ? (
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300 text-sm font-medium transition-colors"
                      >
                        Read More
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    ) : (
                      <span className="inline-flex items-center gap-2 text-gray-500 text-sm font-medium">
                        Internal Update
                      </span>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredArticles.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <Newspaper className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No News Found</h3>
            <p className="text-gray-400">
              Try selecting a different category or check back later.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default News;
